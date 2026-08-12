export interface Chunk {
  sequenceNumber: number;
  title: string;
  content: string;
  tokenCount: number;
}

export function chunkText(htmlOrText: string, chapterTitle = 'Chapter', targetTokens = 750): Chunk[] {
  if (!htmlOrText) return [];

  // Strip HTML tags to extract raw text paragraphs
  const cleanText = htmlOrText
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n');

  const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 10);
  const chunks: Chunk[] = [];

  let currentParagraphs: string[] = [];
  let currentTokens = 0;
  let seq = 1;

  for (const p of paragraphs) {
    const pTokens = Math.ceil(p.length / 4); // ~4 chars per token rule of thumb

    if (currentTokens + pTokens > targetTokens && currentParagraphs.length > 0) {
      chunks.push({
        sequenceNumber: seq++,
        title: `${chapterTitle} (Part ${seq - 1})`,
        content: currentParagraphs.join('\n\n'),
        tokenCount: currentTokens,
      });
      currentParagraphs = [];
      currentTokens = 0;
    }

    currentParagraphs.push(p.trim());
    currentTokens += pTokens;
  }

  if (currentParagraphs.length > 0) {
    chunks.push({
      sequenceNumber: seq,
      title: `${chapterTitle} (Part ${seq})`,
      content: currentParagraphs.join('\n\n'),
      tokenCount: currentTokens,
    });
  }

  return chunks;
}
