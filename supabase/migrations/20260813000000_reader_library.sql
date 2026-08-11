-- Migration: Phase 3 Reader & Library
-- Creates tables for personal library, reading progress, and bookmarks.
-- Adds content column to chapters table.

-- 1. Add content column to chapters
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS content text;

-- 2. Personal Library (Saved, Reading, Completed, Favorites)
CREATE TABLE public.personal_library (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    status text DEFAULT 'saved' NOT NULL, -- saved, reading, completed
    is_favorite boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT personal_library_pkey PRIMARY KEY (user_id, book_id)
);

-- 3. Reading Progress
CREATE TABLE public.reading_progress (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
    percentage numeric(5,2) DEFAULT 0,
    cfi_location text,
    last_read_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reading_progress_pkey PRIMARY KEY (user_id, book_id)
);

-- 4. Bookmarks
CREATE TABLE public.bookmarks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
    cfi_location text NOT NULL,
    label text,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bookmarks_pkey PRIMARY KEY (id)
);

-- Indexes for performance
CREATE INDEX personal_library_user_idx ON public.personal_library(user_id);
CREATE INDEX reading_progress_user_idx ON public.reading_progress(user_id);
CREATE INDEX bookmarks_user_book_idx ON public.bookmarks(user_id, book_id);

-- RLS POLICIES
ALTER TABLE public.personal_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own library data
CREATE POLICY "Users can view own library" ON public.personal_library FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own library" ON public.personal_library FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own library" ON public.personal_library FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own library" ON public.personal_library FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON public.reading_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.reading_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookmarks" ON public.bookmarks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);
