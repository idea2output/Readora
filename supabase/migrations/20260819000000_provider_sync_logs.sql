-- Migration: Provider Sync Logs for Catalog Synchronization Audit
create table if not exists public.provider_sync_logs (
  id uuid default gen_random_uuid() primary key,
  provider_id text references public.sources(id) on delete cascade not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'success' check (status in ('success', 'failed', 'partial')),
  books_found integer default 0,
  books_created integer default 0,
  books_updated integer default 0,
  books_failed integer default 0,
  error_message text,
  triggered_by text default 'Admin'
);

-- Enable Row Level Security
alter table public.provider_sync_logs enable row level security;

-- 1. Read Policy: Only authenticated administrators can read sync logs
create policy "Provider sync logs readable by admin"
  on public.provider_sync_logs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role in ('admin', 'org_admin')
    )
  );

-- 2. Write Policy: Only authenticated administrators (or server service-role) can insert/update/delete sync logs
create policy "Provider sync logs writable by admin"
  on public.provider_sync_logs
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role in ('admin', 'org_admin')
    )
  )
  with check (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role in ('admin', 'org_admin')
    )
  );
