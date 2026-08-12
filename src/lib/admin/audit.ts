import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function logAuditEvent(
  action: 'BOOK_PUBLISHED' | 'BOOK_BLOCKED' | 'BOOK_ARCHIVED' | 'USER_ROLE_CHANGED' | 'USER_SUSPENDED' | 'COPYRIGHT_APPROVED' | 'SUBSCRIPTION_CHANGED' | 'SETTINGS_UPDATED',
  entityType: 'book' | 'user' | 'organization' | 'settings',
  entityId?: string,
  details?: Record<string, any>,
  adminId = 'admin-portal'
) {
  try {
    await supabase.from('audit_logs').insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || {},
    });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
}
