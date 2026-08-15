import { NextResponse } from 'next/server';
import { voteOnItem } from '@/lib/community/community-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await voteOnItem({
      user_id: body.user_id || 'u-active-user',
      question_id: body.question_id,
      answer_id: body.answer_id,
      vote_type: body.vote_type || 'upvote',
    });

    return NextResponse.json({ ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
