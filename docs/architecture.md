# Application Architecture

## System Overview

The Global Copyright-Free Online Library is built on a modern, serverless edge architecture prioritizing performance, accessibility, and scalability.

```text
[ Browser / Client ]
        │
        ▼
[ Next.js App Router (React 19) ]  <─── [ Cloudflare R2 (Book Assets: EPUB/PDF/TXT) ]
        │
        ├─▶ [ Next.js Server Actions / API Routes ]
        │          │
        │          ├─▶ [ Supabase / PostgreSQL (Relational Data & Auth) ]
        │          │          └─▶ pgvector (Semantic Embeddings)
        │          │
        │          ├─▶ [ AI Service Abstraction ]
        │          │          ├─▶ Anthropic Claude API (Primary Chat/RAG)
        │          │          ├─▶ OpenAI API (Embeddings)
        │          │          └─▶ Local Provider (Fallback)
        │          │
        │          ├─▶ [ Stripe API (Subscriptions / Institutional Access) ]
        │          │
        │          └─▶ [ Resend (Transactional Emails) ]
```

## Component Responsibilities

### 1. Next.js & React (Frontend & API)
- **Routing & Rendering**: App Router (`/app`) for hybrid server/client rendering.
- **Styling**: Tailwind CSS v4 for rapid, utility-first design ensuring the "calm, elegant" aesthetic.
- **API/Server Actions**: Handles secure backend operations (DB queries, AI orchestration, payment processing) without exposing secrets.

### 2. Supabase / PostgreSQL (Database & Auth)
- **Auth**: Supabase Auth handles user sessions (JWT), registration, login, and OAuth seamlessly.
- **Relational DB**: Stores all metadata (users, books, chapters, progress).
- **pgvector**: Stores vectorized chunks of text for semantic search and RAG.
- **Row Level Security (RLS)**: Enforces tenant isolation strictly at the database level.

### 3. Cloudflare R2 (Storage)
- Responsible for storing the actual files (EPUB, TXT, PDF, Cover Images).
- Chosen for its zero-egress fee structure, which is critical for a public library distributing massive amounts of media.

### 4. AI Providers
- **Anthropic Claude**: Powers the primary AI Reading Assistant, chosen for its large context window and strong literary comprehension.
- **OpenAI**: Powers the embedding generation (`text-embedding-3-small`) for book chunks.

### 5. Stripe
- Handles all monetization: Pro subscriptions, institutional access billing, and webhook event processing.

### 6. Analytics
- **PostHog / Plausible**: Tracks usage patterns, popular books, and feature engagement without violating user privacy.
