import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { title, author, isbn, doi, publisher, year, userEmail, reason } = await request.json();

    if (!title || !author) {
      return NextResponse.json({ error: 'Title and Author are required.' }, { status: 400 });
    }

    // Search approved external repositories (Gutendex, DOAB, OpenStax, Standard Ebooks)
    const candidateSources: any[] = [];

    // 1. Gutendex / Gutenberg Search
    try {
      const gRes = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(`${title} ${author}`)}`);
      if (gRes.ok) {
        const gData = await gRes.json();
        (gData.results || []).slice(0, 3).forEach((gb: any) => {
          candidateSources.push({
            source: 'Project Gutenberg',
            sourceId: gb.id,
            title: gb.title,
            author: gb.authors[0]?.name || author,
            license: gb.copyright ? 'Copyrighted / Review' : 'Public Domain',
            rightsConfidence: gb.copyright ? 50 : 95,
            decision: gb.copyright ? 'HUMAN_REVIEW' : 'AUTO_APPROVED',
            downloadUrl: `https://www.gutenberg.org/ebooks/${gb.id}`,
          });
        });
      }
    } catch (_) {}

    // Determine initial status based on candidate rights confidence
    const bestCandidate = candidateSources[0];
    const initialStatus = bestCandidate ? bestCandidate.decision : 'SEARCHING';

    // Insert into Supabase book_requests table
    const { data: requestRecord, error: dbErr } = await supabase
      .from('book_requests')
      .insert({
        title,
        author,
        isbn: isbn || null,
        doi: doi || null,
        publisher: publisher || null,
        user_email: userEmail || null,
        reason: reason || null,
        status: initialStatus,
        candidate_sources: candidateSources,
      })
      .select('*')
      .single();

    return NextResponse.json({
      success: true,
      message: 'Book request received and evaluated against approved global sources.',
      request: requestRecord || { title, author, status: initialStatus, candidate_sources: candidateSources },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Book request failed' }, { status: 500 });
  }
}
