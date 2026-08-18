import { NextResponse } from "next/server";
import { getVisibleQuranResources } from "@/lib/quran/quran-foundation-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    if (action === "visible_resources") {
      const type = searchParams.get("type") || undefined;
      const resources = await getVisibleQuranResources(type);
      return NextResponse.json({ success: true, resources });
    }

    if (action === "translation") {
      const translationId = searchParams.get("id") || "131";
      const chapter = searchParams.get("chapter") || "1";

      const res = await fetch(
        `https://api.quran.com/api/v4/quran/translations/${translationId}?chapter_number=${chapter}`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) {
        return NextResponse.json({ error: `Quran API returned ${res.status}` }, { status: 400 });
      }
      const data = await res.json();
      return NextResponse.json({ success: true, translations: data.translations || [] });
    }

    if (action === "tafsir") {
      const tafsirId = searchParams.get("id") || "169";
      const verseKey = searchParams.get("verse_key") || "1:1";

      const res = await fetch(
        `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) {
        return NextResponse.json({ error: `Tafsir API returned ${res.status}` }, { status: 400 });
      }
      const data = await res.json();
      return NextResponse.json({ success: true, tafsir: data.tafsir || null });
    }

    if (action === "ayah_audio") {
      const recitationId = searchParams.get("recitation_id") || "7";
      const chapter = searchParams.get("chapter") || "1";

      const res = await fetch(
        `https://api.quran.com/api/v4/recitations/${recitationId}/by_chapter/${chapter}`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) {
        return NextResponse.json({ error: `Ayah Audio API returned ${res.status}` }, { status: 400 });
      }
      const data = await res.json();
      
      // Ensure proper full audio URL prefix: https://verses.quran.com/ or https://audio.quran.foundation/
      const audioFiles = (data.audio_files || []).map((file: any) => {
        let fullUrl = file.url || "";
        if (fullUrl && !fullUrl.startsWith("http")) {
          fullUrl = `https://verses.quran.com/${fullUrl.replace(/^\/+/, '')}`;
        }
        return {
          verse_key: file.verse_key,
          url: fullUrl,
        };
      });

      return NextResponse.json({ success: true, audio_files: audioFiles });
    }

    if (action === "full_surah_audio") {
      const reciterId = searchParams.get("reciter_id") || "7";
      const chapter = searchParams.get("chapter") || "1";

      const res = await fetch(
        `https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${chapter}`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) {
        return NextResponse.json({ error: `Surah Audio API returned ${res.status}` }, { status: 400 });
      }
      const data = await res.json();
      return NextResponse.json({ success: true, audio_file: data.audio_file || null });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Quran API Proxy Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch Quran data" }, { status: 500 });
  }
}
