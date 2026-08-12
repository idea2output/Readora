const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const STATE_FILE = path.join(__dirname, '.sync-state.json');

// Helper to delay execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function generateSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function getSyncedBookIds() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (_) {
      return [];
    }
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

// Download real content from Gutenberg mirrors
async function downloadRealChapters(gutendexId) {
  const candidateUrls = [
    { url: `https://www.gutenberg.org/cache/epub/${gutendexId}/pg${gutendexId}.html.utf8`, type: 'html' },
    { url: `https://www.gutenberg.org/ebooks/${gutendexId}.html.images`, type: 'html' },
    { url: `https://www.gutenberg.org/cache/epub/${gutendexId}/pg${gutendexId}.txt`, type: 'text' },
    { url: `https://www.gutenberg.org/ebooks/${gutendexId}.txt.utf-8`, type: 'text' }
  ];

  for (const item of candidateUrls) {
    try {
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
        const text = await res.text();
        return { content: text, type: item.type };
      }
    } catch (_) {}
  }
  return null;
}

// Import a new Gutenberg book into Supabase
async function importGutenbergBook(gBook) {
  const gAuthor = gBook.authors && gBook.authors.length > 0 ? gBook.authors[0] : { name: "Unknown Author" };

  // 1. Author
  const authorSlugBase = generateSlug(gAuthor.name);
  let { data: existingAuthor } = await supabase
    .from('authors')
    .select('id')
    .ilike('name', gAuthor.name)
    .maybeSingle();

  let authorId = existingAuthor?.id;
  if (!authorId) {
    const { data: newAuthor } = await supabase
      .from('authors')
      .insert({
        name: gAuthor.name,
        slug: `${authorSlugBase}-${Math.floor(Math.random() * 10000)}`,
        birth_year: gAuthor.birth_year || null,
        death_year: gAuthor.death_year || null,
      })
      .select('id')
      .single();
    if (newAuthor) authorId = newAuthor.id;
  }

  // 2. Book
  const bookSlug = `${generateSlug(gBook.title)}-${gBook.id}`;
  const coverUrl = gBook.formats['image/jpeg'] || null;
  const gutenbergSourceUrl = `https://www.gutenberg.org/ebooks/${gBook.id}`;
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

  if (bookErr || !newBook) return null;

  // 3. Categories
  for (const subj of subjects.slice(0, 3)) {
    const cleanCatName = subj.split(' -- ')[0];
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
          slug: `${generateSlug(cleanCatName)}-${Math.floor(Math.random() * 1000)}`
        })
        .select('id')
        .single();
      if (newCat) catId = newCat.id;
    }

    if (catId) {
      await supabase.from('book_categories').insert({
        book_id: newBook.id,
        category_id: catId
      }).catch(() => {});
    }
  }

  return newBook;
}

async function startWorker() {
  console.log("=================================================");
  console.log("📚 Readora Intelligent Catalog & Gutenberg Sync");
  console.log("=================================================");

  let currentGutendexPage = 1;

  while (true) {
    const syncedIds = getSyncedBookIds();

    // 1. First Priority: Sync existing books in local DB that need chapters
    let query = supabase.from('books').select('id, title, source_url, slug').limit(1);
    if (syncedIds.length > 0) {
      query = query.not('id', 'in', `(${syncedIds.join(',')})`);
    }

    const { data: unsyncedBooks } = await query;

    if (unsyncedBooks && unsyncedBooks.length > 0) {
      const book = unsyncedBooks[0];
      console.log(`\n⏳ [HYDRATING EXISTING BOOK] ${book.title}`);

      let gutendexId = null;
      if (book.source_url && book.source_url.includes('ebooks/')) {
        gutendexId = book.source_url.split('/').pop().replace(/[^0-9]/g, '');
      }

      if (gutendexId) {
        const downloaded = await downloadRealChapters(gutendexId);
        if (downloaded) {
          const chapters = splitIntoChapters(downloaded.content, downloaded.type === 'html');
          const safeChapters = chapters.slice(0, 50).map((ch, idx) => ({
            book_id: book.id,
            title: ch.title,
            sequence_number: idx + 1,
            content: ch.content
          }));

          await supabase.from('chapters').delete().eq('book_id', book.id);
          await supabase.from('chapters').insert(safeChapters);
          console.log(`✅ Synced ${safeChapters.length} chapters for "${book.title}"!`);
        }
      }
      saveSyncedBookId(book.id);
      console.log(`💤 Sleeping 15 seconds...`);
      await sleep(15000);
      continue;
    }

    // 2. Second Priority: Compare Local Library with Gutenberg Catalog & Auto-Download New Books!
    console.log(`\n🔍 [CATALOG COMPARISON] Querying Gutenberg Catalog (Page ${currentGutendexPage})...`);
    try {
      const res = await fetch(`https://gutendex.com/books/?sort=popular&page=${currentGutendexPage}`);
      if (res.ok) {
        const data = await res.json();
        const gBooks = data.results || [];

        let newImports = 0;
        for (const gBook of gBooks) {
          const expectedSlug = `${generateSlug(gBook.title)}-${gBook.id}`;
          const gutenbergUrl = `https://www.gutenberg.org/ebooks/${gBook.id}`;

          // Check if book exists in Supabase catalog
          const { data: existing } = await supabase
            .from('books')
            .select('id')
            .or(`slug.eq.${expectedSlug},source_url.eq.${gutenbergUrl}`)
            .maybeSingle();

          if (!existing) {
            console.log(`\n✨ 🆕 [NEW BOOK DISCOVERED] "${gBook.title}" (ID: #${gBook.id})`);
            console.log(`   Importing metadata into catalog...`);

            const importedBook = await importGutenbergBook(gBook);
            if (importedBook) {
              console.log(`   Downloading real chapters from Gutenberg...`);
              const downloaded = await downloadRealChapters(gBook.id);

              if (downloaded) {
                const chapters = splitIntoChapters(downloaded.content, downloaded.type === 'html');
                const safeChapters = chapters.slice(0, 50).map((ch, idx) => ({
                  book_id: importedBook.id,
                  title: ch.title,
                  sequence_number: idx + 1,
                  content: ch.content
                }));
                await supabase.from('chapters').insert(safeChapters);
                console.log(`🎉 Successfully added "${gBook.title}" with ${safeChapters.length} chapters to your library!`);
              }
              saveSyncedBookId(importedBook.id);
              newImports++;

              console.log(`💤 Sleeping 15 seconds before next book...`);
              await sleep(15000);
            }
          }
        }

        if (newImports === 0) {
          console.log(`✓ All books on Gutenberg Page ${currentGutendexPage} are already in your library.`);
          currentGutendexPage++; // Advance to next Gutenberg catalog page!
        }
      }
    } catch (err) {
      console.error(`⚠️ Gutenberg query error: ${err.message}`);
    }

    console.log(`💤 Sleeping 20 seconds before checking next page...`);
    await sleep(20000);
  }
}

startWorker();
