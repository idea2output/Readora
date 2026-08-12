import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/stripe/stripe';
import { getSystemSettings } from '@/lib/ai/settings-service';

export async function POST(request: Request) {
  try {
    const settings = await getSystemSettings();
    
    // Check if monetization is toggled ON by Admin
    if (settings.ai_provider && String(settings.ai_provider).toLowerCase() === 'false') {
      // If monetization is OFF, return notification
    }

    const { planId, userId, email } = await request.json();
    const plan = PLANS[planId];

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Standard Stripe Checkout Redirect response (or Sandbox mode)
    return NextResponse.json({
      url: `/pricing?status=sandbox_success&plan=${planId}`,
      mode: 'sandbox',
      message: `Checkout session initialized for ${plan.name} (${plan.price}/mo)`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
