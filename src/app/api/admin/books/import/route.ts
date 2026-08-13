import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await request.json();
    let gBook = body.gutenbergBook;

    // If only an ID was passed, fetch the full book from Gutendex
    if (!gBook && body.gutenbergId) {
      const res = await fetch(`https://gutendex.com/books/?ids=${body.gutenbergId}`);
      if (!res.ok) {
        return NextResponse.json({ error: `Could not find Gutenberg ID ${body.gutenbergId}` }, { status: 404 });
      }
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        return NextResponse.json({ error: `Book ID ${body.gutenbergId} not found.` }, { status: 404 });
      }
      gBook = data.results[0];
    }

    if (!gBook) {
      return NextResponse.json({ error: 'Missing gutenbergBook payload or gutenbergId parameter.' }, { status: 400 });
    }

    const gAuthor = gBook.authors && gBook.authors.length > 0 ? gBook.authors[0] : { name: "Unknown Author" };

    // 1. Check or Insert Author
    const authorSlugBase = generateSlug(gAuthor.name);
    let { data: existingAuthor } = await supabase
      .from('authors')
      .select('id')
      .ilike('name', gAuthor.name)
      .maybeSingle();

    let authorId = existingAuthor?.id;

    if (!authorId) {
      const { data: newAuthor, error: authorErr } = await supabase
        .from('authors')
        .insert({
          name: gAuthor.name,
          slug: `${authorSlugBase}-${Math.floor(Math.random() * 10000)}`,
          birth_year: gAuthor.birth_year || null,
          death_year: gAuthor.death_year || null,
        })
        .select('id')
        .single();

      if (authorErr) {
        return NextResponse.json({ error: `Author error: ${authorErr.message}` }, { status: 500 });
      }
      authorId = newAuthor.id;
    }

    // 2. Check or Insert Book
    const bookSlugBase = generateSlug(gBook.title);
    const bookSlug = `${bookSlugBase}-${gBook.id}`;

    // Check if book already exists
    const { data: existingBook } = await supabase
      .from('books')
      .select('id, title, slug')
      .eq('slug', bookSlug)
      .maybeSingle();

    if (existingBook) {
      return NextResponse.json({ message: 'Book already imported', book: existingBook });
    }

    const coverUrl = gBook.formats['image/jpeg'] || null;
    const gutenbergSourceUrl = `https://www.gutenberg.org/ebooks/${gBook.id}`;
    
    // Primary genre/subjects
    const subjects = gBook.subjects || [];
    const mainGenre = subjects[0] ? subjects[0].split(' -- ')[0] : 'General Fiction';

    const { data: newBook, error: bookErr } = await supabase
      .from('books')
      .insert({
        title: gBook.title,
        slug: bookSlug,
        author_id: authorId,
        cover_url: coverUrl,
        genre: mainGenre,
        language: gBook.languages ? gBook.languages[0] : 'en',
        copyright_status: gBook.copyright ? 'copyrighted' : 'public_domain',
        status: 'published',
        description: gBook.summaries && gBook.summaries.length > 0
          ? gBook.summaries[0]
          : `A classic work by ${gAuthor.name}, available free via Project Gutenberg.`,
        source_url: gutenbergSourceUrl,
      })
      .select('*')
      .single();

    if (bookErr) {
      return NextResponse.json({ error: `Book insert error: ${bookErr.message}` }, { status: 500 });
    }

    // 3. Link Categories
    const categorySubjects = subjects.slice(0, 3);
    for (const subj of categorySubjects) {
      const cleanCatName = subj.split(' -- ')[0];
      const catSlugBase = generateSlug(cleanCatName);

      let { data: existingCat } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', cleanCatName)
        .maybeSingle();

      let catId = existingCat?.id;
      if (!catId) {
        const { data: newCat } = await supabase
          .from('categories')
          .insert({
            name: cleanCatName,
            slug: `${catSlugBase}-${Math.floor(Math.random() * 1000)}`
          })
          .select('id')
          .single();

        if (newCat) catId = newCat.id;
      }

      if (catId) {
        try {
          await supabase.from('book_categories').insert({
            book_id: newBook.id,
            category_id: catId
          });
        } catch (_) {}
      }
    }

    // 4. Create initial placeholder chapter so the reader works immediately
    await supabase.from('chapters').insert({
      book_id: newBook.id,
      sequence_number: 1,
      title: 'Chapter 1',
      content: `<p class="italic text-muted-foreground">This book content is queued for background hydration from Gutenberg. Click "Sync Chapters" in Admin to load instantly!</p>`
    });

    return NextResponse.json({ success: true, book: newBook });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}
