import { OpenStaxRawRecord, OpenStaxNormalizedRecord } from './types';

/**
 * Maps raw license strings to normalized Supabase license IDs (public.licenses.id)
 */
export function normalizeLicenseId(rawLicense: string): string {
  const l = rawLicense.toLowerCase().trim();
  if (l.includes('nc') && l.includes('sa')) return 'cc-by-nc-sa';
  if (l.includes('nc') && l.includes('nd')) return 'cc-by-nc-nd';
  if (l.includes('nc')) return 'cc-by-nc';
  if (l.includes('sa')) return 'cc-by-sa';
  if (l.includes('nd')) return 'cc-by-nd';
  if (l.includes('by')) return 'cc-by';
  return 'cc-by';
}

/**
 * Normalizes raw OpenStax record into production OpenStaxNormalizedRecord
 */
export function normalizeOpenStaxRecord(raw: OpenStaxRawRecord): OpenStaxNormalizedRecord {
  const slug = raw.slug || raw.source_id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sourceUrl = `https://openstax.org/details/books/${slug}`;
  const readerUrl = `https://openstax.org/books/${slug}`;
  const normLicense = normalizeLicenseId(raw.license || 'CC BY 4.0');
  
  let pubYear = new Date().getFullYear();
  if (raw.publication_date) {
    const parsedYear = parseInt(raw.publication_date.split('-')[0], 10);
    if (!isNaN(parsedYear)) pubYear = parsedYear;
  }

  const attributionText = raw.attribution_text || `Access for free at ${sourceUrl} by OpenStax.`;

  return {
    provider_id: 'openstax',
    source_id: raw.source_id || slug,
    title: raw.title.trim(),
    subtitle: raw.subtitle ? raw.subtitle.trim() : null,
    slug,
    authors: raw.authors && raw.authors.length > 0 ? raw.authors : ['OpenStax Authors'],
    description: raw.description ? raw.description.trim() : '',
    subject: raw.subject ? raw.subject.trim() : 'Academic',
    edition: raw.edition ? raw.edition.trim() : 'Standard Edition',
    isbn: raw.isbn ? raw.isbn.trim() : null,
    publication_date: raw.publication_date || null,
    publication_year: pubYear,
    source_url: sourceUrl,
    reader_url: readerUrl,
    license: raw.license || 'CC BY 4.0',
    normalized_license_id: normLicense,
    attribution_text: attributionText,
    sync_status: 'review_pending',
  };
}
