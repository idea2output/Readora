import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/admin/audit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { bookId, reporterName, reporterEmail, reporterOrg, relationship, claimType, explanation } = await request.json();

    if (!reporterName || !reporterEmail || !explanation) {
      return NextResponse.json({ error: 'Reporter name, email, and explanation are required.' }, { status: 400 });
    }

    // Generate case number: LH-RIGHTS-2026-XXXXXX
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const caseNumber = `LH-RIGHTS-2026-${randomNum}`;

    // Create rights case
    const { data: caseRecord, error: caseErr } = await supabase
      .from('rights_cases')
      .insert({
        case_number: caseNumber,
        book_id: bookId || null,
        reporter_name: reporterName,
        reporter_email: reporterEmail,
        reporter_organization: reporterOrg || null,
        relationship,
        claim_type: claimType,
        explanation,
        status: 'RECEIVED',
      })
      .select('*')
      .single();

    if (caseErr) {
      return NextResponse.json({ error: caseErr.message }, { status: 500 });
    }

    // Temporarily place book under review if bookId provided
    if (bookId) {
      await supabase
        .from('books')
        .update({ admin_status: 'blocked' })
        .eq('id', bookId);

      await logAuditEvent('BOOK_BLOCKED', 'book', bookId, { caseNumber, reason: 'Takedown report filed' });
    }

    return NextResponse.json({
      success: true,
      caseNumber,
      message: `Rights report received. Case ${caseNumber} created. Our legal team will review this notice.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Takedown reporting failed' }, { status: 500 });
  }
}
