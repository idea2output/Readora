-- 1. Soft Deletion and Admin Status columns for Books
alter table public.books add column if not exists deleted_at timestamp with time zone default null;
alter table public.books add column if not exists admin_status text default 'published';

-- 2. User Roles & Account Status Table
create table if not exists public.user_roles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  role text default 'user' check (role in ('user', 'admin', 'org_admin')),
  status text default 'active' check (status in ('active', 'suspended')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_roles enable row level security;
create policy "User roles viewable by admin & user" on public.user_roles for select using (true);
create policy "User roles editable by admin" on public.user_roles for all using (true);

-- 3. User Subscriptions Table (Stripe integration)
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free' check (plan in ('free', 'student', 'pro', 'institutional')),
  status text default 'active',
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;
create policy "Subscriptions viewable by user" on public.subscriptions for select using (true);

-- 4. Organizations (Institutional Accounts)
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  owner_id uuid references auth.users(id) on delete set null,
  max_seats integer default 100,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.organizations enable row level security;
create policy "Organizations viewable by members" on public.organizations for select using (true);

-- Organization Members
create table if not exists public.organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, user_id)
);

alter table public.organization_members enable row level security;
create policy "Organization members viewable by members" on public.organization_members for select using (true);

-- 5. Immutable Audit Logs Table
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id text default 'system',
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;
create policy "Audit logs viewable by admin" on public.audit_logs for select using (true);
create policy "Audit logs insertable by admin" on public.audit_logs for insert with check (true);

-- Add default monetization & stripe settings (Monetization disabled by default as requested!)
insert into public.system_settings (key, value, is_secret) values
  ('monetization_enabled', 'false', false),
  ('stripe_secret_key', '', true),
  ('stripe_webhook_secret', '', true),
  ('resend_api_key', '', true)
on conflict (key) do nothing;
