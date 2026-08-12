import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

function splitIntoChapters(content: string, isHtml = true) {
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
          title = parts[i]
            .substring(0, closeIdx)
            .replace(/<[^>]+>/g, '')
            .trim();

          body = parts[i].substring(
            parts[i].indexOf('>', closeIdx) + 1
          );
        }

        if (title.length > 60 || !title) {
          title = `Chapter ${i}`;
        }

        chapters.push({
          title,
          content: body.trim(),
        });
      }

      return chapters;
    }
  }

  const cleanText = content.replace(/\r\n/g, '\n');

  const rawChapters = cleanText.split(
    /\n(?=(?:CHAPTER|Chapter|Book|BOOK|PART|Part)\s+[0-9IVXLC]+)/i
  );

  if (rawChapters.length > 1) {
    return rawChapters.map((chText, idx) => {
      const lines = chText.trim().split('\n');

      const title =
        lines[0].substring(0, 60).trim() ||
        `Chapter ${idx + 1}`;

      const bodyText = lines.slice(1).join('\n\n');

      const htmlBody = bodyText
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map(
          (p) =>
            `<p class="mb-4 leading-relaxed">${p
              .trim()
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')}</p>`
        )
        .join('\n');

      return {
        title,
        content:
          htmlBody || `<p>${chText.trim()}</p>`,
      };
    });
  }

  const paragraphs = cleanText
    .split(/\n\s*\n/)
    .filter((p) => p.trim());

  const chapters = [];
  let currentChunk: string[] = [];
  let currentLen = 0;
  let chNum = 1;

  for (const p of paragraphs) {
    currentChunk.push(
      `<p class="mb-4 leading-relaxed">${p
        .trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</p>`
    );

    currentLen += p.length;

    if (currentLen >= 8000) {
      chapters.push({
        title: `Chapter ${chNum}`,
        content: currentChunk.join('\n'),
      });

      chNum++;
      currentChunk = [];
      currentLen = 0;
    }
  }

  if (currentChunk.length > 0) {
    chapters.push({
      title: `Chapter ${chNum}`,
      content: currentChunk.join('\n'),
    });
  }

  return chapters.length > 0
    ? chapters
    : [
        {
          title: 'Full Text',
          content: `<p>${content}</p>`,
        },
      ];
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(
    supabaseUrl,
    supabaseServiceKey
  );

  try {
    const { bookId } = await request.json();

    if (!bookId) {
      return NextResponse.json(
        { error: 'Missing bookId parameter' },
        { status: 400 }
      );
    }

    const { data: book, error: fetchErr } = await supabase
      .from('books')
      .select('id, title, source_url, slug')
      .eq('id', bookId)
      .single();

    if (fetchErr || !book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    let gutendexId = null;

    if (
      book.source_url &&
      book.source_url.includes('ebooks/')
    ) {
      gutendexId = book.source_url
        .split('/')
        .pop()
        ?.replace(/[^0-9]/g, '');
    }

    if (!gutendexId) {
      const slugParts = book.slug.split('-');
      const lastPart =
        slugParts[slugParts.length - 1];

      if (/^\d+$/.test(lastPart)) {
        gutendexId = lastPart;
      }
    }

    if (!gutendexId) {
      return NextResponse.json(
        {
          error:
            'Could not resolve Gutenberg ID for this book',
        },
        { status: 400 }
      );
    }

    const candidateUrls = [
      {
        url: `https://www.gutenberg.org/cache/epub/${gutendexId}/pg${gutendexId}.html.utf8`,
        type: 'html',
      },
      {
        url: `https://www.gutenberg.org/ebooks/${gutendexId}.html.images`,
        type: 'html',
      },
      {
        url: `https://www.gutenberg.org/cache/epub/${gutendexId}/pg${gutendexId}.txt`,
        type: 'text',
      },
      {
        url: `https://www.gutenberg.org/ebooks/${gutendexId}.txt.utf-8`,
        type: 'text',
      },
    ];

    let downloadedContent: string | null = null;
    let contentType = 'html';

    for (const item of candidateUrls) {
      try {
        const controller = new AbortController();

        const timeoutId = setTimeout(
          () => controller.abort(),
          15000
        );

        const res = await fetch(item.url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'text/html,text/plain,application/xhtml+xml;q=0.9,*/*;q=0.8',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          downloadedContent = await res.text();
          contentType = item.type;
          break;
        }
      } catch (_) {
        // Continue to next candidate URL.
      }
    }

    if (!downloadedContent) {
      return NextResponse.json(
        {
          error:
            'Failed to download content from Gutenberg mirrors.',
        },
        { status: 502 }
      );
    }

    const isHtml = contentType === 'html';

    const newChapters = splitIntoChapters(
      downloadedContent,
      isHtml
    );

    const safeChapters = newChapters
      .slice(0, 50)
      .map((ch, idx) => ({
        book_id: book.id,
        title: ch.title,
        sequence_number: idx + 1,
        content: ch.content,
      }));

    // 1. Delete placeholder chapters
    await supabase
      .from('chapters')
      .delete()
      .eq('book_id', book.id);

    // 2. Insert real chapters
    const { error: insertErr } = await supabase
      .from('chapters')
      .insert(safeChapters);

    if (insertErr) {
      return NextResponse.json(
        {
          error: `Insert error: ${insertErr.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${safeChapters.length} real chapters!`,
      chapterCount: safeChapters.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message || 'Sync failed',
      },
      { status: 500 }
    );
  }
}
