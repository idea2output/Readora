import { OpenStaxRawRecord, OpenStaxNormalizedRecord } from './types';
import { normalizeOpenStaxRecord } from './normalize';

export interface CMSVerificationResult {
  verified: boolean;
  error?: string;
  records: OpenStaxNormalizedRecord[];
}

/**
 * Optional verification query to OpenStax Wagtail CMS endpoint.
 * Times out gracefully after 5 seconds to guarantee application resilience.
 */
export async function verifyOpenStaxCMS(): Promise<CMSVerificationResult> {
  const cmsEndpoint = "https://openstax.org/apps/cms/api/v2/pages/?type=books.Book&fields=title,authors,description,subjects,edition,isbn_13,publish_date,slug";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(cmsEndpoint, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LiteraryHarbour-OpenStaxDiscovery/1.0',
      },
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        verified: false,
        error: `CMS responded with HTTP ${res.status} ${res.statusText}`,
        records: [],
      };
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.items)) {
      return {
        verified: false,
        error: 'Invalid CMS JSON response structure (missing items array)',
        records: [],
      };
    }

    const records: OpenStaxNormalizedRecord[] = data.items.map((item: any) => {
      const raw: OpenStaxRawRecord = {
        source_id: item.slug || String(item.id),
        title: item.title,
        subtitle: item.subtitle,
        slug: item.slug || String(item.id),
        authors: Array.isArray(item.authors) ? item.authors.map((a: any) => a.name || String(a)) : [],
        description: item.description || '',
        subject: Array.isArray(item.subjects) ? (item.subjects[0]?.name || 'Academic') : 'Academic',
        edition: item.edition || 'Standard Edition',
        isbn: item.isbn_13 || item.isbn_10,
        publication_date: item.publish_date,
        source_url: `https://openstax.org/details/books/${item.slug}`,
        reader_url: `https://openstax.org/books/${item.slug}`,
        license: item.license || 'CC BY 4.0',
      };
      return normalizeOpenStaxRecord(raw);
    });

    return {
      verified: true,
      records,
    };
  } catch (err: any) {
    const errorMsg = err.name === 'AbortError' 
      ? 'CMS verification timed out after 5000ms' 
      : (err.message || 'CMS endpoint connection failed');
      
    return {
      verified: false,
      error: errorMsg,
      records: [],
    };
  }
}
