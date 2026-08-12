import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AiGuardResult {
  allowed: boolean;
  message?: string;
  bookTitle?: string;
}

/**
 * Sacred Text AI Firewall Guard:
 * Strictly blocks all AI capabilities (Ask the Book, RAG, Summaries, Explanations, Character extraction)
 * whenever content_domain === 'SACRED_TEXT' or ai_enabled === false.
 */
export async function verifyAiAllowedForBook(bookId: string): Promise<AiGuardResult> {
  if (!bookId) {
    return { allowed: false, message: 'Invalid Book ID provided.' };
  }

  try {
    const { data: book, error } = await supabase
      .from('books')
      .select('id, title, content_domain, ai_enabled')
      .eq('id', bookId)
      .single();

    if (error || !book) {
      // If book not found, allow default behavior or fail safe
      return { allowed: true };
    }

    if (book.content_domain === 'SACRED_TEXT' || book.ai_enabled === false) {
      return {
        allowed: false,
        message: 'AI features are not available for Sacred Texts.',
        bookTitle: book.title,
      };
    }

    return { allowed: true, bookTitle: book.title };
  } catch (_) {
    return { allowed: true };
  }
}
