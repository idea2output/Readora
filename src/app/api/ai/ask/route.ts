import { NextResponse } from 'next/server';
import { askTheBook } from '@/lib/ai/rag-engine';
import { verifyAiAllowedForBook } from '@/lib/ai/guard';


export async function POST(request: Request) {
  try {
    const { bookId, question } = await request.json();
    if (!bookId || !question) {
      return NextResponse.json({ error: 'Missing bookId or question parameter' }, { status: 400 });
    }

    // Sacred Text AI Firewall Check
    const guard = await verifyAiAllowedForBook(bookId);
    if (!guard.allowed) {
      return NextResponse.json({ error: guard.message || 'AI features are not available for Sacred Texts.' }, { status: 403 });
    }

    const result = await askTheBook(bookId, question);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'RAG query failed' }, { status: 500 });
  }
}
