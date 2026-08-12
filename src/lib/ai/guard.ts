import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are missing');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export interface AiGuardResult {
  allowed: boolean;
  message?: string;
  bookTitle?: string;
}

/**
 * Sacred Text AI Firewall Guard:
 * Strictly blocks all AI capabilities (Ask the Book, RAG,
 * Summaries, Explanations, Character extraction)
 * whenever content_domain === 'SACRED_TEXT'
 * or ai_enabled === false.
 */
export async function verifyAiAllowedForBook(
  bookId: string
): Promise<AiGuardResult> {
  if (!bookId) {
    return {
      allowed: false,
      message: 'Invalid Book ID provided.',
    };
  }

  try {
    const supabase = getSupabase();

    const { data: book, error } = await supabase
      .from('books')
      .select(
        'id, title, content_domain, ai_enabled'
      )
      .eq('id', bookId)
      .single();

    if (error || !book) {
      // If book is not found, preserve the
      // existing fail-open behavior.
      return { allowed: true };
    }

    if (
      book.content_domain === 'SACRED_TEXT' ||
      book.ai_enabled === false
    ) {
      return {
        allowed: false,
        message:
          'AI features are not available for Sacred Texts.',
        bookTitle: book.title,
      };
    }

    return {
      allowed: true,
      bookTitle: book.title,
    };
  } catch (_) {
    // Preserve the existing fail-open behavior.
    return { allowed: true };
  }
}
