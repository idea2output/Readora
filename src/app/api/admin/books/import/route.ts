import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';


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
          slug: `${authorSlugBase}-${Date.now().toString().slice(-4)}`
        })
        .select('id')
        .single();

      if (authorErr || !newAuthor) {
        return NextResponse.json({ error: `Failed to create author: ${authorErr?.message}` }, { status: 500 });
      }
      authorId = newAuthor.id;
    }

    // 2. Insert Book
    const titleSlugBase = generateSlug(gBook.title);
    const { data: newBook, error: bookErr } = await supabase
      .from('books')
      .insert({
        title: gBook.title,
        slug: `${titleSlugBase}-${Date.now().toString().slice(-4)}`,
        author_id: authorId,
        cover_url: gBook.formats['image/jpeg'] || null,
        language: gBook.languages && gBook.languages.length > 0 ? gBook.languages[0] : 'en',
        genre: gBook.bookshelves && gBook.bookshelves.length > 0 ? gBook.bookshelves[0].replace('Browsing: ', '') : 'Classic Literature',
        copyright_status: 'public_domain',
        status: 'published',
        source_url: `https://www.gutenberg.org/ebooks/${gBook.id}`
      })
      .select('id, title, slug')
      .single();

    if (bookErr || !newBook) {
      return NextResponse.json({ error: `Failed to insert book: ${bookErr?.message}` }, { status: 500 });
    }

    // 3. Link Categories
    if (gBook.subjects && gBook.subjects.length > 0) {
      const subjectName = gBook.subjects[0].split('--')[0].trim();
      const catSlug = generateSlug(subjectName);

      let { data: existingCat } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', subjectName)
        .maybeSingle();

      let catId = existingCat?.id;

      if (!catId) {
        const { data: newCat } = await supabase
          .from('categories')
          .insert({
            name: subjectName,
            slug: `${catSlug}-${Date.now().toString().slice(-4)}`
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

    // Revalidate paths automatically so newly downloaded books appear instantly across the website
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/catalog');
      revalidatePath('/search');
    } catch (_) {}

    return NextResponse.json({ success: true, book: newBook });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}
