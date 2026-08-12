import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { BookMarked, ShieldCheck, Globe, BookOpen, Layers, GitCompare, FileCode2 } from "lucide-react";

const TRADITIONS = [
  { id: "islam", name: "Islam", count: "Quran, Hadith, Tafsir", description: "Quranic text, classical Hadith collections, and historical theological works.", icon: "☪️" },
  { id: "christianity", name: "Christianity", count: "Bible, Gospels, Patristics", description: "Old & New Testaments, Gospels, and historical Christian texts.", icon: "✝️" },
  { id: "judaism", name: "Judaism", count: "Torah, Tanakh, Talmud", description: "Torah, Tanakh, Talmud, Midrash, and historical Jewish philosophy.", icon: "✡️" },
  { id: "hinduism", name: "Hinduism", count: "Vedas, Upanishads, Gita", description: "Vedas, Upanishads, Bhagavad Gita, Puranas, and epic literature.", icon: "🕉️" },
  { id: "buddhism", name: "Buddhism", count: "Pali Canon, Sutras", description: "Pali Canon, Sutras, Suttas, and Buddhist philosophical works.", icon: "☸️" },
  { id: "sikhism", name: "Sikhism", count: "Guru Granth Sahib", description: "Guru Granth Sahib and Sikh historical philosophical writings.", icon: "ੴ" },
  { id: "jainism", name: "Jainism", count: "Agamas, Philosophy", description: "Agamas, canonical sutras, and historical Jain literature.", icon: "✋" },
  { id: "bahai", name: "Baháʼí Faith", count: "Sacred Writings", description: "Sacred tablets, historical writings, and theological works.", icon: "⭐️" },
  { id: "zoroastrianism", name: "Zoroastrianism", count: "Avesta, Gathas", description: "Avestan texts, Gathas, and ancient Iranian religious literature.", icon: "🔥" },
  { id: "taoism", name: "Taoism", count: "Tao Te Ching, Zhuangzi", description: "Tao Te Ching, Zhuangzi, and classical Taoist commentaries.", icon: "☯️" },
  { id: "confucianism", name: "Confucianism", count: "Analects, Classics", description: "Analects, the Five Classics, and Neo-Confucian commentaries.", icon: "🏛️" },
  { id: "shinto", name: "Shinto", count: "Kojiki, Nihon Shoki", description: "Kojiki, Nihon Shoki, and historical ritual texts.", icon: "⛩️" },
  { id: "indigenous", name: "Indigenous & Traditional", count: "Global Oral & Sacred Literature", description: "Preserving global traditional and indigenous sacred oral literature.", icon: "🌿" },
  { id: "other", name: "Other Traditions", count: "Historical Sacred Works", description: "Historical, ancient, and comparative sacred manuscripts.", icon: "📜" },
];

const FEATURED_SACRED_TEXTS = [
  {
    id: "quran-original",
    title: "The Holy Quran (القرآن الكريم)",
    tradition: "Islam",
    originalLanguage: "Arabic (العربية)",
    edition: "Medina Mushaf Standard Edition",
    license: "Public Domain / Verified Rights",
    slug: "holy-quran-arabic",
    rtl: true,
  },
  {
    id: "bhagavad-gita",
    title: "The Bhagavad Gita (श्रीमद्भगवद्गीता)",
    tradition: "Hinduism",
    originalLanguage: "Sanskrit (संस्कृतम्)",
    edition: "Classical Verse & English Translation",
    license: "Public Domain",
    slug: "bhagavad-gita",
    rtl: false,
  },
  {
    id: "tao-te-ching",
    title: "Tao Te Ching (道德經)",
    tradition: "Taoism",
    originalLanguage: "Classical Chinese (文言)",
    edition: "Laozi Authoritative Text",
    license: "Public Domain",
    slug: "tao-te-ching",
    rtl: false,
  },
  {
    id: "dhammapada",
    title: "The Dhammapada",
    tradition: "Buddhism",
    originalLanguage: "Pali",
    edition: "Theravada Canonical Text",
    license: "Public Domain",
    slug: "dhammapada-pali",
    rtl: false,
  },
];

export default function SacredTextsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-10 space-y-12">
      {/* Neutral Hero Section */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white p-8 md:p-12 shadow-2xl relative overflow-hidden space-y-6 border border-amber-500/20">
        <div className="max-w-3xl space-y-4">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider gap-1.5">
            <BookMarked className="w-4 h-4 text-amber-400" /> First-Class Sacred Library Section
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Sacred Texts & Religious Literature
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Explore sacred writings and religious literature from traditions around the world. Presented with institutional neutrality, faithful formatting, and verified rights governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-amber-200/90 border-t border-amber-500/20">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-400" /> Complete AI Isolation Firewall</span>
          <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-amber-400" /> Multi-Language & RTL Support</span>
          <span className="flex items-center gap-1.5"><GitCompare className="w-4 h-4 text-indigo-400" /> Multi-Translation Comparison</span>
        </div>
      </div>

      {/* AI Isolation Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span>
            <strong>Institutional Neutrality & Integrity Guarantee:</strong> Sacred Texts operate under a permanent AI Firewall. No AI rewriting, AI summaries, or synthetic interpretations are ever performed on Sacred Texts.
          </span>
        </div>
        <Link href="/sacred-texts/compare">
          <Button size="sm" variant="outline" className="rounded-full text-xs font-bold gap-1 border-amber-500/40 hover:bg-amber-500/10 flex-shrink-0">
            <GitCompare className="w-3.5 h-3.5" /> Compare Editions
          </Button>
        </Link>
      </div>

      {/* Dedicated Sacred Search */}
      <div className="max-w-2xl mx-auto space-y-2">
        <h3 className="text-center font-serif text-lg font-bold text-foreground">Search Sacred Texts Catalog</h3>
        <SearchInput placeholder="Search by title, tradition, language, translator, chapter, or verse..." className="py-6 text-sm rounded-full shadow-md" />
      </div>

      {/* Browse by 13+ Traditions Taxonomy */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">Browse by Tradition</h2>
            <p className="text-xs text-muted-foreground">Neutral, non-hierarchical library categorization across world traditions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {TRADITIONS.map((trad) => (
            <Link key={trad.id} href={`/sacred-texts/${trad.id}`}>
              <Card className="h-full rounded-2xl border hover:border-amber-500/50 hover:shadow-lg transition-all group cursor-pointer bg-card">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{trad.icon}</span>
                    <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground group-hover:border-amber-500/40">
                      {trad.count}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-base text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {trad.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {trad.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Sacred Texts Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">Featured Sacred Texts</h2>
            <p className="text-xs text-muted-foreground">Verified public-domain & openly licensed digital editions</p>
          </div>
          <Link href="/catalog?genre=Sacred">
            <Button variant="ghost" className="text-xs font-bold text-primary">View All Texts →</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_SACRED_TEXTS.map((item) => (
            <Card key={item.id} className="rounded-3xl border shadow-md flex flex-col justify-between p-6 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
                    {item.tradition}
                  </Badge>
                  {item.rtl && <Badge variant="outline" className="text-[10px] font-mono">RTL Supported</Badge>}
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground leading-snug">{item.title}</h3>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p><strong>Original Language:</strong> {item.originalLanguage}</p>
                  <p><strong>Edition:</strong> {item.edition}</p>
                  <p><strong>Rights Status:</strong> {item.license}</p>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <Link href={`/books/${item.slug}`} className="w-full">
                  <Button className="w-full rounded-full text-xs font-bold gap-1.5 bg-amber-700 hover:bg-amber-800 text-white">
                    <BookOpen className="w-3.5 h-3.5" /> Read Sacred Text
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
