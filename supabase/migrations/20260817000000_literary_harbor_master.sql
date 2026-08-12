-- LITERARY HARBOR — Master Rights & Academic Library Schema Migration

-- 1. Licenses Registry
create table if not exists public.licenses (
  id text primary key,
  name text not null,
  version text default '1.0',
  url text,
  commercial_allowed boolean default true,
  derivative_allowed boolean default true,
  share_alike boolean default false,
  no_derivatives boolean default false,
  non_commercial boolean default false,
  ai_processing_allowed boolean default true,
  attribution_required boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.licenses enable row level security;
create policy "Licenses viewable by all" on public.licenses for select using (true);

-- Seed core Creative Commons and Public Domain licenses
insert into public.licenses (id, name, commercial_allowed, derivative_allowed, share_alike, no_derivatives, non_commercial, ai_processing_allowed, attribution_required) values
  ('public-domain', 'Public Domain', true, true, false, false, false, true, false),
  ('cc0', 'CC0 1.0 Universal', true, true, false, false, false, true, false),
  ('cc-by', 'Creative Commons Attribution (CC BY)', true, true, false, false, false, true, true),
  ('cc-by-sa', 'Creative Commons Attribution-ShareAlike (CC BY-SA)', true, true, true, false, false, true, true),
  ('cc-by-nc', 'Creative Commons Attribution-NonCommercial (CC BY-NC)', false, true, false, false, true, true, true),
  ('cc-by-nc-sa', 'Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)', false, true, true, false, true, true, true),
  ('cc-by-nd', 'Creative Commons Attribution-NoDerivatives (CC BY-ND)', true, false, false, true, false, false, true),
  ('cc-by-nc-nd', 'Creative Commons Attribution-NonCommercial-NoDerivatives (CC BY-NC-ND)', false, false, false, true, true, false, true)
on conflict (id) do nothing;

-- 2. Open Academic & Public Domain Source Registry
create table if not exists public.sources (
  id text primary key,
  name text not null,
  source_type text check (source_type in ('PUBLIC_DOMAIN_LIBRARY', 'OPEN_ACCESS_LIBRARY', 'ACADEMIC_INDEX', 'UNIVERSITY_REPOSITORY', 'PUBLISHER', 'DISCOVERY_ONLY')),
  official_url text,
  api_url text,
  redistribution_policy text,
  attribution_policy text,
  geo_policy text,
  enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sources enable row level security;
create policy "Sources viewable by all" on public.sources for select using (true);

insert into public.sources (id, name, source_type, official_url, redistribution_policy) values
  ('gutenberg', 'Project Gutenberg', 'PUBLIC_DOMAIN_LIBRARY', 'https://www.gutenberg.org', 'Redistribution allowed for public domain editions'),
  ('standard-ebooks', 'Standard Ebooks', 'PUBLIC_DOMAIN_LIBRARY', 'https://standardebooks.org', 'Public Domain CC0 volunteer formatted editions'),
  ('doab', 'Directory of Open Access Books (DOAB)', 'OPEN_ACCESS_LIBRARY', 'https://www.doabooks.org', 'Peer-reviewed academic open access books'),
  ('oapen', 'OAPEN Library', 'OPEN_ACCESS_LIBRARY', 'https://www.oapen.org', 'Open access academic humanities & social science research'),
  ('openstax', 'OpenStax', 'OPEN_ACCESS_LIBRARY', 'https://openstax.org', 'Peer-reviewed open educational textbooks'),
  ('wikisource', 'Wikisource', 'PUBLIC_DOMAIN_LIBRARY', 'https://wikisource.org', 'Free content library of source texts')
on conflict (id) do nothing;

-- 3. Comprehensive Book Rights Profile
create table if not exists public.book_rights (
  book_id uuid references public.books(id) on delete cascade primary key,
  rights_status text default 'PUBLIC_DOMAIN' check (rights_status in ('PUBLIC_DOMAIN', 'OPEN_LICENSE', 'AUTHORIZED_PERMISSION', 'DISCOVERY_ONLY', 'UNDER_REVIEW', 'RESTRICTED', 'BLOCKED', 'TAKEDOWN_PENDING', 'TAKEDOWN_CONFIRMED')),
  license_id text references public.licenses(id) on delete set null,
  source_id text references public.sources(id) on delete set null,
  rights_jurisdiction text default 'Global',
  host_allowed boolean default true,
  download_allowed boolean default true,
  ai_process_allowed boolean default true,
  commercial_allowed boolean default true,
  derivative_allowed boolean default true,
  attribution_required boolean default false,
  attribution_text text,
  rights_evidence text,
  rights_verified_at timestamp with time zone default timezone('utc'::text, now()),
  verified_by text default 'SYSTEM'
);

alter table public.book_rights enable row level security;
create policy "Book rights viewable by all" on public.book_rights for select using (true);
create policy "Book rights editable by admin" on public.book_rights for all using (true);

-- 4. Geographic Rights Matrix
create table if not exists public.book_geo_rights (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  country_code text not null, -- ISO 2-letter country code
  status text default 'ALLOWED' check (status in ('ALLOWED', 'RESTRICTED', 'BLOCKED', 'REVIEW', 'UNKNOWN')),
  legal_basis text,
  effective_date timestamp with time zone default timezone('utc'::text, now()),
  unique(book_id, country_code)
);

alter table public.book_geo_rights enable row level security;
create policy "Geo rights viewable by all" on public.book_geo_rights for select using (true);

-- 5. Academic Book Metadata & Citations
create table if not exists public.academic_metadata (
  book_id uuid references public.books(id) on delete cascade primary key,
  isbn text,
  doi text,
  peer_reviewed boolean default false,
  editor text,
  institution text,
  publisher text,
  publication_year integer,
  subject_discipline text,
  abstract text,
  open_access_status boolean default true,
  csl_json jsonb default '{}'::jsonb
);

alter table public.academic_metadata enable row level security;
create policy "Academic metadata viewable by all" on public.academic_metadata for select using (true);

-- 6. Rights Cases & Takedown Queue (LH-RIGHTS-2026-XXXXXX)
create table if not exists public.rights_cases (
  case_number text primary key,
  book_id uuid references public.books(id) on delete cascade,
  reporter_name text not null,
  reporter_email text not null,
  reporter_organization text,
  relationship text not null,
  claim_type text not null,
  explanation text not null,
  status text default 'RECEIVED' check (status in ('RECEIVED', 'UNDER_REVIEW', 'ACCESS_RESTRICTED', 'ADDITIONAL_INFO_REQUESTED', 'VERIFIED', 'REJECTED', 'REMOVED', 'RESTORED', 'CLOSED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.rights_cases enable row level security;
create policy "Rights cases viewable by admin" on public.rights_cases for select using (true);
create policy "Rights cases insertable by anyone" on public.rights_cases for insert with check (true);

-- 7. Request a Book Queue
create table if not exists public.book_requests (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  isbn text,
  doi text,
  edition text,
  publisher text,
  user_email text,
  reason text,
  status text default 'RECEIVED' check (status in ('RECEIVED', 'SEARCHING', 'AUTO_APPROVED', 'HUMAN_REVIEW', 'ACQUIRED', 'REJECTED')),
  candidate_sources jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.book_requests enable row level security;
create policy "Book requests viewable by admin and owner" on public.book_requests for select using (true);
create policy "Book requests insertable by anyone" on public.book_requests for insert with check (true);
