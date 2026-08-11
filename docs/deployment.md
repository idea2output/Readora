# Deployment Architecture

The application is designed to be highly scalable and deployed seamlessly via modern CI/CD pipelines.

## Environments

1. **Local Development**: Runs via `npm run dev`. Connects to a local Supabase instance (via Supabase CLI) or a dedicated staging remote project.
2. **Preview (Staging)**: Automatically deployed on every Pull Request.
3. **Production**: Deployed upon merging to the `main` branch.

## Hosting & Services

### Frontend & API (Vercel)
- The Next.js application will be deployed on Vercel.
- Vercel provides Edge functions for ultra-fast middleware execution (Auth routing) and Serverless functions for heavy API tasks.

### Database (Supabase Cloud)
- Managed PostgreSQL database.
- pgvector enabled.
- Daily automated backups.
- Connection pooling configured for Serverless environments (PgBouncer/Supavisor).

### Storage (Cloudflare R2)
- Cloudflare R2 provides S3-compatible storage.
- Custom domain (`cdn.global-library.org`) routed through Cloudflare for edge caching of book files.

## CI/CD Pipeline (GitHub Actions)

1. **Lint & Test**: Runs ESLint, Type Checking (`tsc --noEmit`), and Vitest on every commit.
2. **Build Verification**: Ensures `npm run build` succeeds.
3. **Database Migrations**: Applies Supabase migrations to the staging database on PRs, and to production on merge.

## Environment Variables
- Handled securely via Vercel Environment Variables.
- CI/CD pulls secrets securely via GitHub Secrets.
