import { createClient } from '@/utils/supabase/server';

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Supabase Error (getCategories):', error);
    return [];
  }
  return data;
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function getBooksByCategory(categoryId: string, page = 1, limit = 12) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from('book_categories')
    .select(`
      books (
        id, title, slug, cover_url, genre, description,
        authors ( name, slug )
      )
    `, { count: 'exact' })
    .eq('category_id', categoryId)
    .eq('books.status', 'published')
    .range(from, to);

  if (error) {
    console.error('Supabase Error (getBooksByCategory):', error);
    return { books: [], count: 0 };
  }
  
  // Flatten the response
  const books = data.map(row => row.books).filter(Boolean);
  return { books, count };
}
