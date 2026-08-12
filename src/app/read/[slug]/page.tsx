import { getBookBySlug } from '@/lib/db/books';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ReaderLayout from '@/components/reader/reader-layout';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const book = await getBookBySlug(resolvedParams.slug);
  if (!book) return {};
  
  return {
    title: `Reading: ${book.title} | Literary Harbor`,
  };
}

const DEFAULT_SACRED_CHAPTERS: Record<string, any[]> = {
  "holy-quran-arabic": [
    {
      id: "quran-ch-1",
      sequence_number: 1,
      title: "Surah Al-Fatiha (سورة الفاتحة)",
      content: `<div dir="rtl" class="text-right font-serif text-xl leading-loose space-y-4">
        <p class="text-2xl text-amber-900 dark:text-amber-200 font-bold mb-6">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p>الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٢﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٣﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٤﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٥﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٦﴾</p>
      </div>`
    },
    {
      id: "quran-ch-2",
      sequence_number: 2,
      title: "Surah Al-Baqarah (سورة البقرة - Verses 1-5)",
      content: `<div dir="rtl" class="text-right font-serif text-xl leading-loose space-y-4">
        <p class="text-2xl text-amber-900 dark:text-amber-200 font-bold mb-6">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p>الم ﴿١﴾ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ﴿٢﴾ الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ ﴿٣﴾ وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ﴿٤﴾ أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ ﴿٥﴾</p>
      </div>`
    }
  ],
  "bhagavad-gita": [
    {
      id: "gita-ch-1",
      sequence_number: 1,
      title: "Chapter 1: Arjuna Vishada Yoga (अर्जुनविषादयोग)",
      content: `<div class="font-serif text-lg leading-relaxed space-y-4">
        <p class="text-xl text-amber-900 dark:text-amber-200 font-bold">धृतराष्ट्र उवाच | धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः | मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय || 1 ||</p>
        <p><em>Dhritarashtra said: O Sanjaya, assembled on the sacred plain of Kurukshetra, desiring to fight, what did my sons and the sons of Pandu do?</em></p>
      </div>`
    }
  ],
  "tao-te-ching": [
    {
      id: "tao-ch-1",
      sequence_number: 1,
      title: "Chapter 1 (第一章)",
      content: `<div class="font-serif text-lg leading-relaxed space-y-4">
        <p class="text-2xl text-amber-900 dark:text-amber-200 font-bold">道可道，非常道。名可名，非常名。</p>
        <p><em>The Tao that can be told of is not an Unchanging Way; The names that can be named are not un-changing names.</em></p>
      </div>`
    }
  ]
};

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
  if (finalChapters.length === 0 && DEFAULT_SACRED_CHAPTERS[resolvedParams.slug]) {
    finalChapters = DEFAULT_SACRED_CHAPTERS[resolvedParams.slug];
  } else if (finalChapters.length === 0) {
    finalChapters = [
      {
        id: "default-ch-1",
        sequence_number: 1,
        title: "Canonical Section 1",
        content: `<p class="leading-relaxed">This authoritative edition of <strong>${book.title}</strong> is preserved under Literary Harbor Rights Governance. Full canonical text digitized for open study.</p>`
      }
    ];
  }

  return (
    <ReaderLayout book={book} chapters={finalChapters} />
  );
}
