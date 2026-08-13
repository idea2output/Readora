import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/admin/audit';


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

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();

    const {
      bookId,
      reporterName,
      reporterEmail,
      reporterOrg,
      relationship,
      claimType,
      explanation,
    } = await request.json();

    if (!reporterName || !reporterEmail || !explanation) {
      return NextResponse.json(
        {
          error:
            'Reporter name, email, and explanation are required.',
        },
        { status: 400 }
      );
    }

    // Generate case number
    const randomNum = Math.floor(
      100000 + Math.random() * 900000
    );

    const currentYear = new Date().getFullYear();

    const caseNumber =
      `LH-RIGHTS-${currentYear}-${randomNum}`;

    // Create rights case
    const {
      data: caseRecord,
      error: caseErr,
    } = await supabase
      .from('rights_cases')
      .insert({
        case_number: caseNumber,
        book_id: bookId || null,
        reporter_name: reporterName,
        reporter_email: reporterEmail,
        reporter_organization:
          reporterOrg || null,
        relationship: relationship || null,
        claim_type: claimType || null,
        explanation,
        status: 'RECEIVED',
      })
      .select('*')
      .single();

    if (caseErr) {
      return NextResponse.json(
        {
          error:
            `Failed to create rights case: ${caseErr.message}`,
        },
        { status: 500 }
      );
    }

    // Temporarily place the book under review
    if (bookId) {
      const { error: bookError } =
        await supabase
          .from('books')
          .update({
            admin_status: 'blocked',
          })
          .eq('id', bookId);

      if (!bookError) {
        try {
          await logAuditEvent(
            'BOOK_BLOCKED',
            'book',
            bookId,
            {
              caseNumber,
              reason:
                'Takedown report filed',
            }
          );
        } catch (_) {
          // Audit failure should not invalidate
          // an already-created rights case.
        }
      }
    }

    return NextResponse.json({
      success: true,
      caseNumber,
      message:
        `Rights report received. Case ${caseNumber} created. Our legal team will review this notice.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          'Takedown reporting failed',
      },
      { status: 500 }
    );
  }
}
