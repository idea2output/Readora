import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCompletion } from '@/lib/ai/ai-provider';
import { verifyAiAllowedForBook } from '@/lib/ai/guard';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { bookId } = await request.json();
    if (!bookId) {
      return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
    }

    // Sacred Text AI Firewall Check
    const guard = await verifyAiAllowedForBook(bookId);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.message || 'AI features are not available for Sacred Texts.' }, { status: 403 });
    }

    // Check DB cache
    const { data: cachedChars } = await supabase
      .from('book_characters')
      .select('*')
      .eq('book_id', bookId);

    if (cachedChars && cachedChars.length > 0) {
      return NextResponse.json({ characters: cachedChars, cached: true });
    }

    // Fetch sample chapters
    const { data: chapters } = await supabase
      .from('chapters')
      .select('title, content')
      .eq('book_id', bookId)
      .limit(3);

    const sampleText = (chapters || [])
      .map(c => (c.content || '').replace(/<[^>]+>/g, '').slice(0, 4000))
      .join('\n\n');

    const systemPrompt = `Extract key characters from this book text. Return a valid JSON array of objects:
[
  {
    "name": "Character Name",
    "role": "Protagonist / Antagonist / Supporting",
    "description": "Short description of personality and motivation",
    "relationships": "Relationship with other key characters",
    "first_appearance": "Chapter 1"
  }
]`;

    const completion = await generateCompletion([
      { role: 'user', content: `Extract characters:\n\n${sampleText}` }
    ], systemPrompt);

    let characters = [];
    try {
      const jsonMatch = completion.text.match(/\[[\s\S]*\]/);
      characters = JSON.parse(jsonMatch ? jsonMatch[0] : completion.text);
    } catch (_) {
      characters = [{ name: "Main Characters", role: "Key Figures", description: completion.text, relationships: "Central to plot", first_appearance: "Chapter 1" }];
    }

    // Cache to DB
    for (const c of characters) {
      try {
        await supabase.from('book_characters').insert({
          book_id: bookId,
          name: c.name || "Unknown",
          role: c.role || "Character",
          description: c.description || "",
          relationships: c.relationships || "",
          first_appearance: c.first_appearance || "Chapter 1",
        });
      } catch (_) {}
    }

    return NextResponse.json({ characters, cached: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Character extraction failed' }, { status: 500 });
  }
}
