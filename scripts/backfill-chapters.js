const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const { faker } = require('@faker-js/faker');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillChapters() {
  console.log('Fetching all books...');
  const { data: books, error: fetchError } = await supabase.from('books').select('id, title');
  
  if (fetchError) {
    console.error('Error fetching books:', fetchError);
    return;
  }

  console.log(`Found ${books.length} books. Generating chapters...`);
  const chapters = [];

  for (const book of books) {
    // Generate 3-5 chapters per book
    const numChapters = faker.number.int({ min: 3, max: 5 });
    
    for (let i = 1; i <= numChapters; i++) {
      // Generate some dummy HTML content
      const paragraphs = Array.from({ length: 8 }, () => `<p>${faker.lorem.paragraph({ min: 5, max: 15 })}</p>`).join('\n');
      const content = `<h2>Chapter ${i}</h2>\n${paragraphs}`;
      
      chapters.push({
        book_id: book.id,
        title: `Chapter ${i}`,
        sequence_number: i,
        content: content
      });
    }
  }

  console.log(`Inserting ${chapters.length} chapters...`);
  const { error: insertError } = await supabase.from('chapters').insert(chapters);
  
  if (insertError) {
    console.error('Error inserting chapters:', insertError);
  } else {
    console.log('Chapters backfilled successfully!');
  }
}

backfillChapters();
