import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/admin/audit';

export const runtime = 'edge';

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

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name, created_at');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('*');

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*');

    const roleMap: Record<string, any> = {};

    (roles || []).forEach((r: any) => {
      roleMap[r.user_id] = r;
    });

    const subMap: Record<string, any> = {};

    (subs || []).forEach((s: any) => {
      subMap[s.user_id] = s;
    });

    const users = (profiles || []).map((p: any) => ({
      id: p.id,
      display_name: p.display_name || 'Anonymous User',
      created_at: p.created_at,
      role: roleMap[p.id]?.role || 'user',
      status: roleMap[p.id]?.status || 'active',
      plan: subMap[p.id]?.plan || 'free',
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message || 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();

    const {
      userId,
      action,
      role,
      status,
    } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    if (action === 'change_role' && role) {
      await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
        });

      await logAuditEvent(
        'USER_ROLE_CHANGED',
        'user',
        userId,
        { newRole: role }
      );

      return NextResponse.json({
        success: true,
        message: `Role changed to ${role}`,
      });
    }

    if (action === 'toggle_status' && status) {
      await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          status: status,
        });

      await logAuditEvent(
        'USER_SUSPENDED',
        'user',
        userId,
        { newStatus: status }
      );

      return NextResponse.json({
        success: true,
        message: `Account status updated to ${status}`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message || 'User action failed',
      },
      { status: 500 }
    );
  }
}
