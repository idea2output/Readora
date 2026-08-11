import { createClient } from '@/utils/supabase/server';

export async function getFeaturedBooks(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('books')
    .select(`
      id, title, slug, cover_url, author_id, genre, description,
      authors ( name, slug )
    `)
    .eq('status', 'published')
    .limit(limit);

  if (error) {
    console.error('Supabase Error (getFeaturedBooks):', error);
    return [];
  }
  return data;
}

export async function getBookBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('books')
    .select(`
      *,
      authors ( name, slug, biography ),
      book_categories (
        categories ( name, slug )
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function searchBooks(query: string, page = 1, limit = 12) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let request = supabase
    .from('books')
    .select(`
      id, title, slug, cover_url, author_id, genre, description,
      authors ( name, slug )
    `, { count: 'exact' })
    .eq('status', 'published');

  if (query) {
    // using postgres full text search
    request = request.textSearch('fts', query.split(' ').join(' | '));
  }

  const { data, count, error } = await request.range(from, to);
  
  if (error) {
    console.error('Supabase Error (searchBooks):', error);
    return { books: [], count: 0 };
  }
  return { books: data, count };
}
