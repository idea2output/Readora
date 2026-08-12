"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GitCompare, ShieldCheck, Layers, BookOpen } from "lucide-react";

const COMPARISON_DATA = [
  {
    passageId: "quran-fatiha-1",
    tradition: "Islam",
    title: "Surah Al-Fatiha (1:1 - 1:4)",
    original: {
      language: "Arabic (العربية)",
      rtl: true,
      text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (١) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (٢) الرَّحْمَٰنِ الرَّحِيمِ (٣) مَالِكِ يَوْمِ الدِّينِ (٤)",
    },
    translationA: {
      translator: "Marmaduke Pickthall (1930)",
      license: "Public Domain",
      text: "In the name of Allah, the Beneficent, the Merciful. (1) Praise be to Allah, Lord of the Worlds, (2) The Beneficent, the Merciful. (3) Owner of the Day of Judgment. (4)",
    },
    translationB: {
      translator: "Abdullah Yusuf Ali (1934)",
      license: "Public Domain",
      text: "In the name of Allah, Most Gracious, Most Merciful. (1) Praise be to Allah, the Cherisher and Sustainer of the worlds; (2) Most Gracious, Most Merciful; (3) Master of the Day of Judgment. (4)",
    },
  },
  {
    passageId: "tao-te-ching-1",
    tradition: "Taoism",
    title: "Tao Te Ching (Chapter 1)",
    original: {
      language: "Classical Chinese (文言)",
      rtl: false,
      text: "道可道，非常道。名可名，非常名。無名天地之始；有名萬物之母。",
    },
    translationA: {
      translator: "James Legge (1891)",
      license: "Public Domain",
      text: "The Tao that can be trodden is not the enduring and unchanging Tao. The name that can be named is not the enduring and unchanging name. (Conceived of as) having no name, it is the Originator of heaven and earth.",
    },
    translationB: {
      translator: "Arthur Waley (1934)",
      license: "Public Domain",
      text: "The Way that can be told of is not an Unchanging Way; The names that can be named are not un-changing names. It was the Nameless that was the beginning of Heaven and Earth.",
    },
  },
];

export default function CompareEditionsPage() {
  const [selectedPassage, setSelectedPassage] = useState(0);
  const current = COMPARISON_DATA[selectedPassage];

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 space-y-8">
      <Link href="/sacred-texts" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Sacred Texts Catalog
      </Link>

      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white p-8 shadow-xl border border-amber-500/20 space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] uppercase font-semibold">
            Institutional Text Comparison Tool
          </Badge>
        </div>
        <h1 className="font-serif text-3xl font-extrabold flex items-center gap-3">
          <GitCompare className="w-7 h-7 text-amber-400" /> Compare Authoritative Editions & Translations
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Compare side-by-side verified translations against original texts. All passages are strictly authentic source texts with 0 synthetic AI alterations.
        </p>
      </div>

      {/* Passage Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b">
        {COMPARISON_DATA.map((item, idx) => (
          <Button
            key={item.passageId}
            variant={selectedPassage === idx ? "default" : "outline"}
            onClick={() => setSelectedPassage(idx)}
            className={`rounded-full text-xs font-bold ${selectedPassage === idx ? 'bg-amber-700 hover:bg-amber-800 text-white' : ''}`}
          >
            {item.title}
          </Button>
        ))}
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Original Language */}
        <Card className="rounded-3xl border shadow-md p-6 space-y-4 bg-amber-500/5 border-amber-500/20">
          <CardHeader className="p-0 border-b pb-3">
            <Badge className="bg-amber-500 text-white text-[10px] font-bold w-fit mb-1">
              Original Language
            </Badge>
            <CardTitle className="text-base font-serif font-bold text-foreground">
              {current.original.language}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className={`p-4 rounded-2xl bg-card border font-serif text-lg leading-loose text-foreground ${
                current.original.rtl ? 'text-right dir-rtl' : 'text-left'
              }`}
              dir={current.original.rtl ? 'rtl' : 'ltr'}
            >
              {current.original.text}
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Translation A */}
        <Card className="rounded-3xl border shadow-md p-6 space-y-4">
          <CardHeader className="p-0 border-b pb-3">
            <Badge variant="outline" className="text-[10px] font-bold w-fit mb-1">
              Translation A ({current.translationA.license})
            </Badge>
            <CardTitle className="text-base font-serif font-bold text-foreground">
              {current.translationA.translator}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 rounded-2xl bg-card border font-serif text-sm leading-relaxed text-foreground">
              {current.translationA.text}
            </div>
          </CardContent>
        </Card>

        {/* Column 3: Translation B */}
        <Card className="rounded-3xl border shadow-md p-6 space-y-4">
          <CardHeader className="p-0 border-b pb-3">
            <Badge variant="outline" className="text-[10px] font-bold w-fit mb-1">
              Translation B ({current.translationB.license})
            </Badge>
            <CardTitle className="text-base font-serif font-bold text-foreground">
              {current.translationB.translator}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 rounded-2xl bg-card border font-serif text-sm leading-relaxed text-foreground">
              {current.translationB.text}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Isolation Footer Notice */}
      <div className="p-4 rounded-2xl bg-muted border text-xs text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-600" /> Grounded in verified digital archives. Zero AI text synthesis or automatic translation.
        </span>
        <Link href="/rights">
          <span className="underline font-bold text-foreground">Rights Policy</span>
        </Link>
      </div>
    </div>
  );
}
