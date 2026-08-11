-- Migration: Phase 2 Catalog, Search & Discovery
-- Creates authors, categories, books, and relational tables with RLS and full-text search.

-- 1. Authors
CREATE TABLE public.authors (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    biography text,
    birth_year integer,
    death_year integer,
    wikipedia_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT authors_pkey PRIMARY KEY (id)
);

-- 2. Categories (Hierarchical standard classification)
CREATE TABLE public.categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- 3. Books
CREATE TABLE public.books (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    subtitle text,
    slug text NOT NULL UNIQUE,
    author_id uuid REFERENCES public.authors(id) ON DELETE CASCADE,
    publication_year integer,
    language text DEFAULT 'en' NOT NULL,
    genre text,
    description text,
    cover_url text,
    source_url text,
    license text,
    copyright_status text DEFAULT 'public_domain',
    status text DEFAULT 'draft' NOT NULL, -- draft, review_pending, published, rejected
    word_count integer DEFAULT 0,
    reading_time_minutes integer DEFAULT 0,
    fts tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(subtitle, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'C')
    ) STORED,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT books_pkey PRIMARY KEY (id)
);

-- Index for full-text search
CREATE INDEX books_fts_idx ON public.books USING GIN (fts);
-- Index for fetching by status/author efficiently
CREATE INDEX books_status_idx ON public.books(status);
CREATE INDEX books_author_id_idx ON public.books(author_id);

-- 4. Book Categories (Many-to-Many)
CREATE TABLE public.book_categories (
    book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, category_id)
);

-- 5. Book Files
CREATE TABLE public.book_files (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
    format text NOT NULL, -- epub, pdf, txt
    r2_key text NOT NULL,
    size_bytes bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT book_files_pkey PRIMARY KEY (id)
);

-- 6. Chapters (Structural Metadata)
CREATE TABLE public.chapters (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
    title text,
    sequence_number integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chapters_pkey PRIMARY KEY (id)
);

CREATE INDEX chapters_book_id_seq_idx ON public.chapters(book_id, sequence_number);

-- RLS POLICIES

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all authors and categories
CREATE POLICY "Public profiles are viewable by everyone." ON public.authors FOR SELECT USING (true);
CREATE POLICY "Public categories are viewable by everyone." ON public.categories FOR SELECT USING (true);

-- Allow public read access to PUBLISHED books and their related entities
CREATE POLICY "Published books are viewable by everyone." ON public.books FOR SELECT USING (status = 'published');
CREATE POLICY "Book categories viewable if book is published." ON public.book_categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.books WHERE books.id = book_categories.book_id AND books.status = 'published')
);
CREATE POLICY "Book files viewable if book is published." ON public.book_files FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.books WHERE books.id = book_files.book_id AND books.status = 'published')
);
CREATE POLICY "Chapters viewable if book is published." ON public.chapters FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.books WHERE books.id = chapters.book_id AND books.status = 'published')
);

-- Note: Mutations (INSERT/UPDATE/DELETE) will be handled via Service Role Key (Admin) 
-- on the Next.js server for now, so no public mutation policies are provided.
