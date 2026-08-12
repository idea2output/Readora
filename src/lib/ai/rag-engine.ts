import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from './embedding-provider';
import { generateCompletion } from './ai-provider';
import { chunkText } from './chunker';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function indexBookChunks(bookId: string): Promise<number> {
  const { data: chapters, error } = await supabase
    .from('chapters')
    .select('id, title, content, sequence_number')
    .eq('book_id', bookId)
    .order('sequence_number', { ascending: true });

  if (error || !chapters || chapters.length === 0) {
    return 0;
  }

  // Delete existing chunks for clean re-indexing
  await supabase.from('book_chunks').delete().eq('book_id', bookId);

  let totalChunks = 0;
  for (const ch of chapters) {
    const rawChunks = chunkText(ch.content, ch.title || `Chapter ${ch.sequence_number}`);

    for (const chunk of rawChunks) {
      const embedding = await generateEmbedding(chunk.content);
      
      await supabase.from('book_chunks').insert({
        book_id: bookId,
        chapter_id: ch.id,
        sequence_number: chunk.sequenceNumber,
        title: chunk.title,
        content: chunk.content,
        token_count: chunk.tokenCount,
        embedding: embedding,
      });

      totalChunks++;
    }
  }

  return totalChunks;
}

export async function searchRelevantChunks(bookId: string, query: string, limit = 4) {
  const queryEmbedding = await generateEmbedding(query);

  // 1. Attempt pgvector RPC match
  try {
    const { data: rpcMatches, error } = await supabase.rpc('match_book_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.1,
      match_count: limit,
      target_book_id: bookId,
    });

    if (!error && rpcMatches && rpcMatches.length > 0) {
      return rpcMatches;
    }
  } catch (err) {
    console.warn('RPC vector match fallback:', err);
  }

  // 2. Fallback text search or index auto-hydration if chunks don't exist
  const { data: existingChunks } = await supabase
    .from('book_chunks')
    .select('id, book_id, chapter_id, sequence_number, title, content')
    .eq('book_id', bookId)
    .limit(limit);

  if (existingChunks && existingChunks.length > 0) {
    return existingChunks.map((c: any, idx: number) => ({ ...c, similarity: 0.85 - idx * 0.05 }));
  }

  // Auto-index on the fly if never indexed before
  await indexBookChunks(bookId);

  const { data: freshChunks } = await supabase
    .from('book_chunks')
    .select('id, book_id, chapter_id, sequence_number, title, content')
    .eq('book_id', bookId)
    .limit(limit);

  return (freshChunks || []).map((c: any, idx: number) => ({ ...c, similarity: 0.9 - idx * 0.05 }));
}

export async function askTheBook(bookId: string, question: string) {
  const chunks = await searchRelevantChunks(bookId, question, 4);

  if (!chunks || chunks.length === 0) {
    return {
      answer: "I could not find enough text in this book to answer your question accurately.",
      citations: [],
      model: "readora-rag",
    };
  }

  const contextText = chunks.map((c: any, idx: number) => `[Source ${idx + 1} - ${c.title}]:\n${c.content}`).join('\n\n---\n\n');

  const systemPrompt = `You are Readora's AI Book Assistant. You must answer the user's question STRICTLY based on the provided book excerpts below.
RULES:
1. Base your answer ONLY on the provided book context.
2. Identify the specific chapter/section evidence in your answer.
3. If the answer cannot be determined from the excerpts, acknowledge uncertainty explicitly.
4. Do NOT fabricate quotations or introduce external facts not present in the text.
5. Display a polite, educational tone.`;

  const messages = [
    { role: 'system' as const, content: `BOOK EXCERPTS:\n${contextText}` },
    { role: 'user' as const, content: question },
  ];

  const completion = await generateCompletion(messages, systemPrompt);

  const citations = chunks.map((c: any, idx: number) => ({
    sourceId: idx + 1,
    chapterId: c.chapter_id,
    chapterTitle: c.title,
    excerpt: (c.content || '').slice(0, 180) + '...',
  }));

  // Log usage
  try {
    await supabase.from('ai_usage_logs').insert({
      feature: 'ask_the_book',
      model: completion.model,
      input_tokens: completion.inputTokens,
      output_tokens: completion.outputTokens,
      estimated_cost: (completion.inputTokens * 0.000001 + completion.outputTokens * 0.000002),
    });
  } catch (_) {}

  return {
    answer: completion.text,
    citations,
    model: completion.model,
  };
}
