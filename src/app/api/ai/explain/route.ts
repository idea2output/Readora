import { NextResponse } from 'next/server';
import { generateCompletion } from '@/lib/ai/ai-provider';

export async function POST(request: Request) {
  try {
    const { text, mode, bookTitle } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Missing passage text' }, { status: 400 });
    }

    let promptMode = 'Explain Simply';
    if (mode === 'detailed') promptMode = 'Provide a detailed literary analysis';
    if (mode === 'historical') promptMode = 'Explain the historical and cultural context';
    if (mode === 'vocabulary') promptMode = 'Explain key vocabulary words and archaic terms';
    if (mode === 'modern') promptMode = 'Rewrite this passage into clear Modern English while preserving original meaning';
    if (mode === 'simple_english') promptMode = 'Rewrite this passage into Simple English suitable for young students';

    const systemPrompt = `You are a literary assistant for Readora. Mode: ${promptMode}.
Be concise, clear, and direct. Keep your response grounded in the provided passage.`;

    const completion = await generateCompletion([
      { role: 'user', content: `Passage from ${bookTitle || 'Book'}:\n"${text}"\n\nTask: ${promptMode}` }
    ], systemPrompt);

    return NextResponse.json({
      explanation: completion.text,
      mode: mode || 'simple',
      model: completion.model,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Passage explanation failed' }, { status: 500 });
  }
}
