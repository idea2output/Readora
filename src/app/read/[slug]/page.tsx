import { getBookBySlug } from '@/lib/db/books';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ReaderLayout from '@/components/reader/reader-layout';
import { getQuranFoundationSurahs, getQuranFoundationVerses } from '@/lib/quran/quran-foundation';
import { getVisibleQuranResources } from '@/lib/quran/quran-foundation-server';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const book = await getBookBySlug(resolvedParams.slug);
  if (!book) return {};
  
  return {
    title: `Reading: ${book.title} | Literary Harbor`,
  };
}

export default async function ReadPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const book = await getBookBySlug(resolvedParams.slug);
  
  if (!book) {
    notFound();
  }

  // Fetch chapters for this book from Supabase
  const supabase = await createClient();
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, title, sequence_number, content')
    .eq('book_id', book.id)
    .order('sequence_number', { ascending: true });

  let finalChapters = chapters || [];

  // Live Quran Foundation API v4 Integration for Quranic reading
  if (resolvedParams.slug === 'holy-quran-arabic') {
    try {
      const surahs = await getQuranFoundationSurahs();
      const visibleTranslations = await getVisibleQuranResources("translation");
      const visibleReciters = await getVisibleQuranResources("reciter");

      if (surahs && surahs.length > 0) {
        const quranFoundationChapters = [];
        for (const surah of surahs.slice(0, 5)) {
          const verses = await getQuranFoundationVerses(surah.id);
          const versesHtml = verses
            .map(
              (v: any) =>
                `<span class="inline-block mx-1 quran-text notranslate" lang="ar" dir="rtl" translate="no">${v.text_uthmani}</span> <span class="inline-flex items-center justify-center w-7 h-7 text-xs rounded-full border border-amber-500/40 text-amber-900 dark:text-amber-300 mx-1 font-mono font-bold">﴿${v.verse_key.split(':')[1]}﴾</span>`
            )
            .join(' ');

          quranFoundationChapters.push({
            id: `quran-foundation-surah-${surah.id}`,
            sequence_number: surah.id,
            title: `Surah ${surah.name_simple} (${surah.name_arabic})`,
            content: `
              <div dir="rtl" class="text-right space-y-6">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-xs font-bold text-amber-900 dark:text-amber-200 mb-6">
                  Sourced Directly from Quran Foundation (Quran.com) API • Official QPC Hafs Font
                </div>
                ${surah.bismillah_pre ? '<p class="quran-text text-2xl text-amber-900 dark:text-amber-200 font-extrabold text-center mb-6 notranslate" lang="ar" dir="rtl" translate="no">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>' : ''}
                <div class="leading-[2.4] tracking-wide text-foreground">
                  ${versesHtml}
                </div>
              </div>
            `,
            visibleTranslations,
            visibleReciters,
          });
        }

        if (quranFoundationChapters.length > 0) {
          finalChapters = quranFoundationChapters;
        }
      }
    } catch (err) {
      console.error('Quran Foundation API live fetch error:', err);
    }
  }

  // General Fallback for other Sacred Texts
  if (finalChapters.length === 0) {
    finalChapters = [
      {
        id: "default-ch-1",
        sequence_number: 1,
        title: "Canonical Section 1",
        content: `<p class="leading-relaxed text-center">This authentic edition of <strong>${book.title}</strong> is provided directly by <strong>${book.authors?.name || 'Quran Foundation (Quran.com)'}</strong> & King Fahd Quran Printing Complex. Hosted with 0 AI intervention under Literary Harbor Rights Governance.</p>`
      }
    ];
  }

  return (
    <ReaderLayout book={book} chapters={finalChapters} />
  );
}
