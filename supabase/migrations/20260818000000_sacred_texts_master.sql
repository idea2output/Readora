-- Literary Harbor Master Specification: Sacred Texts Module & AI Isolation Schema
-- Migration File: 20260818000000_sacred_texts_master.sql

-- 1. Extend Books Table with Content Domain & AI Enabler
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS content_domain TEXT DEFAULT 'LITERATURE' 
CHECK (content_domain IN ('LITERATURE', 'ACADEMIC', 'OPEN_TEXTBOOK', 'HISTORY', 'PHILOSOPHY', 'SACRED_TEXT', 'OTHER')),
ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT true;

-- Enforce AI Disabled for Sacred Texts
CREATE OR REPLACE FUNCTION enforce_sacred_text_ai_isolation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_domain = 'SACRED_TEXT' THEN
    NEW.ai_enabled := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sacred_text_ai_isolation ON public.books;
CREATE TRIGGER trigger_sacred_text_ai_isolation
BEFORE INSERT OR UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION enforce_sacred_text_ai_isolation();

-- 2. Sacred Religious & Philosophical Traditions Taxonomy Table
CREATE TABLE IF NOT EXISTS public.sacred_traditions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial 13+ Scalable Traditions
INSERT INTO public.sacred_traditions (id, name, slug, description, display_order) VALUES
('islam', 'Islam', 'islam', 'Quran, Hadith collections, Tafsir, and classical Islamic literature.', 1),
('christianity', 'Christianity', 'christianity', 'Old & New Testaments, Gospels, and early Christian writings.', 2),
('judaism', 'Judaism', 'judaism', 'Torah, Tanakh, Talmud, Midrash, and Jewish philosophy.', 3),
('hinduism', 'Hinduism', 'hinduism', 'Vedas, Upanishads, Bhagavad Gita, Puranas, Ramayana, and Mahabharata.', 4),
('buddhism', 'Buddhism', 'buddhism', 'Pali Canon, Sutras, Suttas, and Buddhist philosophical works.', 5),
('sikhism', 'Sikhism', 'sikhism', 'Guru Granth Sahib and Sikh historical texts.', 6),
('jainism', 'Jainism', 'jainism', 'Agamas and Jain philosophical works.', 7),
('bahai', 'Baháʼí Faith', 'bahai', 'Sacred writings and theological works.', 8),
('zoroastrianism', 'Zoroastrianism', 'zoroastrianism', 'Avesta and historical religious writings.', 9),
('taoism', 'Taoism', 'taoism', 'Tao Te Ching, Zhuangzi, and classical Taoist works.', 10),
('confucianism', 'Confucianism', 'confucianism', 'Analects and classical Confucian texts.', 11),
('shinto', 'Shinto', 'shinto', 'Kojiki, Nihon Shoki, and historical ritual texts.', 12),
('indigenous', 'Indigenous & Traditional', 'indigenous', 'Extensible traditional & indigenous sacred oral literature.', 13),
('other', 'Other Traditions', 'other', 'Global historical & philosophical sacred texts.', 14)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 3. Sacred Text Editions (Original Language vs Translations)
CREATE TABLE IF NOT EXISTS public.sacred_text_editions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  tradition_id TEXT REFERENCES public.sacred_traditions(id),
  edition_title TEXT NOT NULL,
  edition_type TEXT DEFAULT 'ORIGINAL' CHECK (edition_type IN ('ORIGINAL', 'TRANSLATION', 'COMMENTARY', 'CRITICAL_EDITION')),
  original_language TEXT DEFAULT 'en',
  translator_name TEXT,
  editor_name TEXT,
  publication_year INT,
  publisher_name TEXT,
  is_rtl BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Text & Metadata Correction Reports Table (Distinct from Copyright Takedowns)
CREATE TABLE IF NOT EXISTS public.text_corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_number INT,
  verse_number TEXT,
  correction_type TEXT CHECK (correction_type IN ('TYPO_CORRECTION', 'CORRUPTED_TEXT', 'WRONG_VERSE_NUMBER', 'TRANSLATION_ATTRIBUTION', 'METADATA_FIX', 'OTHER')),
  reported_by_email TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
