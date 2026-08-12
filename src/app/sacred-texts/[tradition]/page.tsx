import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { BookMarked, ShieldCheck, ArrowLeft, BookOpen, GitCompare } from "lucide-react";

const TRADITION_DETAILS: Record<string, { name: string; icon: string; description: string; sampleTexts: any[] }> = {
  islam: {
    name: "Islam",
    icon: "☪️",
    description: "Holy Quran, Hadith collections (Sahih al-Bukhari, Sahih Muslim), Tafsir commentaries, and classical Islamic literature.",
    sampleTexts: [
      { id: "1", title: "The Holy Quran (القرآن الكريم)", originalLanguage: "Arabic (العربية)", edition: "Medina Mushaf Standard Edition", rights: "Public Domain / Verified Rights", slug: "holy-quran-arabic" },
      { id: "2", title: "Sahih al-Bukhari (صحيح البخاري)", originalLanguage: "Arabic (العربية)", edition: "Classical Hadith Collection", rights: "Public Domain", slug: "sahih-bukhari" },
      { id: "3", title: "Tafsir Ibn Kathir (تفسير ابن كثير)", originalLanguage: "Arabic (العربية)", edition: "Classical Exegesis & Commentary", rights: "Public Domain", slug: "tafsir-ibn-kathir" },
    ],
  },
  christianity: {
    name: "Christianity",
    icon: "✝️",
    description: "Old Testament, New Testament, Gospels, early Church Fathers, historical theological monographs, and open biblical literature.",
    sampleTexts: [
      { id: "4", title: "The Holy Bible (King James Version)", originalLanguage: "Hebrew / Aramaic / Greek", edition: "KJV 1611 Edition", rights: "Public Domain", slug: "holy-bible-kjv" },
      { id: "5", title: "The Four Gospels (Evangelion)", originalLanguage: "Koine Greek (Ελληνική)", edition: "Textus Receptus Standard", rights: "Public Domain", slug: "gospels-greek" },
      { id: "6", title: "The Confessions of St. Augustine", originalLanguage: "Latin (Latina)", edition: "Classical Translation", rights: "Public Domain", slug: "confessions-augustine" },
    ],
  },
  judaism: {
    name: "Judaism",
    icon: "✡️",
    description: "Torah, Tanakh, Mishnah, Babylonian & Jerusalem Talmud, Midrash, and historical Jewish philosophy.",
    sampleTexts: [
      { id: "7", title: "The Torah (תּוֹرָה)", originalLanguage: "Hebrew (עברית)", edition: "Masoretic Text Edition", rights: "Public Domain", slug: "torah-hebrew" },
      { id: "8", title: "The Tanakh (תנ״ך)", originalLanguage: "Hebrew / Aramaic", edition: "Jewish Publication Society 1917", rights: "Public Domain", slug: "tanakh-jps" },
      { id: "9", title: "The Guide for the Perplexed (מורה נבוכים)", originalLanguage: "Judeo-Arabic", edition: "Maimonides Philosophical Work", rights: "Public Domain", slug: "guide-for-perplexed" },
    ],
  },
  hinduism: {
    name: "Hinduism",
    icon: "🕉️",
    description: "Vedas (Rigveda, Samaveda, Yajurveda, Atharvaveda), Upanishads, Bhagavad Gita, Puranas, Ramayana, and Mahabharata.",
    sampleTexts: [
      { id: "10", title: "The Bhagavad Gita (श्रीमद्भगवद्गीता)", originalLanguage: "Sanskrit (संस्कृतम्)", edition: "Devanagari Verse & English", rights: "Public Domain", slug: "bhagavad-gita" },
      { id: "11", title: "The Rigveda (ऋग्वेद)", originalLanguage: "Vedic Sanskrit", edition: "Aufrecht / Max Müller Edition", rights: "Public Domain", slug: "rigveda-sanskrit" },
      { id: "12", title: "The Principal Upanishads", originalLanguage: "Sanskrit", edition: "Classical Verse Translation", rights: "Public Domain", slug: "principal-upanishads" },
    ],
  },
  buddhism: {
    name: "Buddhism",
    icon: "☸️",
    description: "Pali Canon (Tipitaka), Vinaya, Sutta Pitaka, Abhidhamma, Mahayana Sutras, and Buddhist philosophical literature.",
    sampleTexts: [
      { id: "13", title: "The Dhammapada", originalLanguage: "Pali", edition: "Theravada Canon", rights: "Public Domain", slug: "dhammapada-pali" },
      { id: "14", title: "The Lotus Sutra (妙法蓮華經)", originalLanguage: "Sanskrit / Classical Chinese", edition: "Kumarajiva Translation Edition", rights: "Public Domain", slug: "lotus-sutra" },
      { id: "15", title: "The Heart Sutra (般若心經)", originalLanguage: "Sanskrit / Chinese", edition: "Authoritative Canonical Text", rights: "Public Domain", slug: "heart-sutra" },
    ],
  },
};

export default async function TraditionDetailPage({
  params,
}: {
  params: Promise<{ tradition: string }>;
}) {
  const { tradition } = await params;
  const detail = TRADITION_DETAILS[tradition.toLowerCase()];

  if (!detail) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 space-y-8">
      <Link href="/sacred-texts" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Sacred Texts Catalog
      </Link>

      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white p-8 shadow-xl border border-amber-500/30 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{detail.icon}</span>
          <div>
            <Badge className="bg-amber-600 text-white border-0 text-[10px] uppercase tracking-wider font-bold">
              Religious Tradition Library
            </Badge>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight mt-1 text-white">{detail.name}</h1>
          </div>
        </div>
        <p className="text-xs md:text-sm text-slate-200 leading-relaxed max-w-3xl font-medium">
          {detail.description}
        </p>
      </div>

      {/* AI Isolation Banner with Ultra-Sharp Contrast */}
      <div className="p-4 rounded-2xl bg-amber-100 border border-amber-300 dark:bg-amber-950/60 dark:border-amber-700 text-amber-950 dark:text-amber-100 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
          <span><strong>AI Firewall Protection:</strong> All {detail.name} sacred texts operate with 0 AI intervention to preserve original textual integrity.</span>
        </div>
        <Link href="/sacred-texts/compare">
          <Button size="sm" variant="outline" className="rounded-full text-xs font-bold gap-1 border-amber-400 text-amber-950 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-900">
            <GitCompare className="w-3.5 h-3.5" /> Compare Translations
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="font-serif text-2xl font-extrabold text-foreground">Available Sacred Works ({detail.name})</h2>
          <SearchInput placeholder={`Search ${detail.name} texts...`} className="max-w-xs text-xs" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {detail.sampleTexts.map((text) => (
            <Card key={text.id} className="rounded-3xl border shadow-md p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all bg-card">
              <div className="space-y-2.5">
                <Badge className="bg-amber-600 text-white font-bold border-0 text-[10px]">
                  {text.originalLanguage}
                </Badge>
                <h3 className="font-serif font-bold text-lg text-foreground leading-snug">{text.title}</h3>
                <p className="text-xs text-muted-foreground"><strong>Edition:</strong> {text.edition}</p>
                <p className="text-xs text-muted-foreground"><strong>Rights:</strong> {text.rights}</p>
              </div>

              <Link href={`/read/${text.slug}`}>
                <Button className="w-full rounded-full text-xs font-bold gap-1.5 bg-amber-700 hover:bg-amber-800 text-white shadow-md">
                  <BookOpen className="w-3.5 h-3.5" /> Read Sacred Text
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
