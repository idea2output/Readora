import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key if available for bypassing RLS, otherwise anon key (might fail if RLS blocks inserts)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 10 Standard Categories (BISAC-like)
const categoriesData = [
  { name: 'Classics', slug: 'fiction-classics' },
  { name: 'Science Fiction', slug: 'fiction-science-fiction' },
  { name: 'Fantasy', slug: 'fiction-fantasy' },
  { name: 'Mystery & Detective', slug: 'fiction-mystery' },
  { name: 'Romance', slug: 'fiction-romance' },
  { name: 'Philosophy', slug: 'nonfiction-philosophy' },
  { name: 'History', slug: 'nonfiction-history' },
  { name: 'Science', slug: 'nonfiction-science' },
  { name: 'Biography', slug: 'nonfiction-biography' },
  { name: 'Poetry', slug: 'poetry' },
];

// Seed Data for Authors and Books
const seedDatabase = async () => {
  console.log('Starting seed...');

  // 1. Insert Categories
  console.log('Inserting categories...');
  const insertedCategories = [];
  for (const cat of categoriesData) {
    const { data, error } = await supabase
      .from('categories')
      .upsert([{ name: cat.name, slug: cat.slug, description: faker.lorem.sentence() }], { onConflict: 'slug' })
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting category:', error);
    } else {
      insertedCategories.push(data);
    }
  }

  // 2. Generate 50 Books (5 per category)
  console.log('Inserting authors and books...');
  
  const generateBooksForCategory = async (category, count) => {
    for (let i = 0; i < count; i++) {
      // Create an author
      const authorName = faker.person.fullName();
      const authorSlug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const { data: author, error: authorError } = await supabase
        .from('authors')
        .upsert([{
          name: authorName,
          slug: authorSlug,
          biography: faker.lorem.paragraphs(2),
          birth_year: faker.number.int({ min: 1700, max: 1900 }),
          death_year: faker.number.int({ min: 1800, max: 1950 })
        }], { onConflict: 'slug' })
        .select()
        .single();
        
      if (authorError) {
        console.error('Error inserting author:', authorError);
        continue;
      }

      // Create a book
      const title = faker.book.title();
      const bookSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + faker.string.alphanumeric(4);
      
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert([{
          title: title,
          slug: bookSlug,
          author_id: author.id,
          publication_year: faker.number.int({ min: 1800, max: 1928 }), // Pre-1929 public domain rule
          language: 'en',
          genre: category.name,
          description: faker.lorem.paragraphs(3),
          cover_url: `https://picsum.photos/seed/${bookSlug}/400/600`, // Placeholder cover
          status: 'published',
          copyright_status: 'public_domain',
          word_count: faker.number.int({ min: 20000, max: 150000 }),
          reading_time_minutes: faker.number.int({ min: 120, max: 600 }),
        }])
        .select()
        .single();
        
      if (bookError) {
        console.error('Error inserting book:', bookError);
        continue;
      }

      // Link book to category
      await supabase
        .from('book_categories')
        .insert([{ book_id: book.id, category_id: category.id }]);
    }
  };

  for (const category of insertedCategories) {
    console.log(`Generating 5 books for ${category.name}...`);
    await generateBooksForCategory(category, 5);
  }

  console.log('Seed completed successfully! Inserted 50 books.');
};

seedDatabase().catch(console.error);
