import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are missing');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();

    const {
      title,
      author,
      isbn,
      doi,
      publisher,
      year,
      userEmail,
      reason,
    } = await request.json();

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and Author are required.' },
        { status: 400 }
      );
    }

    // Search approved external repositories
    // Gutendex / Project Gutenberg
    const candidateSources: any[] = [];

    try {
      const searchQuery = encodeURIComponent(
        `${title} ${author}`
      );

      const gRes = await fetch(
        `https://gutendex.com/books/?search=${searchQuery}`
      );

      if (gRes.ok) {
        const gData = await gRes.json();

        (gData.results || [])
          .slice(0, 3)
          .forEach((gb: any) => {
            const firstAuthor =
              gb.authors && gb.authors.length > 0
                ? gb.authors[0]
                : null;

            candidateSources.push({
              source: 'Project Gutenberg',
              sourceId: gb.id,
              title: gb.title,
              author:
                firstAuthor?.name || author,
              license: gb.copyright
                ? 'Copyrighted / Review'
                : 'Public Domain',
              rightsConfidence: gb.copyright
                ? 50
                : 95,
              decision: gb.copyright
                ? 'HUMAN_REVIEW'
                : 'AUTO_APPROVED',
              downloadUrl:
                `https://www.gutenberg.org/ebooks/${gb.id}`,
            });
          });
      }
    } catch (_) {
      // External search failure should not
      // prevent the request from being recorded.
    }

    // Determine initial status
    const bestCandidate =
      candidateSources.length > 0
        ? candidateSources[0]
        : null;

    const initialStatus = bestCandidate
      ? bestCandidate.decision
      : 'SEARCHING';

    // Insert book request into Supabase
    const { data: requestRecord, error: dbErr } =
      await supabase
        .from('book_requests')
        .insert({
          title,
          author,
          isbn: isbn || null,
          doi: doi || null,
          publisher: publisher || null,
          year: year || null,
          user_email: userEmail || null,
          reason: reason || null,
          status: initialStatus,
          candidate_sources: candidateSources,
        })
        .select('*')
        .single();

    if (dbErr) {
      return NextResponse.json(
        {
          error: `Failed to save book request: ${dbErr.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Book request received and evaluated against approved global sources.',
      request:
        requestRecord || {
          title,
          author,
          status: initialStatus,
          candidate_sources: candidateSources,
        },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          'Book request failed',
      },
      { status: 500 }
    );
  }
}
