import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const countryCode = searchParams.get('country') || 'UNKNOWN';

    if (!bookId) {
      return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
    }

    // Conservative Rule: UNKNOWN country status defaults to NO ACCESS
    if (countryCode === 'UNKNOWN') {
      return NextResponse.json({
        allowed: false,
        status: 'UNKNOWN',
        reason: 'Geographic availability cannot be determined for unknown jurisdiction. Access restricted per policy.',
      });
    }

    // Query book_geo_rights table
    const { data: geoRule } = await supabase
      .from('book_geo_rights')
      .select('*')
      .eq('book_id', bookId)
      .eq('country_code', countryCode.toUpperCase())
      .maybeSingle();

    if (!geoRule || geoRule.status === 'BLOCKED' || geoRule.status === 'RESTRICTED' || geoRule.status === 'REVIEW' || geoRule.status === 'UNKNOWN') {
      return NextResponse.json({
        allowed: false,
        status: geoRule?.status || 'UNKNOWN',
        reason: 'This publication is restricted or under legal review in your jurisdiction.',
      });
    }

    return NextResponse.json({
      allowed: true,
      status: 'ALLOWED',
      country: countryCode,
    });
  } catch (error: any) {
    return NextResponse.json({
      allowed: false,
      status: 'REVIEW',
      error: error.message,
    });
  }
}
