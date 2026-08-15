import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { discoverOpenStaxCatalog } from './discover';
import { 
  OpenStaxNormalizedRecord, 
  OpenStaxSyncOptions, 
  OpenStaxSyncExecutionResult 
} from './types';

export * from './types';
export * from './catalog';
export * from './normalize';
export * from './verify';
export * from './discover';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dxtdkmszrgwncxuukpor.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(supabaseUrl, supabaseKey);
}

/**
 * Persists a normalized OpenStax textbook record into Supabase:
 * - public.authors
 * - public.books (status: 'review_pending', admin_status: 'review_pending')
 * - public.book_rights
 * - public.academic_metadata
 */
export async function persistOpenStaxRecordToDatabase(record: OpenStaxNormalizedRecord): Promise<"created" | "updated"> {
  const supabase = getSupabaseAdmin();
  let created = false;

  // 1. Author Resolution
  let authorId: string | null = null;
  const primaryAuthor = record.authors[0] || 'OpenStax Authors';
  const authorSlug = primaryAuthor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    const { data: existingAuthor } = await supabase
      .from('authors')
      .select('id')
      .eq('name', primaryAuthor)
      .maybeSingle();

    if (existingAuthor) {
      authorId = existingAuthor.id;
    } else {
      const { data: newAuthor } = await supabase
        .from('authors')
        .insert({ name: primaryAuthor, slug: authorSlug })
        .select('id')
        .single();
      if (newAuthor) authorId = newAuthor.id;
    }

    // 2. Book Resolution
    const { data: existingBook } = await supabase
      .from('books')
      .select('id')
      .eq('slug', record.slug)
      .maybeSingle();

    const bookData = {
      title: record.title,
      subtitle: record.subtitle,
      slug: record.slug,
      author_id: authorId,
      publication_year: record.publication_year,
      language: 'en',
      genre: record.subject,
      description: record.description,
      source_url: record.source_url,
      license: record.license,
      copyright_status: 'open_license',
      status: record.sync_status,
      admin_status: record.sync_status,
      updated_at: new Date().toISOString(),
    };

    let bookId: string | null = null;

    if (existingBook) {
      bookId = existingBook.id;
      await supabase.from('books').update(bookData).eq('id', bookId);
      created = false;
    } else {
      const { data: insertedBook } = await supabase
        .from('books')
        .insert(bookData)
        .select('id')
        .single();
      if (insertedBook) {
        bookId = insertedBook.id;
        created = true;
      }
    }

    if (bookId) {
      // 3. Upsert public.book_rights
      await supabase.from('book_rights').upsert({
        book_id: bookId,
        rights_status: 'OPEN_LICENSE',
        license_id: record.normalized_license_id,
        source_id: 'openstax',
        rights_jurisdiction: 'Global',
        host_allowed: false,
        download_allowed: false,
        ai_process_allowed: false,
        commercial_allowed: !record.normalized_license_id.includes('nc'),
        derivative_allowed: !record.normalized_license_id.includes('nd'),
        attribution_required: true,
        attribution_text: record.attribution_text,
        rights_verified_at: new Date().toISOString(),
        verified_by: 'SYSTEM',
      });

      // 4. Upsert public.academic_metadata
      await supabase.from('academic_metadata').upsert({
        book_id: bookId,
        isbn: record.isbn,
        publisher: 'OpenStax',
        publication_year: record.publication_year,
        subject_discipline: record.subject,
        abstract: record.description,
        open_access_status: true,
      });
    }
  } catch (err) {
    console.error(`Failed to persist OpenStax book ${record.slug} to database:`, err);
    throw err;
  }

  return created ? "created" : "updated";
}

/**
 * Core Catalog Synchronization Engine
 */
export async function executeOpenStaxCatalogSync(options: OpenStaxSyncOptions = {}): Promise<OpenStaxSyncExecutionResult> {
  const startTime = new Date().toISOString();
  const { triggeredBy = 'Admin', limit, dryRun = false } = options;

  const discoverySummary = await discoverOpenStaxCatalog();
  const itemsToProcess = typeof limit === 'number' && limit > 0 
    ? discoverySummary.items.slice(0, limit) 
    : discoverySummary.items;

  let createdCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;
  let failedCount = 0;
  let lastErrorMessage: string | undefined = discoverySummary.cms_error;

  if (dryRun) {
    itemsToProcess.forEach(item => {
      if (item.status === 'NEW') createdCount++;
      else if (item.status === 'UPDATED') updatedCount++;
      else unchangedCount++;
    });

    return {
      success: true,
      dryRun: true,
      cmsVerified: discoverySummary.cms_verified,
      cmsError: discoverySummary.cms_error,
      booksFound: itemsToProcess.length,
      booksCreated: createdCount,
      booksUpdated: updatedCount,
      booksUnchanged: unchangedCount,
      booksFailed: 0,
      message: `[DRY-RUN PREVIEW] Catalog analysis complete: ${createdCount} new, ${updatedCount} to update, ${unchangedCount} unchanged. No database changes made.`,
      diffSummary: discoverySummary,
    };
  }

  // Database Execution Phase
  for (const item of itemsToProcess) {
    try {
      const result = await persistOpenStaxRecordToDatabase(item.record);
      if (result === 'created') createdCount++;
      else updatedCount++;
    } catch (err: any) {
      failedCount++;
      lastErrorMessage = err.message || 'Database write error';
    }
  }

  const supabase = getSupabaseAdmin();
  let logId: string | undefined = undefined;

  try {
    const { data: logRecord } = await supabase.from('provider_sync_logs').insert({
      provider_id: 'openstax',
      started_at: startTime,
      completed_at: new Date().toISOString(),
      status: failedCount > 0 ? (createdCount > 0 || updatedCount > 0 ? 'partial' : 'failed') : 'success',
      books_found: itemsToProcess.length,
      books_created: createdCount,
      books_updated: updatedCount,
      books_failed: failedCount,
      error_message: lastErrorMessage || null,
      triggered_by: triggeredBy,
    }).select('id').single();

    if (logRecord) logId = logRecord.id;

    await supabase.from('audit_logs').insert({
      admin_id: triggeredBy,
      action: 'OPENSTAX_CATALOG_SYNC',
      entity_type: 'provider',
      entity_id: 'openstax',
      details: {
        books_found: itemsToProcess.length,
        books_created: createdCount,
        books_updated: updatedCount,
        cms_verified: discoverySummary.cms_verified,
        limit,
      },
    });
  } catch (err) {
    console.warn("Failed to write provider_sync_log to Supabase:", err);
  }

  return {
    success: failedCount === 0,
    dryRun: false,
    cmsVerified: discoverySummary.cms_verified,
    cmsError: discoverySummary.cms_error,
    booksFound: itemsToProcess.length,
    booksCreated: createdCount,
    booksUpdated: updatedCount,
    booksUnchanged: unchangedCount,
    booksFailed: failedCount,
    logId,
    message: `OpenStax catalog synchronization complete: ${createdCount} created, ${updatedCount} updated.`,
    diffSummary: discoverySummary,
  };
}
