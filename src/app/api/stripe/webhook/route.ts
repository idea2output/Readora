import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAuditEvent } from '@/lib/admin/audit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let event: any = {};
    try {
      event = JSON.parse(rawBody);
    } catch (_) {
      event = { type: 'ping' };
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data?.object;
        const userId = session?.client_reference_id;
        const plan = session?.metadata?.plan || 'pro';
        if (userId) {
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            plan: plan,
            status: 'active',
          });
          await logAuditEvent('SUBSCRIPTION_CHANGED', 'user', userId, { plan, action: 'created' });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data?.object;
        if (sub?.customer) {
          await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_customer_id', sub.customer);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Webhook failed' }, { status: 400 });
  }
}
