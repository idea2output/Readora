"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Languages,
  Anchor,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Award,
  ArrowRight,
  CheckCircle2,
  Send,
  Users,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface BookProviderContributor {
  id: string;
  name: string;
  location?: string;
  booksContributed: string;
  languages: string[];
  websiteUrl?: string;
  appreciationNote?: string;
  avatarBadge?: string;
}

export interface TranslatorContributor {
  id: string;
  name: string;
  languagePair: string;
  worksTranslated: string;
  type: "literary" | "academic" | "historical" | "sacred text";
  portfolioUrl?: string;
  appreciationNote?: string;
}

export interface FinancialContributor {
  id: string;
  name: string;
  label: "Founding Supporter" | "Community Supporter" | "Sustaining Supporter";
  message?: string;
  date?: string;
}

const BOOK_PROVIDERS: BookProviderContributor[] = [
  {
    id: "bp-1",
    name: "Alexandria Open Archives Initiative",
    location: "Global / Egypt",
    booksContributed: "Verified Manuscripts of Classical Philosophy (142 volumes)",
    languages: ["Arabic", "Ancient Greek", "Latin"],
    websiteUrl: "https://example.org/alexandria-archives",
    appreciationNote: "Generously digitized rare early printed editions for worldwide research.",
    avatarBadge: "🏛️",
  },
  {
    id: "bp-2",
    name: "Prof. Elena Rostova",
    location: "Prague, Czech Republic",
    booksContributed: "19th Century Slavic & Eastern European Folk Literature",
    languages: ["Czech", "Russian", "Polish"],
    appreciationNote: "Contributed meticulous OCR scans and corrected text layouts.",
    avatarBadge: "📚",
  },
  {
    id: "bp-3",
    name: "Heritage Digital Press Foundation",
    location: "Oxford, United Kingdom",
    booksContributed: "Public Domain English Classics & Historical Commentaries",
    languages: ["English"],
    websiteUrl: "https://example.org/heritage-digital",
    appreciationNote: "Partnered to ensure complete proofreading of historical press texts.",
    avatarBadge: "🌐",
  },
];

const TRANSLATORS: TranslatorContributor[] = [
  {
    id: "tr-1",
    name: "Dr. Tariq Al-Mansoor",
    languagePair: "Arabic → English",
    worksTranslated: "Select Treatises of Ibn Rushd (Averroes)",
    type: "academic",
    portfolioUrl: "https://example.org/tariq-translations",
    appreciationNote: "Meticulously preserved nuanced philosophical terminology across versions.",
  },
  {
    id: "tr-2",
    name: "Claire Dubois",
    languagePair: "French → English",
    worksTranslated: "19th Century French Symbolist Poetry & Letters",
    type: "literary",
    appreciationNote: "Capturing poetic rhythm and cadence with exceptional fidelity.",
  },
  {
    id: "tr-3",
    name: "Master Chen Wei & Team",
    languagePair: "Classical Chinese → English",
    worksTranslated: "Taoist Philosophical Dialogues & Early Medical Canon",
    type: "sacred text",
    portfolioUrl: "https://example.org/chen-wei",
    appreciationNote: "Provided dual-language commentaries for scholars and general readers.",
  },
];

const FINANCIAL_CONTRIBUTORS: FinancialContributor[] = [
  {
    id: "fc-1",
    name: "The Open Knowledge Foundation Trust",
    label: "Founding Supporter",
    message: "Proud to support open infrastructure for public domain literature everywhere.",
    date: "2026",
  },
  {
    id: "fc-2",
    name: "Anonymous Academic Reader",
    label: "Sustaining Supporter",
    message: "In memory of my professor who taught me the value of unhindered access to books.",
    date: "2026",
  },
  {
    id: "fc-3",
    name: "Digital Humanities Circle",
    label: "Community Supporter",
    message: "Supporting fast Cloudflare edge hosting for global readers.",
    date: "2026",
  },
];

export default function ContributorsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [selectedContributionType, setSelectedContributionType] = useState<"book" | "translation" | "financial">("book");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Touch Swipe Handling
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  }, []);

  // Auto-play horizontal carousel every 7 seconds
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion, nextSlide]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 50) {
      if (distance > 0) nextSlide();
      else prevSlide();
    }
    setIsPaused(false);
  };

  const handleOpenCTA = (type: "book" | "translation" | "financial") => {
    setSelectedContributionType(type);
    setContributionModalOpen(true);
    setFormSubmitted(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* ================= 1. HERO CAROUSEL (EXACT HOME PAGE DESIGN & SIZE) ================= */}
      <section
        aria-label="Contributor Highlights Carousel"
        className="relative w-full min-h-[80vh] lg:min-h-[88vh] overflow-hidden bg-background text-foreground border-b flex flex-col justify-between transition-colors duration-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
      >
        {/* Background Ambient Glows (Theme-Reactive) */}
        <div className="absolute top-1/4 left-1/4 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-[450px] w-[450px] translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/15 blur-[140px] pointer-events-none" />

        {/* Horizontal Carousel Track */}
        <div className="relative w-full flex-1 flex items-center">
          <div
            className="w-full flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* SLIDE 1: Book Providers (Left Aligned) */}
            <div className="w-full flex-shrink-0 min-h-[75vh] lg:min-h-[82vh] flex items-center justify-start px-6 md:px-16 lg:px-24 py-12 relative overflow-hidden">
              {/* Ambient Watermark Icon */}
              <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none hidden lg:block text-foreground">
                <BookOpen className="w-[450px] h-[450px]" />
              </div>

              <div className="container max-w-6xl mx-auto flex flex-col items-start justify-center text-left space-y-8 relative z-10">
                {/* Top Status Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold shadow-sm backdrop-blur">
                    <BookOpen className="w-4 h-4 text-amber-500" /> Shared Shelves
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold shadow-sm backdrop-blur">
                    <Sparkles className="w-4 h-4" /> Open Access Preservation
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-4 max-w-4xl">
                  <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-tight">
                    Books Find New Readers Here
                  </h1>
                  <p className="max-w-3xl text-muted-foreground text-lg sm:text-xl md:text-2xl font-normal leading-relaxed">
                    Book providers help expand Literary Harbor by sharing books, verified public-domain collections, and resources that deserve to remain accessible. Every contribution can open a new shelf for readers everywhere.
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    size="lg"
                    className="rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-10 h-14 text-base shadow-xl gap-2"
                    onClick={() => handleOpenCTA("book")}
                  >
                    Donate Books <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* SLIDE 2: Translators (Left Aligned) */}
            <div className="w-full flex-shrink-0 min-h-[75vh] lg:min-h-[82vh] flex items-center justify-start px-6 md:px-16 lg:px-24 py-12 relative overflow-hidden">
              {/* Ambient Watermark Icon */}
              <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none hidden lg:block text-foreground">
                <Languages className="w-[450px] h-[450px]" />
              </div>

              <div className="container max-w-6xl mx-auto flex flex-col items-start justify-center text-left space-y-8 relative z-10">
                {/* Top Status Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold shadow-sm backdrop-blur">
                    <Languages className="w-4 h-4 text-purple-500" /> Across Languages
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold shadow-sm backdrop-blur">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Cultural Preservation
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-4 max-w-4xl">
                  <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-tight">
                    Translation Connects Worlds
                  </h2>
                  <p className="max-w-3xl text-muted-foreground text-lg sm:text-xl md:text-2xl font-normal leading-relaxed">
                    Translators carry literature, scholarship, history, and sacred texts across language barriers. We honour the care, cultural knowledge, and dedication behind every translation.
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    size="lg"
                    className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 h-14 text-base shadow-xl gap-2"
                    onClick={() => handleOpenCTA("translation")}
                  >
                    Volunteer as a Translator <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* SLIDE 3: Financial Contributors (Left Aligned) */}
            <div className="w-full flex-shrink-0 min-h-[75vh] lg:min-h-[82vh] flex items-center justify-start px-6 md:px-16 lg:px-24 py-12 relative overflow-hidden">
              {/* Ambient Watermark Icon */}
              <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none hidden lg:block text-foreground">
                <Anchor className="w-[450px] h-[450px]" />
              </div>

              <div className="container max-w-6xl mx-auto flex flex-col items-start justify-center text-left space-y-8 relative z-10">
                {/* Top Status Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-bold shadow-sm backdrop-blur">
                    <Anchor className="w-4 h-4 text-teal-500" /> Sustaining Open Knowledge
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold shadow-sm backdrop-blur">
                    <Sparkles className="w-4 h-4" /> 100% Non-Profit Mission
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-4 max-w-4xl">
                  <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-tight">
                    Support Keeps the Harbor Open
                  </h2>
                  <p className="max-w-3xl text-muted-foreground text-lg sm:text-xl md:text-2xl font-normal leading-relaxed">
                    Financial contributors help sustain preservation, hosting, development, accessibility, and the long-term future of Literary Harbor. Every act of support strengthens the mission of open literature.
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-teal-500 to-amber-500 hover:from-teal-600 hover:to-amber-600 text-slate-950 font-bold px-10 h-14 text-base shadow-xl gap-2"
                    onClick={() => handleOpenCTA("financial")}
                  >
                    Support the Project <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Left/Right Navigation Arrows (EXACT HOME PAGE STYLE) */}
        <button
          onClick={prevSlide}
          aria-label="Previous Hero Page"
          className="absolute top-1/2 left-4 md:left-6 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 text-foreground border border-border flex items-center justify-center z-20 hover:bg-primary hover:text-white transition-all shadow-xl backdrop-blur"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Hero Page"
          className="absolute top-1/2 right-4 md:right-6 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 text-foreground border border-border flex items-center justify-center z-20 hover:bg-primary hover:text-white transition-all shadow-xl backdrop-blur"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

      </section>

      {/* Sentence Below Carousel */}
      <div className="w-full py-8 bg-muted/20 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <p className="font-serif text-lg md:text-xl text-primary font-medium leading-relaxed italic border-x border-primary/20 py-2 px-6">
            “Every book shared, translation offered, and contribution made helps keep knowledge open, accessible, and alive.”
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 space-y-16">
        {/* ================= 2. INTRO SECTION ================= */}
        <section aria-labelledby="intro-heading" className="space-y-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Users className="w-4 h-4 text-purple-500" />
            Community & Stewardship
          </div>

          <h2 id="intro-heading" className="font-serif text-3xl md:text-5xl font-extrabold tracking-tight">
            Built by Many Hands
          </h2>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            Literary Harbor is sustained by people who share books, preserve languages, and support open access to knowledge. Every contribution is voluntary, and every contributor receives full credit with gratitude.
          </p>

          <div className="pt-2">
            <div className="inline-block p-6 rounded-2xl bg-card border shadow-md">
              <p className="text-primary font-bold text-sm md:text-base flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                <span>No contribution is too small when it helps knowledge reach another reader.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ================= 3. CONTRIBUTOR CATEGORIES ================= */}
        <section aria-labelledby="categories-heading" className="space-y-8">
          <div className="text-center space-y-2">
            <h2 id="categories-heading" className="font-serif text-2xl md:text-4xl font-bold tracking-tight">
              Contributor Honor Roll
            </h2>
            <p className="text-muted-foreground text-sm">
              Celebrating the scholars, archivists, translators, and patrons behind our shared shelves.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 rounded-2xl bg-muted p-1.5 gap-1 max-w-2xl mx-auto border">
              <TabsTrigger value="all" className="rounded-xl text-xs font-bold">
                All Contributors
              </TabsTrigger>
              <TabsTrigger value="books" className="rounded-xl text-xs font-bold gap-1 text-amber-600 dark:text-amber-400">
                <BookOpen className="w-3.5 h-3.5" /> Book Providers
              </TabsTrigger>
              <TabsTrigger value="translators" className="rounded-xl text-xs font-bold gap-1 text-purple-600 dark:text-purple-400">
                <Languages className="w-3.5 h-3.5" /> Translators
              </TabsTrigger>
              <TabsTrigger value="financial" className="rounded-xl text-xs font-bold gap-1 text-teal-600 dark:text-teal-400">
                <Heart className="w-3.5 h-3.5" /> Supporters
              </TabsTrigger>
            </TabsList>

            {/* TAB CONTENT: ALL */}
            <TabsContent value="all" className="space-y-12">
              {/* BOOK PROVIDERS PANEL */}
              <div className="space-y-6">
                <div className="border-b pb-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" /> Book Providers
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      The people and organisations helping expand our shared library by donating books and verified public-domain sources.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
                    {BOOK_PROVIDERS.length} Contributors
                  </Badge>
                </div>

                {BOOK_PROVIDERS.length === 0 ? (
                  <div className="p-8 text-center bg-muted/40 rounded-2xl border border-dashed text-muted-foreground text-sm">
                    No book providers are listed yet. The first contribution can help open a new shelf for readers everywhere.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {BOOK_PROVIDERS.map((bp) => (
                      <Card key={bp.id} className="rounded-2xl border bg-card hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between shadow-sm">
                        <CardHeader className="space-y-2 pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-2xl">{bp.avatarBadge || "📖"}</span>
                            {bp.location && (
                              <Badge variant="secondary" className="text-[10px]">
                                {bp.location}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="font-serif text-lg font-bold leading-snug">
                            {bp.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="p-2.5 rounded-xl bg-muted/50 border">
                              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 mb-1">Contributed:</p>
                              <p className="text-foreground leading-normal">{bp.booksContributed}</p>
                            </div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {bp.languages.map((lang, idx) => (
                                <Badge key={idx} variant="outline" className="text-[10px]">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {bp.appreciationNote && (
                            <p className="text-[11px] text-muted-foreground italic border-t pt-2.5 mt-2">
                              "{bp.appreciationNote}"
                            </p>
                          )}

                          {bp.websiteUrl && (
                            <div className="pt-2">
                              <a
                                href={bp.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                              >
                                Collection Link <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* TRANSLATORS PANEL */}
              <div className="space-y-6 pt-4">
                <div className="border-b pb-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                      <Languages className="w-5 h-5" /> Translators
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bridging languages, cultures, and generations so stories and research travel beyond language barriers.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs">
                    {TRANSLATORS.length} Translators
                  </Badge>
                </div>

                {TRANSLATORS.length === 0 ? (
                  <div className="p-8 text-center bg-muted/40 rounded-2xl border border-dashed text-muted-foreground text-sm">
                    No translators are listed yet. A single translation can carry an entire world to a new audience.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TRANSLATORS.map((tr) => (
                      <Card key={tr.id} className="rounded-2xl border bg-card hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between shadow-sm">
                        <CardHeader className="space-y-2 pb-3">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-600 dark:text-purple-300 bg-purple-500/10">
                              {tr.languagePair}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] capitalize">
                              {tr.type}
                            </Badge>
                          </div>
                          <CardTitle className="font-serif text-lg font-bold leading-snug">
                            {tr.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs flex-1 flex flex-col justify-between">
                          <div className="p-2.5 rounded-xl bg-muted/50 border">
                            <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 mb-1">Works Translated:</p>
                            <p className="text-foreground leading-normal">{tr.worksTranslated}</p>
                          </div>

                          {tr.appreciationNote && (
                            <p className="text-[11px] text-muted-foreground italic border-t pt-2.5">
                              "{tr.appreciationNote}"
                            </p>
                          )}

                          {tr.portfolioUrl && (
                            <div className="pt-2">
                              <a
                                href={tr.portfolioUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                              >
                                Portfolio / Profile <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* FINANCIAL CONTRIBUTORS PANEL */}
              <div className="space-y-6 pt-4">
                <div className="border-b pb-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2">
                      <Anchor className="w-5 h-5" /> Financial Contributors
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supporting the long-term infrastructure, preservation, and hosting of Literary Harbor.
                    </p>
                  </div>
                  <Badge variant="outline" className="border-teal-500/30 text-teal-600 dark:text-teal-400 text-xs">
                    {FINANCIAL_CONTRIBUTORS.length} Supporters
                  </Badge>
                </div>

                {FINANCIAL_CONTRIBUTORS.length === 0 ? (
                  <div className="p-8 text-center bg-muted/40 rounded-2xl border border-dashed text-muted-foreground text-sm">
                    No financial contributors are listed yet. Every act of support helps keep knowledge open and available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FINANCIAL_CONTRIBUTORS.map((fc) => (
                      <Card key={fc.id} className="rounded-2xl border bg-card hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between shadow-sm">
                        <CardHeader className="space-y-2 pb-3">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="outline" className="text-[10px] border-teal-500/30 text-teal-600 dark:text-teal-300 bg-teal-500/10">
                              <Award className="w-3 h-3 mr-1" />
                              {fc.label}
                            </Badge>
                            {fc.date && <span className="text-[10px] text-muted-foreground">{fc.date}</span>}
                          </div>
                          <CardTitle className="font-serif text-lg font-bold leading-snug">
                            {fc.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs flex-1 flex flex-col justify-between">
                          {fc.message && (
                            <div className="p-3 rounded-xl bg-muted/50 border text-muted-foreground italic">
                              "{fc.message}"
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB CONTENT: INDIVIDUAL CATEGORIES */}
            <TabsContent value="books">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {BOOK_PROVIDERS.map((bp) => (
                  <Card key={bp.id} className="rounded-2xl border bg-card p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{bp.avatarBadge || "📖"}</span>
                      {bp.location && <Badge variant="secondary" className="text-[10px]">{bp.location}</Badge>}
                    </div>
                    <h3 className="font-serif font-bold text-lg">{bp.name}</h3>
                    <p className="text-xs text-foreground">{bp.booksContributed}</p>
                    {bp.appreciationNote && <p className="text-xs text-muted-foreground italic">"{bp.appreciationNote}"</p>}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="translators">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TRANSLATORS.map((tr) => (
                  <Card key={tr.id} className="rounded-2xl border bg-card p-4 space-y-3 shadow-sm">
                    <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-600 dark:text-purple-300">{tr.languagePair}</Badge>
                    <h3 className="font-serif font-bold text-lg">{tr.name}</h3>
                    <p className="text-xs text-foreground">{tr.worksTranslated}</p>
                    {tr.appreciationNote && <p className="text-xs text-muted-foreground italic">"{tr.appreciationNote}"</p>}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="financial">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FINANCIAL_CONTRIBUTORS.map((fc) => (
                  <Card key={fc.id} className="rounded-2xl border bg-card p-4 space-y-3 shadow-sm">
                    <Badge variant="outline" className="text-[10px] border-teal-500/30 text-teal-600 dark:text-teal-300">{fc.label}</Badge>
                    <h3 className="font-serif font-bold text-lg">{fc.name}</h3>
                    {fc.message && <p className="text-xs text-muted-foreground italic">"{fc.message}"</p>}
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* ================= 4. FINAL CALL TO ACTION ================= */}
        <section aria-labelledby="cta-heading" className="rounded-3xl border bg-card p-8 md:p-12 space-y-8 text-center shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 id="cta-heading" className="font-serif text-3xl md:text-5xl font-extrabold tracking-tight">
              Contribute to Literary Harbor
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              There are many ways to help this library grow. Share books, volunteer your translation skills, recommend trusted public-domain resources, or support the project’s ongoing work.
            </p>
          </div>

          {/* Three Prominent CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-sm md:text-base font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 gap-2 shadow-lg shadow-amber-500/20"
              onClick={() => handleOpenCTA("book")}
            >
              <BookOpen className="w-4 h-4" />
              Donate Books
            </Button>

            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-sm md:text-base font-bold bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-lg shadow-purple-600/20"
              onClick={() => handleOpenCTA("translation")}
            >
              <Languages className="w-4 h-4" />
              Volunteer as a Translator
            </Button>

            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-sm md:text-base font-bold bg-gradient-to-r from-teal-500 to-amber-500 hover:from-teal-600 hover:to-amber-600 text-slate-950 gap-2 shadow-lg shadow-teal-500/20"
              onClick={() => handleOpenCTA("financial")}
            >
              <Anchor className="w-4 h-4" />
              Support the Project
            </Button>
          </div>

          {/* Privacy and Credit Note */}
          <div className="max-w-3xl mx-auto pt-4 border-t text-xs text-muted-foreground space-y-2 relative z-10">
            <p className="flex items-center justify-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Privacy & Attribution Guarantee
            </p>
            <p className="leading-relaxed">
              Contributors choose how they are credited: full name, organisation, initials, a preferred public name, or anonymous. Credits are added after review to ensure accuracy, permission, and respect for every contributor.
            </p>
          </div>
        </section>

        {/* Modal / Form for Interactive Contribution Request */}
        {contributionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl border bg-card p-6 md:p-8 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setContributionModalOpen(false)}
                className="absolute top-5 right-5 text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>

              <div className="space-y-2">
                <Badge variant="outline" className="text-xs capitalize border-purple-500/30 text-purple-600 dark:text-purple-300">
                  {selectedContributionType} Contribution
                </Badge>
                <h3 className="font-serif text-2xl font-bold">
                  {selectedContributionType === "book" && "Donate Books or Collections"}
                  {selectedContributionType === "translation" && "Volunteer as a Translator"}
                  {selectedContributionType === "financial" && "Support Literary Harbor"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Please provide your details below. Credits and permissions will be confirmed before publishing.
                </p>
              </div>

              {formSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-base text-emerald-600 dark:text-emerald-400">Contribution Offer Received!</h4>
                  <p className="text-xs text-muted-foreground">
                    Thank you for supporting open literature. Our curation team will review your message and reach out shortly.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setContributionModalOpen(false)}
                    className="rounded-full text-xs"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormSubmitted(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Your Name or Preferred Public Credit</label>
                    <Input
                      required
                      placeholder="e.g. Jane Doe, Dr. A. Smith, or Anonymous"
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Email Address (For Verification Only)</label>
                    <Input
                      required
                      type="email"
                      placeholder="you@example.com"
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Contribution Details</label>
                    <Textarea
                      required
                      placeholder={
                        selectedContributionType === "book"
                          ? "Specify titles, Gutenberg IDs, or public domain archives you wish to share..."
                          : selectedContributionType === "translation"
                          ? "List your language pairs, domain expertise (literary, academic, sacred), and availability..."
                          : "Mention any preferred dedication or support inquiries..."
                      }
                      rows={4}
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Attribution Preference</label>
                    <select className="w-full rounded-xl bg-background border p-2 text-xs text-foreground focus:ring-primary">
                      <option value="full">Publish full name / organisation on Honor Roll</option>
                      <option value="initials">Publish initials only</option>
                      <option value="anonymous">Keep contribution 100% Anonymous</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 text-xs py-5">
                    <Send className="w-3.5 h-3.5" />
                    Submit Contribution Offer
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
