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

/**
 * Fetch all 114 Surahs directly from Quran Foundation API
 */
export async function getQuranFoundationSurahs(): Promise<QuranSurah[]> {
  try {
    const res = await fetch("https://api.quran.com/api/v4/chapters?language=en", {
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
  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterNumber}`,
      { next: { revalidate: 86400 } }
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
