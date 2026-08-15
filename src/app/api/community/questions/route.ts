import { NextResponse } from 'next/server';
import { getCommunityQuestions, createCommunityQuestion } from '@/lib/community/community-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject_slug = searchParams.get('subject') || undefined;
    const book_id = searchParams.get('book_id') || undefined;
    const search = searchParams.get('q') || undefined;
    const sort = (searchParams.get('sort') as any) || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const questions = await getCommunityQuestions({
      subject_slug,
      book_id,
      search,
      sort,
      limit,
    });

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.title || !body.body || !body.subject_slug) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, body, and subject_slug are mandatory." },
        { status: 400 }
      );
    }

    const question = await createCommunityQuestion({
      user_id: body.user_id || 'u-authenticated-scholar',
      author_name: body.author_name || 'Academic Scholar',
      book_id: body.book_id,
      book_title: body.book_title,
      book_slug: body.book_slug,
      chapter_id: body.chapter_id,
      chapter_title: body.chapter_title,
      section_id: body.section_id,
      subject_name: body.subject_name || body.subject_slug,
      subject_slug: body.subject_slug,
      title: body.title,
      body: body.body,
    });

    return NextResponse.json({ success: true, question });
  } catch (error: any) {
    console.error("Post Community Question Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
