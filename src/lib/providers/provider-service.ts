import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = "https://dxtdkmszrgwncxuukpor.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGRrbXN6cmd3bmN4dXVrcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0Njg2OTgsImV4cCI6MjEwMjA0NDY5OH0.GkFXEllSK-x1Ojpa8ui69gSjRK64YbsGPaAQYRMoeio";

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY;
  return createSupabaseClient(url, key);
}

import { createClient } from '@supabase/supabase-js';

export interface LibraryProvider {
  id: string;
  name: string;
  slug: string;
  provider_type: 'academic' | 'public_domain' | 'sacred_texts' | 'partner';
  website_url: string;
  license: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderSyncLog {
  id: string;
  provider_id: string;
  started_at: string;
  completed_at: string;
  status: 'success' | 'failed' | 'partial';
  books_found: number;
  books_created: number;
  books_updated: number;
  books_failed: number;
  error_message?: string;
  triggered_by: string;
}

export interface OpenStaxBookRecord {
  id: string;
  provider_id: string;
  source_id: string;
  title: string;
  subtitle?: string;
  slug: string;
  authors: string[];
  description: string;
  subject: string;
  edition?: string;
  isbn?: string;
  publication_date?: string;
  source_url: string;
  reader_url: string;
  license: string;
  license_url: string;
  attribution_text: string;
  sync_status: 'pending' | 'approved' | 'published' | 'rejected' | 'archived';
  last_synced_at: string;
}

/**
 * Normalizes an external license string to Supabase `licenses.id`
 * Examples:
 * 'CC BY 4.0' -> 'cc-by'
 * 'CC BY-NC-SA 4.0' -> 'cc-by-nc-sa'
 */
export function normalizeLicenseId(licenseString: string): string {
  if (!licenseString) return 'cc-by';
  const lower = licenseString.toLowerCase();
  if (lower.includes('nc') && lower.includes('sa')) return 'cc-by-nc-sa';
  if (lower.includes('nc') && lower.includes('nd')) return 'cc-by-nc-nd';
  if (lower.includes('nc')) return 'cc-by-nc';
  if (lower.includes('sa')) return 'cc-by-sa';
  if (lower.includes('nd')) return 'cc-by-nd';
  if (lower.includes('by')) return 'cc-by';
  if (lower.includes('public domain') || lower.includes('cc0')) return 'public-domain';
  return 'cc-by';
}

const MEMORY_PROVIDERS: LibraryProvider[] = [
  {
    id: "openstax",
    name: "OpenStax",
    slug: "openstax",
    provider_type: "academic",
    website_url: "https://openstax.org",
    license: "CC BY 4.0 / CC BY-NC-SA 4.0",
    active: true,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-15T00:00:00Z",
  },
  {
    id: "gutenberg",
    name: "Project Gutenberg",
    slug: "project-gutenberg",
    provider_type: "public_domain",
    website_url: "https://www.gutenberg.org",
    license: "Public Domain / Gutenberg License",
    active: true,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-15T00:00:00Z",
  },
  {
    id: "quran-foundation",
    name: "Quran Foundation",
    slug: "quran-foundation",
    provider_type: "sacred_texts",
    website_url: "https://quran.foundation",
    license: "Verified Sacred Texts Rights Governance",
    active: true,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-15T00:00:00Z",
  }
];

const MEMORY_SYNC_LOGS: ProviderSyncLog[] = [];
const MEMORY_OPENSTAX_BOOKS: OpenStaxBookRecord[] = [];

export async function getLibraryProviders(): Promise<LibraryProvider[]> {
  return MEMORY_PROVIDERS;
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dxtdkmszrgwncxuukpor.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function getOpenStaxBooks(status?: string): Promise<OpenStaxBookRecord[]> {
  const supabase = getAdminClient();
  try {
    const { data: rightsRecords, error } = await supabase
      .from('book_rights')
      .select(`
        book_id, rights_status, license_id, attribution_text, source_id,
        books!inner (
          id, title, subtitle, slug, publication_year, genre, description, cover_url, source_url, license, status, admin_status, created_at, updated_at,
          authors ( name )
        )
      `)
      .eq('source_id', 'openstax');

    if (error) {
      console.error("[getOpenStaxBooks] Supabase query error:", error.message);
    } else if (rightsRecords && rightsRecords.length > 0) {
      console.log(`[getOpenStaxBooks] Found ${rightsRecords.length} OpenStax records in database:`, rightsRecords.map((r: any) => r.books?.slug));
      const dbBooks: OpenStaxBookRecord[] = rightsRecords.map((r: any) => {
        const b = r.books;
        const currentStatus = b.status || b.admin_status || 'review_pending';
        const authorName = Array.isArray(b.authors) 
          ? (b.authors[0]?.name || 'OpenStax Authors')
          : (b.authors?.name || 'OpenStax Authors');

        return {
          id: b.id,
          provider_id: 'openstax',
          source_id: b.slug,
          title: b.title,
          subtitle: b.subtitle || undefined,
          slug: b.slug,
          authors: [authorName],
          description: b.description || '',
          subject: b.genre || 'Academic',
          edition: 'Standard Edition',
          isbn: '',
          publication_date: b.publication_year ? `${b.publication_year}-01-01` : undefined,
          source_url: b.source_url || `https://openstax.org/details/books/${b.slug}`,
          reader_url: `https://openstax.org/books/${b.slug}`,
          license: b.license || 'CC BY 4.0',
          license_url: 'https://creativecommons.org/licenses/by/4.0/',
          attribution_text: r.attribution_text || `Access for free at ${b.source_url} by OpenStax.`,
          sync_status: currentStatus as any,
          last_synced_at: b.updated_at || b.created_at || new Date().toISOString(),
        };
      });

      if (status) {
        return dbBooks.filter(b => b.sync_status === status);
      }
      return dbBooks;
    }
  } catch (err) {
    console.warn("Database query for OpenStax books skipped or failed:", err);
  }

  return [];
}

export async function updateOpenStaxBookStatus(bookId: string, status: OpenStaxBookRecord['sync_status']): Promise<boolean> {
  const supabase = getAdminClient();
  const dbStatus = status;

  try {
    await supabase
      .from('books')
      .update({
        status: dbStatus,
        admin_status: dbStatus,
      })
      .or(`id.eq.${bookId},slug.eq.${bookId}`);
  } catch (err) {
    console.warn("Could not sync status to database:", err);
  }

  return true;
}

export async function getProviderSyncLogs(): Promise<ProviderSyncLog[]> {
  const supabase = getPublicClient();
  try {
    const { data, error } = await supabase
      .from('provider_sync_logs')
      .select('*')
      .eq('provider_id', 'openstax')
      .order('started_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as ProviderSyncLog[];
    }
  } catch (err) {
    console.warn("Database query for provider_sync_logs skipped or failed:", err);
  }
  return MEMORY_SYNC_LOGS;
}

/**
 * Persist OpenStax record to Supabase public.books, public.book_rights, and public.academic_metadata
 */
export async function persistOpenStaxBookToDatabase(record: OpenStaxBookRecord): Promise<void> {
  const supabase = getPublicClient();
  const normalizedLicense = normalizeLicenseId(record.license);

  // 1. Author lookup/upsert
  let authorId: string | null = null;
  const authorName = record.authors[0] || "OpenStax Authors";
  const authorSlug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  try {
    const { data: existingAuthor } = await supabase
      .from('authors')
      .select('id')
      .eq('name', authorName)
      .maybeSingle();

    if (existingAuthor) {
      authorId = existingAuthor.id;
    } else {
      const { data: newAuthor } = await supabase
        .from('authors')
        .insert({ name: authorName, slug: authorSlug })
        .select('id')
        .single();
      if (newAuthor) authorId = newAuthor.id;
    }
  } catch (err) {
    console.warn("Author lookup/insert skipped or failed:", err);
  }

  // 2. Check existing book in public.books by slug
  let bookId: string | null = null;
  try {
    const { data: existingBook } = await supabase
      .from('books')
      .select('id')
      .eq('slug', record.slug)
      .maybeSingle();

    const year = record.publication_date ? parseInt(record.publication_date.split('-')[0], 10) : new Date().getFullYear();
    const bookData = {
      title: record.title,
      subtitle: record.subtitle || null,
      slug: record.slug,
      author_id: authorId,
      publication_year: isNaN(year) ? new Date().getFullYear() : year,
      language: 'en',
      genre: record.subject,
      description: record.description,
      source_url: record.source_url,
      license: record.license,
      copyright_status: 'open_license',
      status: record.sync_status === 'published' ? 'published' : 'review_pending',
      admin_status: record.sync_status === 'published' ? 'published' : 'review_pending',
      updated_at: new Date().toISOString(),
    };

    if (existingBook) {
      bookId = existingBook.id;
      await supabase.from('books').update(bookData).eq('id', bookId);
    } else {
      const { data: insertedBook } = await supabase
        .from('books')
        .insert(bookData)
        .select('id')
        .single();
      if (insertedBook) bookId = insertedBook.id;
    }

    if (bookId) {
      // 3. Upsert public.book_rights
      await supabase.from('book_rights').upsert({
        book_id: bookId,
        rights_status: 'OPEN_LICENSE',
        license_id: normalizedLicense,
        source_id: 'openstax',
        rights_jurisdiction: 'Global',
        host_allowed: false,
        download_allowed: false,
        ai_process_allowed: false,
        commercial_allowed: !normalizedLicense.includes('nc'),
        derivative_allowed: !normalizedLicense.includes('nd'),
        attribution_required: true,
        attribution_text: record.attribution_text,
        rights_verified_at: new Date().toISOString(),
        verified_by: 'SYSTEM',
      });

      // 4. Upsert public.academic_metadata
      await supabase.from('academic_metadata').upsert({
        book_id: bookId,
        isbn: record.isbn || null,
        publisher: 'OpenStax',
        publication_year: isNaN(year) ? new Date().getFullYear() : year,
        subject_discipline: record.subject,
        abstract: record.description,
        open_access_status: true,
      });
    }
  } catch (err) {
    console.error("Failed to persist OpenStax book to database:", err);
  }
}

/**
 * Persist ProviderSyncLog to Supabase provider_sync_logs & audit_logs
 */
export async function persistSyncLogToDatabase(log: ProviderSyncLog): Promise<void> {
  const supabase = getPublicClient();
  try {
    await supabase.from('provider_sync_logs').insert({
      provider_id: 'openstax',
      started_at: log.started_at,
      completed_at: log.completed_at,
      status: log.status,
      books_found: log.books_found,
      books_created: log.books_created,
      books_updated: log.books_updated,
      books_failed: log.books_failed,
      error_message: log.error_message || null,
      triggered_by: log.triggered_by,
    });

    await supabase.from('audit_logs').insert({
      admin_id: log.triggered_by,
      action: 'PROVIDER_SYNC',
      entity_type: 'provider',
      entity_id: 'openstax',
      details: {
        books_found: log.books_found,
        books_created: log.books_created,
        books_updated: log.books_updated,
      },
    });
  } catch (err) {
    console.warn("Sync log persistence warning:", err);
  }
}

import { executeOpenStaxCatalogSync as runOpenStaxSync } from '@/lib/providers/openstax';

export async function syncOpenStaxCatalog(triggeredBy: string = "Admin", limit?: number): Promise<ProviderSyncLog> {
  const startTime = new Date().toISOString();
  const result = await runOpenStaxSync({ triggeredBy, limit });
  return {
    id: result.logId || `log-${Date.now()}`,
    provider_id: "openstax",
    started_at: startTime,
    completed_at: new Date().toISOString(),
    status: result.success ? "success" : "failed",
    books_found: result.booksFound,
    books_created: result.booksCreated,
    books_updated: result.booksUpdated,
    books_failed: result.booksFailed,
    error_message: result.cmsError,
    triggered_by: triggeredBy,
  };
}
