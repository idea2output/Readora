import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCompletion } from '@/lib/ai/ai-provider';
import { verifyAiAllowedForBook } from '@/lib/ai/guard';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { bookId, chapterId } = await request.json();
    if (!bookId || !chapterId) {
      return NextResponse.json({ error: 'Missing bookId or chapterId' }, { status: 400 });
    }

    // Sacred Text AI Firewall Check
    const guard = await verifyAiAllowedForBook(bookId);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.message || 'AI features are not available for Sacred Texts.' }, { status: 403 });
    }

    // 1. Check Cache
    const { data: cached } = await supabase
      .from('chapter_summaries')
      .select('*')
      .eq('chapter_id', chapterId)
      .maybeSingle();

    if (cached) {
      return NextResponse.json({
        shortSummary: cached.short_summary,
        detailedSummary: cached.detailed_summary,
        keyPoints: cached.key_points || [],
        cached: true,
      });
    }

    // 2. Fetch Chapter Content
    const { data: chapter } = await supabase
      .from('chapters')
      .select('title, content')
      .eq('id', chapterId)
      .single();

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const cleanText = (chapter.content || '').replace(/<[^>]+>/g, '').slice(0, 12000);

    const systemPrompt = `You are a literary analyst. Generate a chapter summary containing:
1. A concise 2-sentence short summary.
2. A detailed 2-paragraph summary.
3. 3 to 5 key bullet points.

Format your output in valid JSON format:
{
  "shortSummary": "...",
  "detailedSummary": "...",
  "keyPoints": ["point 1", "point 2", "point 3"]
}`;

    const completion = await generateCompletion([
      { role: 'user', content: `Summarize this chapter (${chapter.title}):\n\n${cleanText}` }
    ], systemPrompt);

    let parsed: any = {};
    try {
      const jsonMatch = completion.text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : completion.text);
    } catch (_) {
      parsed = {
        shortSummary: completion.text.slice(0, 200),
        detailedSummary: completion.text,
        keyPoints: ["Key narrative developments", "Character progression"],
      };
    }

    const summaryRecord = {
      shortSummary: parsed.shortSummary || "Summary unavailable.",
      detailedSummary: parsed.detailedSummary || completion.text,
      keyPoints: parsed.keyPoints || [],
    };

    // 3. Cache to database
    try {
      await supabase.from('chapter_summaries').insert({
        book_id: bookId,
        chapter_id: chapterId,
        short_summary: summaryRecord.shortSummary,
        detailed_summary: summaryRecord.detailedSummary,
        key_points: summaryRecord.keyPoints,
      });
    } catch (_) {}

    return NextResponse.json({ ...summaryRecord, cached: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Summary generation failed' }, { status: 500 });
  }
}
