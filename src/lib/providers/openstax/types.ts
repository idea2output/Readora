/**
 * OpenStax Catalog Architecture Types
 */

export interface OpenStaxRawRecord {
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
  source_url?: string;
  reader_url?: string;
  license: string;
  license_url?: string;
  attribution_text?: string;
}

export interface OpenStaxNormalizedRecord {
  provider_id: "openstax";
  source_id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  authors: string[];
  description: string;
  subject: string;
  edition: string;
  isbn: string | null;
  publication_date: string | null;
  publication_year: number;
  source_url: string;
  reader_url: string;
  license: string;
  normalized_license_id: string; // e.g. 'cc-by', 'cc-by-nc-sa'
  attribution_text: string;
  sync_status: "review_pending";
}

export interface OpenStaxDiffItem {
  slug: string;
  source_id: string;
  title: string;
  status: "NEW" | "UPDATED" | "UNCHANGED" | "UNVERIFIED";
  changes?: string[];
  record: OpenStaxNormalizedRecord;
}

export interface OpenStaxCatalogSummary {
  cms_verified: boolean;
  cms_error?: string;
  total_discovered: number;
  new_count: number;
  updated_count: number;
  unchanged_count: number;
  unverified_count: number;
  items: OpenStaxDiffItem[];
}

export interface OpenStaxSyncOptions {
  triggeredBy?: string;
  limit?: number;
  dryRun?: boolean;
}

export interface OpenStaxSyncExecutionResult {
  success: boolean;
  dryRun: boolean;
  cmsVerified: boolean;
  cmsError?: string;
  booksFound: number;
  booksCreated: number;
  booksUpdated: number;
  booksUnchanged: number;
  booksFailed: number;
  logId?: string;
  message: string;
  diffSummary?: OpenStaxCatalogSummary;
}
