/**
 * Quran Foundation API Integration
 * Official API Endpoint: https://api.quran.com/api/v4/
 * Source: Quran Foundation (Quran.com) & King Fahd Quran Complex
 */

export interface QuranSurah {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  translated_name: {
    language_name: string;
    name: string;
  };
}

function getQuranFoundationBaseUrl(): string {
  const customEndpoint = process.env.QURAN_FOUNDATION_ENDPOINT;
  if (customEndpoint && customEndpoint.trim()) {
    return customEndpoint.trim().replace(/\/+$/, '');
  }
  return "https://api.quran.com/api/v4";
}

function getQuranFoundationHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  const clientId = process.env.QURAN_FOUNDATION_CLIENT_ID;
  const clientSecret = process.env.QURAN_FOUNDATION_CLIENT_SECRET;

  if (clientId) {
    headers['x-client-id'] = clientId;
    headers['x-api-key'] = clientId;
  }
  if (clientSecret) {
    headers['x-client-secret'] = clientSecret;
  }

  return headers;
}

/**
 * Fetch all 114 Surahs directly from Quran Foundation API
 */
export async function getQuranFoundationSurahs(): Promise<QuranSurah[]> {
  const baseUrl = getQuranFoundationBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/chapters?language=en`, {
      headers: getQuranFoundationHeaders(),
      next: { revalidate: 86400 }, // Cache for 24 hours
    });
    if (res.ok) {
      const data = await res.json();
      return data.chapters || [];
    }
  } catch (err) {
    console.error("Quran Foundation API fetch error:", err);
  }
  return [];
}

/**
 * Fetch Uthmani Script Verses for a Surah directly from Quran Foundation API
 */
export async function getQuranFoundationVerses(chapterNumber: number) {
  const baseUrl = getQuranFoundationBaseUrl();
  try {
    const res = await fetch(
      `${baseUrl}/quran/verses/uthmani?chapter_number=${chapterNumber}`,
      {
        headers: getQuranFoundationHeaders(),
        next: { revalidate: 86400 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.verses || [];
    }
  } catch (err) {
    console.error("Quran Foundation Verses fetch error:", err);
  }
  return [];
}
