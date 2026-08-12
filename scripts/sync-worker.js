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

// Robust chapter splitter supporting both HTML and Plain Text
function splitIntoChapters(content, isHtml = true) {
  if (!content) return [];
  
  if (isHtml) {
    const parts = content.split(/<h[23][^>]*>/i);
    if (parts.length > 2) {
      const chapters = [];
      for (let i = 1; i < parts.length; i++) {
        const closeIdx = parts[i].indexOf('</h');
        let title = `Chapter ${i}`;
        let body = parts[i];
        if (closeIdx > -1) {
          title = parts[i].substring(0, closeIdx).replace(/<[^>]+>/g, '').trim();
          body = parts[i].substring(parts[i].indexOf('>', closeIdx) + 1);
        }
        if (title.length > 60 || !title) title = `Chapter ${i}`;
        chapters.push({ title, content: body.trim() });
      }
      return chapters;
    }
  }

  // Plain text or fallback formatting
  // Convert plain text double line breaks to HTML paragraphs
  const cleanText = content.replace(/\r\n/g, '\n');
  const rawChapters = cleanText.split(/\n(?=(?:CHAPTER|Chapter|Book|BOOK|PART|Part)\s+[0-9IVXLC]+)/i);

  if (rawChapters.length > 1) {
    return rawChapters.map((chText, idx) => {
      const lines = chText.trim().split('\n');
      const title = lines[0].substring(0, 60).trim() || `Chapter ${idx + 1}`;
      const bodyText = lines.slice(1).join('\n\n');
      const htmlBody = bodyText
        .split(/\n\s*\n/)
        .filter(p => p.trim())
        .map(p => `<p class="mb-4 leading-relaxed">${p.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
        .join('\n');
      return { title, content: htmlBody || `<p>${chText.trim()}</p>` };
    });
  }

  // Fallback: split long text into ~10k character readable chapters
  const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim());
  const chapters = [];
  let currentChunk = [];
  let currentLen = 0;
  let chNum = 1;

  for (const p of paragraphs) {
    currentChunk.push(`<p class="mb-4 leading-relaxed">${p.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`);
    currentLen += p.length;
    if (currentLen >= 8000) {
      chapters.push({ title: `Chapter ${chNum}`, content: currentChunk.join('\n') });
      chNum++;
      currentChunk = [];
      currentLen = 0;
    }
  }
  if (currentChunk.length > 0) {
    chapters.push({ title: `Chapter ${chNum}`, content: currentChunk.join('\n') });
  }

  return chapters.length > 0 ? chapters : [{ title: "Full Text", content: `<p>${content}</p>` }];
}

async function startWorker() {
  console.log("=========================================");
  console.log("📚 Readora Background Sync Worker Started");
  console.log("=========================================");

  while (true) {
    const syncedIds = getSyncedBookIds();

    let query = supabase.from('books').select('id, title, source_url').limit(1);
    if (syncedIds.length > 0) {
      query = query.not('id', 'in', `(${syncedIds.join(',')})`);
    }

    const { data: books, error } = await query;

    if (error) {
      console.error("❌ DB Error:", error.message);
      await sleep(10000);
      continue;
    }

    if (!books || books.length === 0) {
      console.log("✅ All books are fully synced! Worker sleeping for 5 minutes...");
      await sleep(5 * 60 * 1000);
      continue;
    }

    const book = books[0];
    console.log(`\n⏳ [SYNCING] ${book.title}`);
    
    let gutendexId = null;
    if (book.source_url && book.source_url.includes('ebooks/')) {
       gutendexId = book.source_url.split('/').pop().replace(/[^0-9]/g, '');
    }

    if (!gutendexId) {
      console.log(`⏭️  No Gutenberg ID found for ${book.title}, skipping.`);
      saveSyncedBookId(book.id);
      continue;
    }

    // Reliable candidate URLs in order of preference
    const candidateUrls = [
      { url: `https://www.gutenberg.org/cache/epub/${gutendexId}/pg${gutendexId}.html.utf8`, type: 'html' },
      { url: `https://www.gutenberg.org/ebooks/${gutendexId}.html.images`, type: 'html' },
      { url: `https://www.gutenberg.org/cache/epub/${gutendexId}/pg${gutendexId}.txt`, type: 'text' },
      { url: `https://www.gutenberg.org/ebooks/${gutendexId}.txt.utf-8`, type: 'text' }
    ];

    let downloadedContent = null;
    let contentType = 'html';

    for (const item of candidateUrls) {
      try {
        console.log(`   Trying fetch from: ${item.url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const res = await fetch(item.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,text/plain,application/xhtml+xml;q=0.9,*/*;q=0.8',
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          downloadedContent = await res.text();
          contentType = item.type;
          console.log(`   ⚡ Download successful! (${(downloadedContent.length / 1024).toFixed(1)} KB)`);
          break;
        }
      } catch (e) {
        console.log(`   ⚠️ Failed (${item.url.split('/').pop()}): ${e.message}`);
      }
    }

    if (!downloadedContent) {
      console.error(`❌ All fetch attempts failed for ${book.title}. Skipping for now.`);
      saveSyncedBookId(book.id);
      console.log(`\n💤 Sleeping 15 seconds...`);
      await sleep(15000);
      continue;
    }

    try {
      const isHtml = contentType === 'html';
      const newChapters = splitIntoChapters(downloadedContent, isHtml);

      // Limit to 50 chapters
      const safeChapters = newChapters.slice(0, 50).map((ch, idx) => ({
        book_id: book.id,
        title: ch.title,
        sequence_number: idx + 1,
        content: ch.content
      }));

      // 1. Delete old placeholder/dummy chapters
      await supabase.from('chapters').delete().eq('book_id', book.id);

      // 2. Insert real chapters
      const { error: insertErr } = await supabase.from('chapters').insert(safeChapters);
      
      if (insertErr) {
        console.error("❌ Failed to insert real chapters:", insertErr.message);
      } else {
        console.log(`✅ Successfully saved ${safeChapters.length} real chapters for "${book.title}"!`);
        saveSyncedBookId(book.id);
      }

    } catch (err) {
      console.error(`❌ Parsing/saving failed for ${book.title}:`, err.message);
      saveSyncedBookId(book.id);
    }

    // Reduced gap to 15 seconds since we are using fast endpoints now
    console.log(`\n💤 Sleeping for 15 seconds before next book...`);
    await sleep(15000);
  }
}

startWorker();
