import { NextResponse } from 'next/server';
import { askTheBook } from '@/lib/ai/rag-engine';

export async function POST(request: Request) {
  try {
    const { bookId, question } = await request.json();
    if (!bookId || !question) {
      return NextResponse.json({ error: 'Missing bookId or question parameter' }, { status: 400 });
    }

    const result = await askTheBook(bookId, question);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'RAG query failed' }, { status: 500 });
  }
}
