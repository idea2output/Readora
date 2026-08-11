# API Surface Design

The API will be implemented primarily through Next.js Server Actions for internal frontend consumption, and REST endpoints (`/api/v1/*`) for external integrations.

## 1. Catalog & Books
- `GET /api/v1/books`: List books (supports pagination, filtering by category/author/language).
- `GET /api/v1/books/:slug`: Retrieve full book metadata.
- `GET /api/v1/books/:slug/download/:format`: Generates a signed URL to Cloudflare R2 for EPUB/PDF download.
- `GET /api/v1/search?q=...`: Full-text search across books and authors.

## 2. Reader & Progress
- `POST /api/v1/reader/progress`: Upsert current reading CFI and percentage for a user.
- `GET /api/v1/reader/progress/:book_id`: Retrieve the user's last saved position.
- `POST /api/v1/reader/bookmarks`: Create a new bookmark.
- `GET /api/v1/reader/bookmarks/:book_id`: Retrieve all bookmarks for a specific book.

## 3. AI & Assistance
- `POST /api/v1/ai/chat`: Send a message to the AI Reading Assistant.
  - Payload: `{ bookId, currentCfi, selectedText, message, conversationId }`
  - Response: Server-Sent Events (SSE) stream for typing effect.
- `POST /api/v1/ai/explain`: Quick action to explain a specific highlighted concept or archaic word.

## 4. Authentication
*(Primarily handled by Supabase Auth internally, but exposed for clarity)*
- `POST /api/v1/auth/login`: Authenticate and set HttpOnly cookies.
- `POST /api/v1/auth/register`: Create a new account.
- `POST /api/v1/auth/logout`: Destroy session.

## 5. Stripe (Webhooks)
- `POST /api/v1/webhooks/stripe`: Receive and verify Stripe events (`invoice.payment_succeeded`, `customer.subscription.updated`).

## 6. Admin
- `POST /api/v1/admin/ingest`: Trigger a new background ingestion job.
- `PATCH /api/v1/admin/books/:id/status`: Approve or reject a book's publication status.
- `GET /api/v1/admin/audit`: Fetch system audit logs.
