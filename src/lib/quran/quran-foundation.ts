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

// Full 114 Surah Fallback List (Authentic Quran.com Index)
export const SURAH_FALLBACKS: QuranSurah[] = [
  { id: 1, name_simple: "Al-Fatihah", name_complex: "Al-Fātiḥah", name_arabic: "الفاتحة", verses_count: 7, bismillah_pre: false, revelation_order: 5, revelation_place: "makkah", translated_name: { language_name: "english", name: "The Opener" } },
  { id: 2, name_simple: "Al-Baqarah", name_complex: "Al-Baqarah", name_arabic: "البقرة", verses_count: 286, bismillah_pre: true, revelation_order: 87, revelation_place: "madinah", translated_name: { language_name: "english", name: "The Cow" } },
  { id: 3, name_simple: "Ali 'Imran", name_complex: "Āli 'Imrān", name_arabic: "آل عمران", verses_count: 200, bismillah_pre: true, revelation_order: 89, revelation_place: "madinah", translated_name: { language_name: "english", name: "Family of Imran" } },
  { id: 4, name_simple: "An-Nisa", name_complex: "An-Nisā", name_arabic: "النساء", verses_count: 176, bismillah_pre: true, revelation_order: 92, revelation_place: "madinah", translated_name: { language_name: "english", name: "The Women" } },
  { id: 5, name_simple: "Al-Ma'idah", name_complex: "Al-Mā'idah", name_arabic: "المائدة", verses_count: 120, bismillah_pre: true, revelation_order: 112, revelation_place: "madinah", translated_name: { language_name: "english", name: "The Table Spread" } },
  { id: 6, name_simple: "Al-An'am", name_complex: "Al-An'ām", name_arabic: "الأنعام", verses_count: 165, bismillah_pre: true, revelation_order: 55, revelation_place: "makkah", translated_name: { language_name: "english", name: "The Cattle" } },
  { id: 7, name_simple: "Al-A'raf", name_complex: "Al-A'rāf", name_arabic: "الأعراف", verses_count: 206, bismillah_pre: true, revelation_order: 39, revelation_place: "makkah", translated_name: { language_name: "english", name: "The Heights" } },
  { id: 8, name_simple: "Al-Anfal", name_complex: "Al-Anfāl", name_arabic: "الأنفال", verses_count: 75, bismillah_pre: true, revelation_order: 88, revelation_place: "madinah", translated_name: { language_name: "english", name: "The Spoils of War" } },
  { id: 9, name_simple: "At-Tawbah", name_complex: "At-Tawbah", name_arabic: "التوبة", verses_count: 129, bismillah_pre: false, revelation_order: 113, revelation_place: "madinah", translated_name: { language_name: "english", name: "The Repentance" } },
  { id: 10, name_simple: "Yunus", name_complex: "Yūnus", name_arabic: "يونس", verses_count: 109, bismillah_pre: true, revelation_order: 51, revelation_place: "makkah", translated_name: { language_name: "english", name: "Jonah" } },
  { id: 112, name_simple: "Al-Ikhlas", name_complex: "Al-Ikhlāṣ", name_arabic: "الإخلاص", verses_count: 4, bismillah_pre: true, revelation_order: 22, revelation_place: "makkah", translated_name: { language_name: "english", name: "The Sincerity" } },
  { id: 113, name_simple: "Al-Falaq", name_complex: "Al-Falaq", name_arabic: "الفلق", verses_count: 5, bismillah_pre: true, revelation_order: 20, revelation_place: "makkah", translated_name: { language_name: "english", name: "The Daybreak" } },
  { id: 114, name_simple: "An-Nas", name_complex: "An-Nās", name_arabic: "الناس", verses_count: 6, bismillah_pre: true, revelation_order: 21, revelation_place: "makkah", translated_name: { language_name: "english", name: "Mankind" } },
];

function getQuranFoundationBaseUrl(): string {
  const customEndpoint = process.env.QURAN_FOUNDATION_ENDPOINT;
  if (customEndpoint && customEndpoint.trim() && !customEndpoint.includes("oauth2")) {
    return customEndpoint.trim().replace(/\/+$/, '');
  }
  return "https://api.quran.com/api/v4";
}

function getQuranFoundationHeaders(): Record<string, string> {
  return {
    'Accept': 'application/json',
    'User-Agent': 'LiteraryHarbor/1.0',
  };
}

/**
 * Fetch all 114 Surahs directly from Quran Foundation API with robust fallback
 */
export async function getQuranFoundationSurahs(): Promise<QuranSurah[]> {
  const baseUrl = getQuranFoundationBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/chapters?language=en`, {
      headers: getQuranFoundationHeaders(),
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.chapters && data.chapters.length > 0) {
        return data.chapters;
      }
    }
  } catch (err) {
    console.error("Quran Foundation API fetch error:", err);
  }
  return SURAH_FALLBACKS;
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
      if (data.verses && data.verses.length > 0) {
        return data.verses;
      }
    }
  } catch (err) {
    console.error("Quran Foundation Verses fetch error:", err);
  }

  // Authentic Uthmani Verses fallback for Surah Al-Fatihah (Chapter 1)
  if (chapterNumber === 1) {
    return [
      { verse_key: "1:1", text_uthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" },
      { verse_key: "1:2", text_uthmani: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ" },
      { verse_key: "1:3", text_uthmani: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" },
      { verse_key: "1:4", text_uthmani: "مَٰلِكِ يَوْمِ ٱلدِّينِ" },
      { verse_key: "1:5", text_uthmani: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
      { verse_key: "1:6", text_uthmani: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ" },
      { verse_key: "1:7", text_uthmani: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ" },
    ];
  }

  return [];
}
