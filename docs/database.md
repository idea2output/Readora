# Database Schema Design

The following represents the complete PostgreSQL schema tailored for Supabase.

## User & Access Management

### `profiles`
- `id` (uuid, pk, fk -> auth.users)
- `display_name` (text, nullable)
- `avatar_url` (text, nullable)
- `role` (text, default 'user' - references User Roles enum)
- `theme_preference` (text, default 'system')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### `organizations`
- `id` (uuid, pk)
- `name` (text, not null)
- `domain` (text, unique, nullable)
- `stripe_customer_id` (text, unique)
- `created_at` (timestamptz)

### `organization_members`
- `org_id` (uuid, pk, fk -> organizations)
- `user_id` (uuid, pk, fk -> profiles)
- `role` (text) - e.g., 'admin', 'member'
- `created_at` (timestamptz)

## Catalog & Content

### `authors`
- `id` (uuid, pk)
- `name` (text, not null)
- `bio` (text)
- `birth_year` (int)
- `death_year` (int)
- `wikipedia_url` (text)
- `created_at` (timestamptz)

### `categories`
- `id` (uuid, pk)
- `name` (text, not null, unique)
- `slug` (text, not null, unique)
- `parent_id` (uuid, fk -> categories)

### `books`
- `id` (uuid, pk)
- `title` (text, not null)
- `slug` (text, not null, unique)
- `author_id` (uuid, fk -> authors)
- `published_year` (int)
- `language` (text, default 'en')
- `description` (text)
- `cover_image_url` (text)
- `status` (text) - e.g., 'processing', 'review', 'published'
- `view_count` (int, default 0)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- *Index*: `author_id`, `status`

### `book_categories`
- `book_id` (uuid, pk, fk -> books)
- `category_id` (uuid, pk, fk -> categories)

### `book_files`
- `id` (uuid, pk)
- `book_id` (uuid, fk -> books)
- `file_type` (text) - e.g., 'epub', 'txt', 'pdf'
- `r2_object_key` (text, not null)
- `file_size_bytes` (bigint)
- `created_at` (timestamptz)

## Reading structural data

### `chapters`
- `id` (uuid, pk)
- `book_id` (uuid, fk -> books)
- `title` (text)
- `sequence_number` (int, not null)
- `created_at` (timestamptz)
- *Index*: `book_id, sequence_number`

### `book_chunks` (For AI / RAG)
- `id` (uuid, pk)
- `chapter_id` (uuid, fk -> chapters)
- `book_id` (uuid, fk -> books)
- `content` (text, not null)
- `chunk_index` (int)
- `token_count` (int)

### `embeddings` (pgvector)
- `id` (uuid, pk)
- `chunk_id` (uuid, fk -> book_chunks)
- `embedding` (vector(1536)) -- Dimensions depend on OpenAI model
- *Index*: ivfflat or hnsw on `embedding`

## Reader State

### `reading_progress`
- `user_id` (uuid, pk, fk -> profiles)
- `book_id` (uuid, pk, fk -> books)
- `cfi` (text) -- EPUB Canonical Fragment Identifier
- `percentage` (float)
- `last_read_at` (timestamptz)

### `bookmarks`
- `id` (uuid, pk)
- `user_id` (uuid, fk -> profiles)
- `book_id` (uuid, fk -> books)
- `cfi` (text)
- `note` (text, nullable)
- `created_at` (timestamptz)

### `favorites` & `reading_history`
- Similar to `reading_progress`, mapping `user_id` to `book_id` with timestamps.

## AI Functionality

### `ai_conversations`
- `id` (uuid, pk)
- `user_id` (uuid, fk -> profiles)
- `book_id` (uuid, fk -> books)
- `created_at` (timestamptz)

### `ai_messages`
- `id` (uuid, pk)
- `conversation_id` (uuid, fk -> ai_conversations)
- `role` (text) - 'user' or 'assistant'
- `content` (text)
- `created_at` (timestamptz)

### `ai_usage`
- `id` (uuid, pk)
- `user_id` (uuid, fk -> profiles)
- `tokens_used` (int)
- `model` (text)
- `created_at` (timestamptz)

### `ai_cache`
- `id` (uuid, pk)
- `query_hash` (text, unique)
- `response` (text)
- `created_at` (timestamptz)

## Subscriptions & Admin

### `plans` & `subscriptions`
- Tables bridging Stripe Webhooks (e.g., `stripe_customer_id`, `status`, `current_period_end`).

### `copyright_reviews` & `copyright_claims`
- `id`, `book_id`, `reviewer_id`, `status` ('pending', 'cleared', 'rejected'), `notes`, `created_at`.

### `ingestion_jobs`
- `id`, `source_url`, `status` ('downloading', 'parsing', 'vectorizing', 'completed', 'failed'), `error_logs`, `created_at`.

### `audit_logs` & `system_settings`
- Tracking admin actions (e.g., overriding a copyright status) and key-value system settings.
