import { getBookBySlug } from '@/lib/db/books';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ReaderLayout from '@/components/reader/reader-layout';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const book = await getBookBySlug(resolvedParams.slug);
  if (!book) return {};
  
  return {
    title: `Reading: ${book.title} | Readora`,
  };
}

export default async function ReadPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const book = await getBookBySlug(resolvedParams.slug);
  
  if (!book) {
    notFound();
  }

  // Fetch chapters for this book
  const supabase = await createClient();
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, title, sequence_number, content')
    .eq('book_id', book.id)
    .order('sequence_number', { ascending: true });

  return (
    <ReaderLayout book={book} chapters={chapters || []} />
  );
}
