-- Enable vector extension for RAG semantic search
create extension if not exists vector with schema extensions;

-- System Settings table (for dynamic API keys & AI configuration in Admin)
create table if not exists public.system_settings (
  key text primary key,
  value text,
  is_secret boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for system_settings
alter table public.system_settings enable row level security;
create policy "System settings viewable by authenticated users" on public.system_settings
  for select using (true);

-- Insert default configurations if missing
insert into public.system_settings (key, value, is_secret) values
  ('ai_provider', 'openai', false),
  ('embedding_provider', 'openai', false),
  ('openai_api_key', '', true),
  ('anthropic_api_key', '', true),
  ('gemini_api_key', '', true),
  ('chunk_size_tokens', '750', false),
  ('daily_user_quota', '50', false)
on conflict (key) do nothing;

-- Book Chunks table for RAG vector search
create table if not exists public.book_chunks (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  chapter_id uuid references public.chapters(id) on delete cascade not null,
  sequence_number integer not null,
  title text,
  content text not null,
  token_count integer default 0,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for sub-second cosine similarity search
create index if not exists book_chunks_embedding_idx on public.book_chunks 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.book_chunks enable row level security;
create policy "Book chunks viewable by everyone" on public.book_chunks for select using (true);

-- Vector Similarity Search Function
create or replace function public.match_book_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  target_book_id uuid default null
)
returns table (
  id uuid,
  book_id uuid,
  chapter_id uuid,
  sequence_number int,
  title text,
  content text,
  similarity float
)
language plpgsql
security definer set search_path = public
as $$
begin
  return query
  select
    book_chunks.id,
    book_chunks.book_id,
    book_chunks.chapter_id,
    book_chunks.sequence_number,
    book_chunks.title,
    book_chunks.content,
    1 - (book_chunks.embedding <=> query_embedding) as similarity
  from public.book_chunks
  where (target_book_id is null or book_chunks.book_id = target_book_id)
    and 1 - (book_chunks.embedding <=> query_embedding) > match_threshold
  order by book_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Revoke public execution of SECURITY DEFINER vector match function
revoke execute on function public.match_book_chunks(vector(1536), float, int, uuid) from public, anon, authenticated;
grant execute on function public.match_book_chunks(vector(1536), float, int, uuid) to service_role;

-- Chapter Summaries Cache
create table if not exists public.chapter_summaries (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  chapter_id uuid references public.chapters(id) on delete cascade not null,
  short_summary text not null,
  detailed_summary text not null,
  key_points jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(chapter_id)
);

alter table public.chapter_summaries enable row level security;
create policy "Summaries viewable by everyone" on public.chapter_summaries for select using (true);

-- Book Characters Graph
create table if not exists public.book_characters (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  name text not null,
  role text,
  description text,
  relationships text,
  first_appearance text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.book_characters enable row level security;
create policy "Characters viewable by everyone" on public.book_characters for select using (true);

-- AI Usage & Quota Logs
create table if not exists public.ai_usage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id text default 'anonymous',
  feature text not null,
  model text,
  input_tokens integer default 0,
  output_tokens integer default 0,
  estimated_cost numeric(10, 6) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ai_usage_logs enable row level security;
create policy "Usage logs insertable" on public.ai_usage_logs for insert with check (true);
create policy "Usage logs viewable by admin" on public.ai_usage_logs for select using (true);
