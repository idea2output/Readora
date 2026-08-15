import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { loadMasterCatalog } from './catalog';
import { verifyOpenStaxCMS } from './verify';
import { 
  OpenStaxNormalizedRecord, 
  OpenStaxDiffItem, 
  OpenStaxCatalogSummary 
} from './types';

/**
 * Discovers OpenStax catalog, performs secondary CMS verification,
 * compares against Supabase database, and generates diff analysis.
 */
export async function discoverOpenStaxCatalog(): Promise<OpenStaxCatalogSummary> {
  const masterRecords = loadMasterCatalog();
  const cmsResult = await verifyOpenStaxCMS();

  // Merge discovered records (Primary: Master Catalog, Secondary: CMS)
  const recordMap = new Map<string, OpenStaxNormalizedRecord>();
  masterRecords.forEach(r => recordMap.set(r.slug, r));

  if (cmsResult.verified && cmsResult.records.length > 0) {
    cmsResult.records.forEach(cmsRec => {
      if (!recordMap.has(cmsRec.slug)) {
        recordMap.set(cmsRec.slug, cmsRec);
      }
    });
  }

  const allDiscovered = Array.from(recordMap.values());

  // Query Supabase for existing OpenStax records
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dxtdkmszrgwncxuukpor.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

  const existingMap = new Map<string, any>();
  try {
    const { data: existingRights } = await supabase
      .from('book_rights')
      .select(`
        book_id,
        books!inner (
          id, title, slug, genre, description, source_url, license, updated_at
        )
      `)
      .eq('source_id', 'openstax');

    if (existingRights) {
      existingRights.forEach((r: any) => {
        if (r.books?.slug) {
          existingMap.set(r.books.slug, r.books);
        }
      });
    }
  } catch (err) {
    console.warn("Could not fetch existing database records during discovery:", err);
  }

  let newCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;

  const diffItems: OpenStaxDiffItem[] = allDiscovered.map(record => {
    const existing = existingMap.get(record.slug);

    if (!existing) {
      newCount++;
      return {
        slug: record.slug,
        source_id: record.source_id,
        title: record.title,
        status: "NEW",
        changes: ["New textbook metadata discovered for catalog ingestion"],
        record,
      };
    }

    const changes: string[] = [];
    if (existing.title !== record.title) changes.push(`Title changed from "${existing.title}" to "${record.title}"`);
    if (existing.description !== record.description) changes.push("Description updated");
    if (existing.license !== record.license) changes.push(`License updated to ${record.license}`);

    if (changes.length > 0) {
      updatedCount++;
      return {
        slug: record.slug,
        source_id: record.source_id,
        title: record.title,
        status: "UPDATED",
        changes,
        record,
      };
    }

    unchangedCount++;
    return {
      slug: record.slug,
      source_id: record.source_id,
      title: record.title,
      status: "UNCHANGED",
      record,
    };
  });

  return {
    cms_verified: cmsResult.verified,
    cms_error: cmsResult.error,
    total_discovered: allDiscovered.length,
    new_count: newCount,
    updated_count: updatedCount,
    unchanged_count: unchangedCount,
    unverified_count: 0,
    items: diffItems,
  };
}
