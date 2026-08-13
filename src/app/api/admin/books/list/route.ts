import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: books, error } = await supabase
      .from('books')
      .select(`
        id, title, slug, cover_url, genre, source_url,
        authors ( name ),
        chapters ( id )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedBooks = (books || []).map((b: any) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      cover_url: b.cover_url,
      genre: b.genre,
      source_url: b.source_url,
      authors: b.authors,
      chapterCount: b.chapters ? b.chapters.length : 0
    }));

    return NextResponse.json({ books: formattedBooks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list books' }, { status: 500 });
  }
}
