# Book Ingestion & Lifecycle

The pipeline for bringing a new book into the Global Library is strictly regulated to ensure formatting quality, metadata accuracy, and most importantly, legal copyright clearance.

## The Ingestion Pipeline

```text
[ Source (e.g., Project Gutenberg / Standard Ebooks) ]
                         │
                         ▼
1. INGESTION (Triggered via Admin UI / Script)
   - Downloads the raw file (EPUB/TXT).
   - Extracts basic metadata (Title, Author).
   - State: `downloading` -> `parsing`
                         │
                         ▼
2. VALIDATION
   - EPUB formatting is verified.
   - Text is cleaned (removing generic headers/footers).
                         │
                         ▼
3. COPYRIGHT REVIEW (Manual / Assisted)
   - A `copyright_reviewer` verifies the public domain status.
   - Checks US copyright (pre-1929) and Life+70 rules where applicable.
   - State: `review_pending` -> `cleared`
                         │
                         ▼
4. PROCESSING & INDEXING
   - Book is split into `chapters`.
   - Chapters are chunked into `book_chunks` (approx 500-1000 tokens).
   - Chunks are sent to OpenAI to generate embeddings.
   - Embeddings are stored in pgvector.
   - Files are uploaded to Cloudflare R2.
   - State: `processing` -> `indexing`
                         │
                         ▼
5. HUMAN APPROVAL
   - Final formatting check by `content_editor`.
                         │
                         ▼
6. PUBLISHED
   - Status updated to `published`.
   - Book appears in search and catalog.
```

## Book Statuses

- `draft`: Initial creation, incomplete metadata.
- `processing`: Background jobs are actively downloading/parsing.
- `review_pending`: Awaiting legal clearance.
- `cleared`: Legally cleared, awaiting final formatting checks.
- `rejected`: Failed copyright review or formatting standards.
- `published`: Live on the platform.
- `archived`: Removed from public view (takedown or replacement).
