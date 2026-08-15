import { NextResponse } from 'next/server';

let MEMORY_SETTINGS = {
  monetization_enabled: false,
  site_name: "Literary Harbour",
  tagline: "Knowledge Without Borders.",
  updated_at: new Date().toISOString(),
};

export async function GET() {
  try {
    return NextResponse.json({ settings: MEMORY_SETTINGS });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    MEMORY_SETTINGS = {
      ...MEMORY_SETTINGS,
      ...body,
      updated_at: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, message: 'System settings updated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}
