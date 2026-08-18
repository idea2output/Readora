import { getBookBySlug } from '@/lib/db/books';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ReaderLayout from '@/components/reader/reader-layout';
import { getQuranFoundationSurahs, getQuranFoundationVerses } from '@/lib/quran/quran-foundation';
import { getVisibleQuranResources } from '@/lib/quran/quran-foundation-server';
import { isMockOrPlaceholderContent, syncGutenbergBookChapters } from '@/lib/gutenberg/sync';

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

  // Provider-Aware Reading Behavior: OpenStax Link/Integrate Model
  const rightsRecord = Array.isArray(book.book_rights) ? book.book_rights[0] : book.book_rights;
  const sourceId = rightsRecord?.source_id || book.source_id;
  const isOpenStax = sourceId === 'openstax' || book.publisher === 'OpenStax' || (book.source_url && book.source_url.includes('openstax.org'));

  if (isOpenStax) {
    const targetUrl = book.reader_url || book.source_url || `https://openstax.org/books/${book.slug}`;
    redirect(targetUrl);
  }

  // Fetch chapters for this book from Supabase
  const supabase = await createClient();
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, title, sequence_number, content')
    .eq('book_id', book.id)
    .order('sequence_number', { ascending: true });

  let finalChapters = chapters || [];
  let visibleTranslations: any[] = [];
  let visibleReciters: any[] = [];
  let visibleTafsirs: any[] = [];

  // Live Quran Foundation API v4 Integration strictly for Islamic works
  const isIslamicWork =
    resolvedParams.slug === 'holy-quran-arabic' ||
    resolvedParams.slug?.includes('quran') ||
    resolvedParams.slug?.includes('tafsir') ||
    resolvedParams.slug?.includes('bukhari') ||
    resolvedParams.slug?.includes('muslim') ||
    resolvedParams.slug?.includes('hadith') ||
    resolvedParams.slug?.includes('salihin') ||
    resolvedParams.slug?.includes('muwatta') ||
    resolvedParams.slug?.includes('nawawi') ||
    book.source_id === 'quran-foundation';

  if (isIslamicWork) {
    try {
      const surahs = await getQuranFoundationSurahs();
      visibleTranslations = await getVisibleQuranResources("translation");
      visibleReciters = await getVisibleQuranResources("reciter");
      visibleTafsirs = await getVisibleQuranResources("tafsir");

      if (surahs && surahs.length > 0) {
        const quranFoundationChapters = [];
        for (const surah of surahs) {
          const verses = await getQuranFoundationVerses(surah.id);
          const versesHtml = verses
            .map(
              (v: any) =>
                `<div id="verse-block-${surah.id}-${v.verse_key.split(':')[1]}" class="my-4 p-3.5 rounded-2xl border border-border/40 hover:border-amber-700/40 transition-all space-y-2 bg-background/50"><div class="text-right" dir="rtl"><span id="verse-${surah.id}-${v.verse_key.split(':')[1]}" class="inline-block mx-1 quran-text notranslate p-1 rounded-xl transition-all text-slate-900 dark:text-amber-100" lang="ar" dir="rtl" translate="no">${v.text_uthmani}</span> <span class="inline-flex items-center justify-center w-8 h-8 text-xs rounded-full border border-amber-800/40 text-amber-950 dark:text-amber-200 bg-amber-500/10 mx-1 font-mono font-bold">﴿${v.verse_key.split(':')[1]}﴾</span></div><div id="translation-${surah.id}-${v.verse_key.split(':')[1]}" class="quran-translation-container text-left text-sm text-muted-foreground font-medium pt-1 border-t border-border/40 mt-2"></div></div>`
            )
            .join(' ');

          quranFoundationChapters.push({
            id: `quran-foundation-surah-${surah.id}`,
            sequence_number: surah.id,
            verses_count: surah.verses_count,
            name_simple: surah.name_simple,
            name_arabic: surah.name_arabic,
            title: `Surah ${surah.name_simple} (${surah.name_arabic})`,
            content: `
              <div dir="rtl" class="text-right space-y-6">
                <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-800/30 text-center text-xs font-bold text-amber-950 dark:text-amber-200 mb-6">
                  Sourced Directly from Quran Foundation (Quran.com) API • Official QPC Hafs Font • ${book.title}
                </div>
                ${surah.bismillah_pre ? '<p class="quran-text text-3xl md:text-4xl text-amber-950 dark:text-amber-200 font-extrabold text-center mb-8 notranslate" lang="ar" dir="rtl" translate="no">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>' : ''}
                <div class="space-y-4">
                  ${versesHtml}
                </div>
              </div>
            `,
          });
        }

        if (quranFoundationChapters.length > 0) {
          finalChapters = quranFoundationChapters;
        }
      }
    } catch (err) {
      console.error('Quran Foundation API live fetch error:', err);
    }
  } else {
    // Check if chapters are empty OR contain mock Latin/placeholder text
    const hasMockText = finalChapters.length > 0 && isMockOrPlaceholderContent(finalChapters[0]?.content || '');

    if (finalChapters.length === 0 || hasMockText) {
      // On-demand Gutenberg synchronization
      const syncedChapters = await syncGutenbergBookChapters(book.id, book.source_url, book.slug);
      if (syncedChapters && syncedChapters.length > 0) {
        finalChapters = syncedChapters;
      }
    }
  }

  // Clean Fallback for non-OpenStax books when text synchronization is pending
  if (finalChapters.length === 0 || isMockOrPlaceholderContent(finalChapters[0]?.content || '')) {
    const authorName = Array.isArray(book.authors) ? book.authors[0]?.name : book.authors?.name;
    const authorDisplayName = authorName || 'Literary Harbour Open Library';

    finalChapters = [
      {
        id: "default-ch-1",
        sequence_number: 1,
        title: "Volume Overview",
        content: `
          <div class="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-center space-y-4 max-w-xl mx-auto my-8">
            <h3 class="font-serif text-xl font-bold text-foreground">${book.title}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">
              This open-access edition by <strong>${authorDisplayName}</strong> is cataloged under Literary Harbour Rights Governance.
            </p>
            <p class="text-xs text-amber-800 dark:text-amber-300 font-semibold">
              Full text synchronization for this volume is currently processing from open mirrors. Please check back shortly.
            </p>
          </div>
        `
      }
    ];
  }

  return (
    <ReaderLayout
      book={book}
      chapters={finalChapters}
      visibleTranslations={visibleTranslations}
      visibleReciters={visibleReciters}
      visibleTafsirs={visibleTafsirs}
    />
  );
}
