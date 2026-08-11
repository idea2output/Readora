const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const { faker } = require('@faker-js/faker');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function generateSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function ingestReligion() {
  console.log('--- STARTING RELIGIOUS BOOKS INGESTION ---');

  // 1. Ensure the Category exists
  const catName = "Sacred Texts & Religion";
  let catId;
  
  const { data: existingCat } = await supabase.from('categories').select('id').eq('name', catName).single();
  if (existingCat) {
    catId = existingCat.id;
  } else {
    const { data: newCat, error: catErr } = await supabase.from('categories').insert({
      name: catName,
      slug: generateSlug(catName),
      description: "Religious, spiritual, and sacred texts from around the world."
    }).select('id').single();
    if (catErr) throw new Error(catErr.message);
    catId = newCat.id;
  }

  // 2. Fetch from Gutendex
  console.log('Fetching religious metadata from Gutendex...');
  const res = await fetch('https://gutendex.com/books/?topic=religion');
  const data = await res.json();
  const books = data.results.slice(0, 20); // Top 20 religious texts
  
  console.log(`Processing ${books.length} sacred texts...`);

  for (let i = 0; i < books.length; i++) {
    const gBook = books[i];
    console.log(`[${i+1}/${books.length}] ${gBook.title}`);

    // Author
    const gAuthor = gBook.authors && gBook.authors.length > 0 ? gBook.authors[0] : { name: "Unknown / Traditional" };
    const authorSlug = generateSlug(gAuthor.name) + '-' + Math.floor(Math.random()*1000);
    
    // Check if author exists
    let authorId;
    const { data: existingAuth } = await supabase.from('authors').select('id').eq('name', gAuthor.name).limit(1);
    if (existingAuth && existingAuth.length > 0) {
       authorId = existingAuth[0].id;
    } else {
       const { data: newAuth } = await supabase.from('authors').insert({
          name: gAuthor.name,
          slug: authorSlug,
       }).select('id').single();
       authorId = newAuth.id;
    }

    // Book Cover
    const coverUrl = gBook.formats['image/jpeg'] || null;

    // Insert Book
    const bookSlug = generateSlug(gBook.title) + '-' + gBook.id;
    const { data: bookData, error: bookErr } = await supabase.from('books').insert({
      title: gBook.title,
      slug: bookSlug,
      author_id: authorId,
      cover_url: coverUrl,
      source_url: `https://www.gutenberg.org/ebooks/${gBook.id}`,
      language: gBook.languages ? gBook.languages[0] : 'en',
      status: 'published',
      word_count: gBook.download_count,
    }).select('id').single();

    if (bookErr) {
      console.error('Failed to insert book:', bookErr.message);
      continue;
    }

    // Link to Sacred Texts category
    await supabase.from('book_categories').insert({
      book_id: bookData.id,
      category_id: catId
    });

    // Generate Dummy Chapters for now (Sync worker will replace them later!)
    const chaptersToInsert = [];
    const numChapters = faker.number.int({ min: 3, max: 8 });
    for (let j = 1; j <= numChapters; j++) {
      const paragraphs = Array.from({ length: 5 }, () => `<p>${faker.lorem.paragraph({ min: 5, max: 15 })}</p>`).join('\\n');
      chaptersToInsert.push({
        book_id: bookData.id,
        title: `Chapter ${j}`,
        sequence_number: j,
        content: `<h2>Chapter ${j}</h2>\\n${paragraphs}`
      });
    }
    await supabase.from('chapters').insert(chaptersToInsert);
  }

  console.log('--- RELIGIOUS BOOKS INGESTION COMPLETE ---');
}

ingestReligion();
