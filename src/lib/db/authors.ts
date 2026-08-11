import { createClient } from '@/utils/supabase/server';

export async function getAuthorBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function getAuthorBooks(authorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('books')
    .select('id, title, slug, cover_url, genre, publication_year')
    .eq('author_id', authorId)
    .eq('status', 'published');

  if (error) {
    console.error('Supabase Error (getAuthorBooks):', error);
    return [];
  }
  return data;
}
