const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing categories...');
  const resCat = await supabase.from('categories').select('*').limit(1);
  console.log('Categories:', resCat.error ? resCat.error : 'OK');

  console.log('Testing books...');
  const resBooks = await supabase.from('books').select('*').limit(1);
  console.log('Books:', resBooks.error ? resBooks.error : 'OK');
}

test();
