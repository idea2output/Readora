import { NextResponse } from 'next/server';
import { executeOpenStaxCatalogSync, discoverOpenStaxCatalog } from '@/lib/providers/openstax';
import { getOpenStaxBooks, getProviderSyncLogs, updateOpenStaxBookStatus } from '@/lib/providers/provider-service';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dxtdkmszrgwncxuukpor.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

/**
 * GET Handler: Server-side fetch for persisted OpenStax books and sync logs
 * Bypasses browser client RLS limitations by utilizing server-side service role safely.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Authentication check
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Active Supabase session required.' },
        { status: 401 }
      );
    }

    // 2. User Role check via public.user_roles
    const supabaseAdmin = getAdminClient();
    const { data: roleRecord } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const role = roleRecord?.role;
    if (role !== 'admin' && role !== 'org_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Administrator authorization required.' },
        { status: 403 }
      );
    }

    // 3. Server-side fetch of persisted OpenStax books & sync logs
    const books = await getOpenStaxBooks();
    const logs = await getProviderSyncLogs();

    return NextResponse.json({
      success: true,
      count: books.length,
      books,
      logs,
    });
  } catch (error: any) {
    console.error("Failed to fetch OpenStax catalog via GET endpoint:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch OpenStax books" },
      { status: 500 }
    );
  }
}

/**
 * POST Handler: Catalog Discovery, Status Updates, and Controlled Synchronization
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Unauthenticated Supabase user -> 401
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Active Supabase session required.' },
        { status: 401 }
      );
    }

    // 2. Query public.user_roles using server service role
    const supabaseAdmin = getAdminClient();
    const { data: roleRecord } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const role = roleRecord?.role;

    // 3. Authenticated normal user without admin or org_admin role in public.user_roles -> 403
    if (role !== 'admin' && role !== 'org_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Administrator authorization required in public.user_roles.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const adminId = user.email || user.id;

    // Action A: Discover & Preview Catalog Diff (Does not write to database)
    if (body.action === 'discover') {
      const summary = await discoverOpenStaxCatalog();
      return NextResponse.json({ success: true, summary });
    }

    // Action B: Approve or update status of a pending book
    if (body.action === 'update_status' && body.book_id && body.status) {
      const updated = await updateOpenStaxBookStatus(body.book_id, body.status);
      return NextResponse.json({ success: updated, book_id: body.book_id, status: body.status });
    }

    // Action C: Execute catalog synchronization (Supports limit & dryRun parameters)
    const limit = typeof body.limit === 'number' && body.limit > 0 ? body.limit : undefined;
    const dryRun = Boolean(body.dryRun);

    const syncResult = await executeOpenStaxCatalogSync({
      triggeredBy: body.triggered_by || adminId,
      limit,
      dryRun,
    });

    return NextResponse.json({
      success: syncResult.success,
      message: syncResult.message,
      log: syncResult,
    });
  } catch (error: any) {
    console.error("OpenStax sync API failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Catalog sync failed" },
      { status: 500 }
    );
  }
}
