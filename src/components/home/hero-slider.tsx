"use client";

import { useState, useEffect } from "react";
import { Sparkles, Library, BookOpen, ShieldCheck, ChevronLeft, ChevronRight, BookMarked } from "lucide-react";
import Link from "next/link";

interface HeroSliderProps {
  totalBooksCount: number;
}

export function HeroSlider({ totalBooksCount }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badge: "Rights-Aware Open Library",
      badgeIcon: Sparkles,
      title: "Literary Harbor",
      description: "Preserving global literature, peer-reviewed monographs, open textbooks, and sacred manuscripts under verified rights governance.",
      tags: [
        { label: "Public Domain", detail: "Classics & Literature", color: "text-primary" },
        { label: "Open Academic", detail: "DOAB, OAPEN, OpenStax", color: "text-indigo-400" },
      ],
      bg: "from-slate-900 via-indigo-950 to-slate-950",
      link: "/catalog"
    },
    {
      id: 2,
      badge: "Sacred Texts Section",
      badgeIcon: BookMarked,
      title: "Sacred Literature",
      description: "Neutral, authentic preservation of Quran, Hadith, Vedas, Torah, Bible, and Dhammapada with 0 AI intervention.",
      tags: [
        { label: "Quran Foundation", detail: "Uthmani Script API", color: "text-amber-400" },
        { label: "AI Isolation Guard", detail: "0 AI Modification", color: "text-emerald-400" },
      ],
      bg: "from-amber-950 via-slate-950 to-slate-900",
      link: "/sacred-texts"
    },
    {
      id: 3,
      badge: "Open Academic Monograph Library",
      badgeIcon: ShieldCheck,
      title: "Academic Knowledge",
      description: "Open access peer-reviewed research books, university textbooks, and scholarly collections free for global education.",
      tags: [
        { label: "DOAB & OAPEN", detail: "Verified Monographs", color: "text-cyan-400" },
        { label: "Institutional Access", detail: "Universities & Schools", color: "text-purple-400" },
      ],
      bg: "from-indigo-950 via-slate-900 to-slate-950",
      link: "/academic"
    }
  ];

  // Auto slide horizontally every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full max-w-md mx-auto group">
      {/* Slider Viewport Container */}
      <div className="overflow-hidden rounded-3xl shadow-2xl border border-white/15">
        <div 
          className="flex transition-transform duration-500 ease-out" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => {
            const BadgeIcon = slide.badgeIcon;
            return (
              <div 
                key={slide.id} 
                className={`w-full flex-shrink-0 p-8 bg-gradient-to-br ${slide.bg} text-white space-y-6 relative min-h-[360px] flex flex-col justify-between`}
              >
                {/* Background Watermark */}
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Library className="w-48 h-48" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white border border-white/20 backdrop-blur">
                      <BadgeIcon className="w-3.5 h-3.5 text-primary" /> {slide.badge}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {totalBooksCount.toLocaleString()} Available
                    </span>
                  </div>

                  <h3 className="font-serif text-3xl font-extrabold tracking-tight text-white">{slide.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {slide.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs relative z-10">
                  {slide.tags.map((tag, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1 hover:bg-white/10 transition-colors">
                      <span className={`font-bold ${tag.color} block`}>{tag.label}</span>
                      <span className="text-[10px] text-slate-400 block">{tag.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Navigation Controls (Arrows) */}
      <button 
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute top-1/2 -left-4 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/90 text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-primary"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button 
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute top-1/2 -right-4 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/90 text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-primary"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination Indicators (Dots) */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === idx ? "w-8 bg-primary" : "w-2 bg-slate-400/40 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
