import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/stripe/stripe';

export async function POST(request: Request) {
  try {
    const { planId } = await request.json();
    const plan = PLANS[planId];

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    return NextResponse.json({
      url: `/pricing?status=sandbox_success&plan=${planId}`,
      mode: 'sandbox',
      message: `Checkout session initialized for ${plan.name} (${plan.price}/mo)`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
