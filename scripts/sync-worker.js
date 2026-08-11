const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const STATE_FILE = path.join(__dirname, '.sync-state.json');

// Helper to delay execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getSyncedBookIds() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return [];
}

function saveSyncedBookId(id) {
  const synced = getSyncedBookIds();
  if (!synced.includes(id)) {
    synced.push(id);
    fs.writeFileSync(STATE_FILE, JSON.stringify(synced));
  }
}

// Split HTML into rough chapters
function splitIntoChapters(html) {
  if (!html) return [];
  const parts = html.split(/<h[23][^>]*>/i);
  if (parts.length > 2) {
    const chapters = [];
    for (let i = 1; i < parts.length; i++) {
      const closeIdx = parts[i].indexOf('</h');
      let title = `Chapter ${i}`;
      let content = parts[i];
      if (closeIdx > -1) {
        title = parts[i].substring(0, closeIdx).replace(/<[^>]+>/g, '').trim();
        content = parts[i].substring(parts[i].indexOf('>', closeIdx) + 1);
      }
      if (title.length > 50) title = `Chapter ${i}`;
      chapters.push({ title, content: content.trim() });
    }
    return chapters;
  }
  return [{ title: "Full Text", content: html }];
}

async function startWorker() {
  console.log("=========================================");
  console.log("📚 Readora Background Sync Worker Started");
  console.log("=========================================");

  while (true) {
    const syncedIds = getSyncedBookIds();

    // Find one book that needs syncing
    let query = supabase.from('books').select('id, title, source_url').limit(1);
    if (syncedIds.length > 0) {
      query = query.not('id', 'in', `(${syncedIds.join(',')})`);
    }

    const { data: books, error } = await query;

    if (error) {
      console.error("❌ DB Error:", error.message);
      await sleep(10000); // Wait 10s on error
      continue;
    }

    if (!books || books.length === 0) {
      console.log("✅ All books are fully synced! Worker sleeping for 5 minutes...");
      await sleep(5 * 60 * 1000);
      continue;
    }

    const book = books[0];
    console.log(`\n⏳ [SYNCING] ${book.title}`);
    
    // Fallback URL if we need to derive the HTML link
    let contentUrl = book.source_url;
    if (contentUrl && contentUrl.includes('ebooks/')) {
       const gutendexId = contentUrl.split('/').pop();
       contentUrl = `https://www.gutenberg.org/files/${gutendexId}/${gutendexId}-h/${gutendexId}-h.htm`;
    }

    if (!contentUrl) {
      console.log(`⏭️  No source URL found for ${book.title}, skipping.`);
      saveSyncedBookId(book.id);
      continue;
    }

    try {
      console.log(`   Downloading real content from Gutenberg...`);
      const res = await fetch(contentUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const rawContent = await res.text();
      const newChapters = splitIntoChapters(rawContent);

      // Limit to 50 chapters to avoid Payload Too Large errors
      const safeChapters = newChapters.slice(0, 50).map((ch, idx) => ({
        book_id: book.id,
        title: ch.title,
        sequence_number: idx + 1,
        content: ch.content
      }));

      // 1. Delete old dummy chapters
      await supabase.from('chapters').delete().eq('book_id', book.id);

      // 2. Insert new real chapters
      const { error: insertErr } = await supabase.from('chapters').insert(safeChapters);
      
      if (insertErr) {
        console.error("❌ Failed to insert real chapters:", insertErr.message);
      } else {
        console.log(`✅ Successfully replaced with ${safeChapters.length} real chapters!`);
        saveSyncedBookId(book.id);
      }

    } catch (err) {
      console.error(`❌ Fetch failed for ${book.title}:`, err.message);
      console.log("   Gutenberg might be rate-limiting. Will skip for now.");
      // Even if it fails due to 404s on that specific URL pattern, we should mark as synced to prevent infinite loops on a bad book URL
      saveSyncedBookId(book.id);
    }

    // SAFE TIME GAP (45 seconds)
    console.log(`\n💤 Sleeping for 45 seconds to respect Gutenberg's servers...`);
    await sleep(45000);
  }
}

startWorker();
