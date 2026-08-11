# Development Roadmap

The development of the Global Copyright-Free Online Library is structured into 7 iterative phases to ensure stable delivery of functionality.

## Phase 1: Foundation (Completed)
- Next.js 15, React 19, TypeScript scaffolding.
- Tailwind v4 Design System and Global UI Components.
- Theme engine (Light/Dark/System).
- Supabase Auth integration (Login, Register, Logout).
- Initial Database migrations (Profiles, RLS).
- Landing page and navigation layout.

## Phase 2: Catalog & Database (Next)
- Implement full Supabase database schema (`books`, `authors`, `categories`).
- Build internal API endpoints for fetching library data.
- Develop the Catalog UI (Browsing, Filtering, Pagination).
- Implement Search functionality.

## Phase 3: Reader & Storage
- Cloudflare R2 integration for book file storage.
- Develop the web-based EPUB/PDF reader component.
- Implement Reading Progress tracking and bookmarking via Supabase.
- Build the user's personal Library dashboard.

## Phase 4: Ingestion Pipeline
- Build the admin interface for ingesting new books.
- Implement automated EPUB parsing and metadata extraction.
- Create the Copyright Review workflow UI.
- Background job processing setup.

## Phase 5: AI & RAG Integration
- Integrate OpenAI for generating vector embeddings of `book_chunks`.
- Integrate Anthropic Claude 3.5 for the conversational AI Assistant.
- Build the chat interface within the Reader.
- Implement semantic caching and context extraction.

## Phase 6: Admin & Monetization
- Integrate Stripe for Pro subscriptions and Institutional licensing.
- Build comprehensive Admin Dashboards (Audit logs, User management).
- Enforce AI rate limiting based on subscription tiers.

## Phase 7: Production & Launch
- Comprehensive E2E Testing.
- Accessibility audits.
- Performance optimization (Edge caching, Image optimization).
- Production deployment to Vercel and final domain mapping.
- Public launch.
