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

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();

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

        const userId =
          session?.client_reference_id;

        const plan =
          session?.metadata?.plan || 'pro';

        if (userId) {
          const { error } =
            await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id:
                  session.customer || null,
                stripe_subscription_id:
                  session.subscription || null,
                plan,
                status: 'active',
              });

          if (error) {
            console.error(
              'Subscription upsert error:',
              error
            );
          }

          await logAuditEvent(
            'SUBSCRIPTION_CHANGED',
            'user',
            userId,
            {
              plan,
              action: 'created',
            }
          );
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data?.object;

        if (sub?.customer) {
          const { error } =
            await supabase
              .from('subscriptions')
              .update({
                status: 'canceled',
              })
              .eq(
                'stripe_customer_id',
                sub.customer
              );

          if (error) {
            console.error(
              'Subscription cancellation error:',
              error
            );
          }
        }

        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error: any) {
    console.error(
      'Stripe webhook error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          'Webhook failed',
      },
      { status: 400 }
    );
  }
}
