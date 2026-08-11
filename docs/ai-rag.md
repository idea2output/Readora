# AI & RAG Architecture

The Global Library features an AI Reading Assistant designed to help readers understand archaic language, historical context, and philosophical concepts found in public domain literature.

## Provider Abstraction

To avoid vendor lock-in and support local LLM execution, all AI interactions pass through a `ProviderService` interface.

```typescript
interface AIProvider {
  generateResponse(prompt: string, context: RAGContext): Promise<string>;
  streamResponse(prompt: string, context: RAGContext): ReadableStream;
}

interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}
```

### Supported Providers
- **Anthropic Claude 3.5 Sonnet** (Primary `AIProvider`): Chosen for its massive context window (200k tokens), enabling it to ingest entire chapters or books alongside the prompt for deep literary analysis.
- **OpenAI `text-embedding-3-small`** (Primary `EmbeddingProvider`): Cost-effective and highly performant for vectorizing the `book_chunks` during ingestion.
- **Local Fallback**: An implementation connecting to `LOCAL_LLM_BASE_URL` (e.g., Ollama running Llama 3) for development or open-source self-hosting deployments.

## Retrieval-Augmented Generation (RAG) Flow

When a user asks a question while reading:

1. **Context Extraction**: The frontend sends the user's query along with their current location in the book (`cfi`) and any highlighted text.
2. **Query Vectorization**: The backend uses the `EmbeddingProvider` to convert the user's question into a vector.
3. **Similarity Search (pgvector)**: Supabase queries the `embeddings` table for the most semantically similar `book_chunks` related to the query and the current book.
4. **Prompt Assembly**: The retrieved chunks, the user's current reading position, and the system prompt (enforcing a helpful, academic persona) are combined.
5. **Generation**: The `AIProvider` generates a response and streams it back to the client.

## Caching & Cost Control
- Semantic caching: Common questions ("Who is Mr. Darcy?") are hashed and cached in `ai_cache` to reduce API calls.
- Usage tracking: `ai_usage` tracks tokens per user to enforce tier-based rate limits.
