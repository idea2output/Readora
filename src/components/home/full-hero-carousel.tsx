"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, ShieldCheck, ChevronLeft, ChevronRight, Library, BookMarked, ArrowRight, Globe, School } from "lucide-react";

interface FullHeroCarouselProps {
  totalBooksCount: number;
}

export function FullHeroCarousel({ totalBooksCount }: FullHeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play horizontal carousel every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 4);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + 4) % 4);

  return (
    <section className="relative w-full min-h-[80vh] lg:min-h-[88vh] overflow-hidden bg-background text-foreground border-b flex flex-col justify-between transition-colors duration-300">
      
      {/* Background Ambient Glows (Theme-Reactive) */}
      <div className="absolute top-1/4 left-1/4 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[450px] w-[450px] translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/15 blur-[140px] pointer-events-none" />

      {/* Horizontal Carousel Track */}
      <div className="relative w-full flex-1 flex items-center">
        <div 
          className="w-full flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          
          {/* SLIDE 1: Humanity's Knowledge (Left Aligned) */}
          <div className="w-full flex-shrink-0 min-h-[75vh] lg:min-h-[82vh] flex items-center justify-start px-6 md:px-16 lg:px-24 py-12 relative overflow-hidden">
            <div className="container max-w-6xl mx-auto flex flex-col items-start justify-center text-left space-y-8 relative z-10">
              
              {/* Top Status Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold shadow-sm backdrop-blur">
                  <Sparkles className="w-4 h-4 text-primary" /> Rights-Aware Open Library
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold shadow-sm backdrop-blur">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>{totalBooksCount.toLocaleString()} books and Growing...</span>
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-4 max-w-4xl">
                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-tight">
                  Humanity's Knowledge, <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-600 to-secondary">Freely Accessible.</span>
                </h1>
                <p className="max-w-3xl text-muted-foreground text-lg sm:text-xl md:text-2xl font-normal leading-relaxed">
                  Explore thousands of public domain books, academic monographs, and sacred texts — beautifully formatted and permanently free for everyone.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link href="/catalog">
                  <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 h-14 text-base shadow-xl gap-2">
                    Explore Catalog <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

            </div>
          </div>

          {/* SLIDE 2: Literary Harbor (Left Aligned) */}
          <div className="w-full flex-shrink-0 min-h-[75vh] lg:min-h-[82vh] flex items-center justify-start px-6 md:px-16 lg:px-24 py-12 relative overflow-hidden">
            {/* Ambient Watermark Icon */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none hidden lg:block">
              <Library className="w-[450px] h-[450px] text-foreground" />
            </div>

            <div className="container max-w-6xl mx-auto flex flex-col items-start justify-center text-left space-y-8 relative z-10">
              
              {/* Top Status Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold shadow-sm backdrop-blur">
                  <Sparkles className="w-4 h-4 text-primary" /> Rights-Aware Open Library
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold shadow-sm backdrop-blur">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{totalBooksCount.toLocaleString()} Available</span>
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-4 max-w-4xl">
                <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-tight">
                  Literary Harbor
                </h2>
                <p className="max-w-3xl text-muted-foreground text-lg sm:text-xl md:text-2xl font-normal leading-relaxed">
                  Preserving global literature, peer-reviewed monographs, open textbooks, and sacred manuscripts under verified rights governance.
                </p>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full text-left pt-2">
                <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-1.5 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 text-primary font-bold text-base">
                    <BookOpen className="w-4 h-4" /> Public Domain
                  </div>
                  <p className="text-xs text-muted-foreground">Classics, World Literature, Historical Fiction & Poetry</p>
                </div>

                <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-1.5 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 text-indigo-500 font-bold text-base">
                    <School className="w-4 h-4" /> Open Academic
                  </div>
                  <p className="text-xs text-muted-foreground">DOAB, OAPEN, OpenStax Textbooks & Monograph Repositories</p>
                </div>

                <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-1.5 hover:border-primary/50 transition-colors sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-base">
                    <ShieldCheck className="w-4 h-4" /> Rights Engine
                  </div>
                  <p className="text-xs text-muted-foreground">Automated geo-filtering, rights verification & copyright audit</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link href="/catalog">
                  <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 h-14 text-base shadow-xl gap-2">
                    Explore Catalog <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

            </div>
          </div>

          {/* SLIDE 3: Sacred Texts (Left Aligned) */}
          <div className="w-full flex-shrink-0 min-h-[75vh] lg:min-h-[82vh] flex items-center justify-start px-6 md:px-16 lg:px-24 py-12 relative overflow-hidden">
            {/* Ambient Watermark Icon */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none hidden lg:block">
              <BookMarked className="w-[450px] h-[450px] text-foreground" />
            </div>

            <div className="container max-w-6xl mx-auto flex flex-col items-start justify-center text-left space-y-8 relative z-10">
              
              {/* Top Status Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold shadow-sm backdrop-blur">
                  <BookMarked className="w-4 h-4 text-amber-500" /> Sacred Texts Module
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold shadow-sm backdrop-blur">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>0 AI Intervention Firewall</span>
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-4 max-w-4xl">
                <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-tight">
                  Sacred Texts & Religion
                </h2>
                <p className="max-w-3xl text-muted-foreground text-lg sm:text-xl md:text-2xl font-normal leading-relaxed">
                  Authentic Quran (Quran Foundation API), Sahih Hadith, Torah, Bible, Vedas, Bhagavad Gita, and Dhammapada preserved with complete textual integrity.
                </p>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl w-full text-left pt-2">
                <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-1.5 hover:border-amber-500/50 transition-colors">
                  <h4 className="font-bold text-amber-600 dark:text-amber-400 text-base">Official Quran Foundation API</h4>
                  <p className="text-xs text-muted-foreground">Authentic Uthmani Script directly from Quran.com & King Fahd Printing Complex</p>
                </div>
                <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-1.5 hover:border-amber-500/50 transition-colors">
                  <h4 className="font-bold text-amber-600 dark:text-amber-400 text-base">Multi-Translation Engine</h4>
                  <p className="text-xs text-muted-foreground">Side-by-side comparison across languages with 13+ world traditions</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link href="/sacred-texts">
                  <Button size="lg" className="rounded-full bg-amber-700 hover:bg-amber-800 text-white font-bold px-10 h-14 text-base shadow-xl gap-2">
                    Enter Sacred Texts Portal <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

            </div>
          </div>

          {/* SLIDE 4: Academic Knowledge (Left Aligned) */}
          <div className="w-full flex-shrink-0 min-h-[75vh] lg:min-h-[82vh] flex items-center justify-start px-6 md:px-16 lg:px-24 py-12 relative overflow-hidden">
            {/* Ambient Watermark Icon */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none hidden lg:block">
              <Globe className="w-[450px] h-[450px] text-foreground" />
            </div>

            <div className="container max-w-6xl mx-auto flex flex-col items-start justify-center text-left space-y-8 relative z-10">
              
              {/* Top Status Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 text-xs font-bold shadow-sm backdrop-blur">
                  <Globe className="w-4 h-4 text-indigo-500" /> Open Educational Resources
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold shadow-sm backdrop-blur">
                  <span>Peer-Reviewed Academic Knowledge</span>
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-4 max-w-4xl">
                <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-tight">
                  Institutional & Academic Knowledge
                </h2>
                <p className="max-w-3xl text-muted-foreground text-lg sm:text-xl md:text-2xl font-normal leading-relaxed">
                  Providing universities, schools, and research institutions with lawful open textbooks, peer-reviewed academic monographs, and global scholarly literature.
                </p>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl w-full text-left pt-2">
                <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-1.5 hover:border-indigo-500/50 transition-colors">
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400 text-base">DOAB & OAPEN Repositories</h4>
                  <p className="text-xs text-muted-foreground">Thousands of verified open access university press monographs</p>
                </div>
                <div className="p-5 rounded-2xl bg-card border shadow-sm space-y-1.5 hover:border-indigo-500/50 transition-colors">
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400 text-base">Rights & Geographic Governance</h4>
                  <p className="text-xs text-muted-foreground">Automated geo-blocking, rights audit, and copyright protection</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link href="/academic">
                  <Button size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 h-14 text-base shadow-xl gap-2">
                    Explore Academic Books <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Floating Left/Right Navigation Arrows */}
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

      {/* Bottom 4-Page Navigation Bar (Left Aligned Tabs) */}
      <div className="w-full py-4 bg-background/90 backdrop-blur border-t z-20 flex items-center justify-center gap-3">
        {[
          { label: "1. Humanity's Knowledge", subtitle: "Freely Accessible" },
          { label: "2. Literary Harbor", subtitle: "Rights-Aware Library" },
          { label: "3. Sacred Texts", subtitle: "0 AI Firewall" },
          { label: "4. Academic Books", subtitle: "DOAB & OAPEN" }
        ].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`px-4 py-2 rounded-2xl transition-all text-xs font-bold flex flex-col items-center border ${
              currentSlide === idx 
                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] opacity-80 font-normal hidden sm:inline">{tab.subtitle}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
