import { createClient } from '@supabase/supabase-js';

export interface SystemSettings {
  monetization_enabled: string;
  ai_provider: string;
  embedding_provider: string;
  openai_api_key: string;
  anthropic_api_key: string;
  gemini_api_key: string;
  resend_api_key: string;
  stripe_secret_key: string;
  chunk_size_tokens: number;
  daily_user_quota: number;
}

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

export async function getSystemSettings(): Promise<SystemSettings> {
  const defaults: SystemSettings = {
    monetization_enabled: process.env.MONETIZATION_ENABLED || 'false',
    ai_provider: process.env.AI_PROVIDER || 'openai',
    embedding_provider: process.env.EMBEDDING_PROVIDER || 'openai',
    openai_api_key: process.env.OPENAI_API_KEY || '',
    anthropic_api_key: process.env.ANTHROPIC_API_KEY || '',
    gemini_api_key: process.env.GEMINI_API_KEY || '',
    resend_api_key: process.env.RESEND_API_KEY || '',
    stripe_secret_key: process.env.STRIPE_SECRET_KEY || '',
    chunk_size_tokens: parseInt(process.env.CHUNK_SIZE_TOKENS || '750'),
    daily_user_quota: parseInt(process.env.DAILY_USER_QUOTA || '50'),
  };

  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value');

    if (!error && data) {
      data.forEach(item => {
        if (item.value && item.value.trim() !== '') {
          if (item.key === 'monetization_enabled') defaults.monetization_enabled = item.value;
          if (item.key === 'ai_provider') defaults.ai_provider = item.value;
          if (item.key === 'embedding_provider') defaults.embedding_provider = item.value;
          if (item.key === 'openai_api_key') defaults.openai_api_key = item.value;
          if (item.key === 'anthropic_api_key') defaults.anthropic_api_key = item.value;
          if (item.key === 'gemini_api_key') defaults.gemini_api_key = item.value;
          if (item.key === 'resend_api_key') defaults.resend_api_key = item.value;
          if (item.key === 'stripe_secret_key') defaults.stripe_secret_key = item.value;
          if (item.key === 'chunk_size_tokens') {
            defaults.chunk_size_tokens = parseInt(item.value) || 750;
          }
          if (item.key === 'daily_user_quota') {
            defaults.daily_user_quota = parseInt(item.value) || 50;
          }
        }
      });
    }
  } catch (err) {
    console.error('Error fetching system settings from DB:', err);
  }

  return defaults;
}

export async function updateSystemSettings(
  settings: Partial<SystemSettings>
): Promise<boolean> {
  try {
    const supabase = getSupabase();

    const entries = Object.entries(settings);

    for (const [key, value] of entries) {
      if (value !== undefined) {
        const isSecret = key.includes('api_key');

        await supabase
          .from('system_settings')
          .upsert({
            key,
            value: String(value),
            is_secret: isSecret,
            updated_at: new Date().toISOString(),
          });
      }
    }

    return true;
  } catch (err) {
    console.error('Error updating system settings:', err);
    return false;
  }
}
