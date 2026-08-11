# Security Model

The security of the Global Copyright-Free Online Library is paramount, especially concerning user reading data, institutional access, and AI rate limits.

## 1. Authentication & Authorization

- **Authentication**: Managed entirely by Supabase Auth (JWT). We do not store passwords locally.
- **Roles**:
  - `visitor`: Unauthenticated. Can read books and search.
  - `user`: Authenticated. Can save progress, bookmark, basic AI.
  - `student` / `institutional_user`: Granted access via `organizations` mapping.
  - `pro`: Paid Stripe subscriber (higher AI limits).
  - `librarian` / `content_editor`: Can edit metadata, run ingestion jobs.
  - `copyright_reviewer`: Specific permission to clear `copyright_reviews`.
  - `admin` / `super_admin`: Full system access, audit logs.

## 2. Row Level Security (RLS)

Every table in Supabase has strict RLS enabled:
- `books`: `SELECT` is public if `status = 'published'`. Other mutations are limited to `admin` / `librarian`.
- `reading_progress` & `bookmarks`: `SELECT`, `INSERT`, `UPDATE`, `DELETE` where `auth.uid() = user_id`.
- `profiles`: Users can read/write their own profile. Public can read limited data (like `display_name`).
- `ai_conversations`: Isolated completely to `auth.uid() = user_id`.

## 3. API & AI Security

- **Server-Side Execution**: All AI requests (Anthropic/OpenAI) happen via Next.js Server Actions or Route Handlers. API keys (`ANTHROPIC_API_KEY`) are NEVER exposed to the client.
- **Rate Limiting**: Implementation of Upstash Redis (or Supabase equivalent) to rate limit AI requests per user to prevent abuse and manage costs.
- **Prompt Injection**: AI prompts are strictly templated. User input is sanitized and heavily constrained by the system prompt.

## 4. Secret Management
- Secrets are stored in Vercel/Cloudflare environment variables.
- `SUPABASE_SERVICE_ROLE_KEY` is only used in server environments for bypassing RLS during internal syncs/webhooks.

## 5. Stripe Webhook Verification
- Route handlers for Stripe Webhooks use `stripe.webhooks.constructEvent` with the `STRIPE_WEBHOOK_SECRET` to mathematically verify the payload originated from Stripe before updating `subscriptions` rows.

## 6. Audit Logging
- Destructive actions by admins (deleting a book, overriding copyright) trigger a database function that writes to `audit_logs` containing the `user_id`, `action`, and `timestamp`.
