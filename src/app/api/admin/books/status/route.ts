import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/admin/audit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { bookId, action, status } = await request.json();
    if (!bookId) {
      return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
    }

    if (action === 'soft_delete') {
      await supabase
        .from('books')
        .update({ deleted_at: new Date().toISOString(), status: 'draft' })
        .eq('id', bookId);

      await logAuditEvent('BOOK_ARCHIVED', 'book', bookId, { softDelete: true });
      return NextResponse.json({ success: true, message: 'Book soft deleted successfully.' });
    }

    if (action === 'restore') {
      await supabase
        .from('books')
        .update({ deleted_at: null, status: 'published' })
        .eq('id', bookId);

      await logAuditEvent('BOOK_PUBLISHED', 'book', bookId, { restored: true });
      return NextResponse.json({ success: true, message: 'Book restored successfully.' });
    }

    if (action === 'update_status' && status) {
      await supabase
        .from('books')
        .update({ admin_status: status, status: status === 'blocked' ? 'draft' : 'published' })
        .eq('id', bookId);

      const auditAction = status === 'blocked' ? 'BOOK_BLOCKED' : 'BOOK_PUBLISHED';
      await logAuditEvent(auditAction as any, 'book', bookId, { admin_status: status });
      return NextResponse.json({ success: true, message: `Book status changed to ${status}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Book status update failed' }, { status: 500 });
  }
}
