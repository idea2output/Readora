import { NextResponse } from 'next/server';
import { createCommunityReport } from '@/lib/community/community-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.item_type || !body.item_id || !body.reason) {
      return NextResponse.json({ success: false, error: "Missing required fields: item_type, item_id, reason" }, { status: 400 });
    }

    const report = await createCommunityReport({
      reporter_id: body.reporter_id || 'u-active-user',
      reporter_email: body.reporter_email,
      item_type: body.item_type,
      item_id: body.item_id,
      reason: body.reason,
      details: body.details,
    });

    return NextResponse.json({ success: true, report, message: "Report submitted to moderation queue." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
