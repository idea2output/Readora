import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const page = searchParams.get('page') || '1';
  const topic = searchParams.get('topic') || '';

  try {
    let gutendexUrl = `https://gutendex.com/books/?page=${page}`;
    
    if (query) {
      // If it's a numeric ID (e.g. 1342 or 84), search by ids parameter
      if (/^\d+$/.test(query.trim())) {
        gutendexUrl = `https://gutendex.com/books/?ids=${query.trim()}`;
      } else {
        gutendexUrl += `&search=${encodeURIComponent(query)}`;
      }
    } else if (topic) {
      gutendexUrl += `&topic=${encodeURIComponent(topic)}`;
    } else {
      gutendexUrl += `&sort=popular`;
    }

    const res = await fetch(gutendexUrl, {
      headers: {
        'User-Agent': 'Readora-Admin/1.0',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Gutendex returned status ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch from Gutendex' }, { status: 500 });
  }
}
