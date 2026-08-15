import { NextResponse } from 'next/server';
import { getAnswersForQuestion, createCommunityAnswer, acceptAnswer } from '@/lib/community/community-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const question_id = searchParams.get('question_id');
    if (!question_id) {
      return NextResponse.json({ success: false, error: "Missing question_id" }, { status: 400 });
    }

    const answers = await getAnswersForQuestion(question_id);
    return NextResponse.json({ success: true, answers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'accept') {
      if (!body.question_id || !body.answer_id) {
        return NextResponse.json({ success: false, error: "Missing question_id or answer_id" }, { status: 400 });
      }
      await acceptAnswer(body.question_id, body.answer_id);
      return NextResponse.json({ success: true, message: "Answer accepted as official solution." });
    }

    if (!body.question_id || !body.body) {
      return NextResponse.json({ success: false, error: "Missing question_id or body" }, { status: 400 });
    }

    const answer = await createCommunityAnswer({
      question_id: body.question_id,
      user_id: body.user_id || 'u-authenticated-scholar',
      author_name: body.author_name || 'Academic Scholar',
      body: body.body,
      references: body.references,
    });

    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
