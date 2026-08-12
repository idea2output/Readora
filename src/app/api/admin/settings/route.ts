import { NextResponse } from 'next/server';
import { getSystemSettings, updateSystemSettings } from '@/lib/ai/settings-service';

export async function GET() {
  try {
    const settings = await getSystemSettings();
    // Mask API keys for security in UI output
    const maskedSettings = {
      ...settings,
      openai_api_key: settings.openai_api_key ? `••••••••${settings.openai_api_key.slice(-4)}` : '',
      anthropic_api_key: settings.anthropic_api_key ? `••••••••${settings.anthropic_api_key.slice(-4)}` : '',
      gemini_api_key: settings.gemini_api_key ? `••••••••${settings.gemini_api_key.slice(-4)}` : '',
    };
    return NextResponse.json({ settings: maskedSettings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const success = await updateSystemSettings(body);
    if (success) {
      return NextResponse.json({ success: true, message: 'System settings updated successfully!' });
    }
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}
