"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Menu, Settings, Bookmark, ChevronLeft, ChevronRight, Check, ShieldCheck, Languages, BookOpenText } from 'lucide-react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { AiPanel } from '@/components/reader/ai-panel';
import { PassageExplainer } from '@/components/reader/passage-explainer';
import { QuranAudioPlayer } from '@/components/quran/quran-audio-player';

interface ReaderLayoutProps {
  book: any;
  chapters: any[];
  visibleTranslations?: any[];
  visibleReciters?: any[];
  visibleTafsirs?: any[];
}

export default function ReaderLayout({
  book,
  chapters,
  visibleTranslations = [],
  visibleReciters = [],
  visibleTafsirs = [],
}: ReaderLayoutProps) {
  const { theme, setTheme } = useTheme();
  
  // Reader Settings State
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontFamily, setFontFamily] = useState('font-serif');
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [maxWidth, setMaxWidth] = useState('max-w-3xl');
  const [isNavVisible, setIsNavVisible] = useState(true);

  // Quran Dynamic Selection State
  const [selectedTranslation, setSelectedTranslation] = useState<any>(
    visibleTranslations.find((t) => t.is_default) || visibleTranslations[0] || null
  );
  const [selectedTafsir, setSelectedTafsir] = useState<any>(
    visibleTafsirs.find((t) => t.is_default) || visibleTafsirs[0] || null
  );
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  const currentChapter = chapters[currentChapterIdx] || chapters[0];
  const isQuran = book?.slug === 'holy-quran-arabic';

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`readora_progress_${book.id}`);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.chapterIdx !== undefined && data.chapterIdx < chapters.length) {
        setCurrentChapterIdx(data.chapterIdx);
      }
    }
  }, [book.id, chapters.length]);

  // Highlight Active Verse in DOM
  useEffect(() => {
    if (!activeVerseKey) {
      document.querySelectorAll(".quran-active-verse").forEach((el) => {
        el.classList.remove("quran-active-verse", "bg-amber-500/20", "ring-2", "ring-amber-500");
      });
      return;
    }

    const verseId = `verse-${activeVerseKey.replace(':', '-')}`;
    document.querySelectorAll(".quran-active-verse").forEach((el) => {
      if (el.id !== verseId) {
        el.classList.remove("quran-active-verse", "bg-amber-500/20", "ring-2", "ring-amber-500");
      }
    });

    const activeElem = document.getElementById(verseId);
    if (activeElem) {
      activeElem.classList.add("quran-active-verse", "bg-amber-500/20", "ring-2", "ring-amber-500");
    }
  }, [activeVerseKey]);

  // Save progress when chapter changes
  useEffect(() => {
    localStorage.setItem(`readora_progress_${book.id}`, JSON.stringify({
      chapterIdx: currentChapterIdx,
      timestamp: Date.now()
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapterIdx, book.id]);

  // Auto-hide nav on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!chapters || chapters.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center flex-col space-y-4">
        <h2 className="text-2xl font-bold">No Content Available</h2>
        <Link href={`/books/${book.slug}`}>
          <Button variant="outline">Back to Book</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${fontFamily}`} style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}>
      
      {/* Top Navigation Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isNavVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href={`/books/${book.slug}`}>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="hidden md:block text-sm font-semibold truncate max-w-[200px]">{book.title}</div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              {/* Quran Reciter Audio Controls */}
              {isQuran && visibleReciters.length > 0 && (
                <QuranAudioPlayer
                  chapterNumber={currentChapter.sequence_number || currentChapterIdx + 1}
                  chapterName={currentChapter.name_simple || `Surah ${currentChapter.sequence_number}`}
                  totalVerses={currentChapter.verses_count || 7}
                  visibleReciters={visibleReciters}
                  onActiveVerseChange={setActiveVerseKey}
                />
              )}

              {/* Quran Translation Selector */}
              {isQuran && visibleTranslations.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs border-amber-500/40 text-amber-900 dark:text-amber-300">
                      <Languages className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden sm:inline">{selectedTranslation?.name || "Translations"}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 space-y-2 rounded-2xl">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Visible Translations</h4>
                    <div className="space-y-1">
                      {visibleTranslations.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTranslation(t)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            selectedTranslation?.id === t.id ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold" : "hover:bg-accent"
                          }`}
                        >
                          <span className="truncate">{t.name}</span>
                          <Badge variant="outline" className="text-[9px] uppercase">{t.language_code}</Badge>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Table of Contents */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="Table of Contents">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="font-serif">Table of Contents</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[80vh]">
                    {chapters.map((ch, idx) => (
                      <button 
                        key={ch.id} 
                        onClick={() => setCurrentChapterIdx(idx)}
                        className={`text-left px-4 py-3 rounded-lg text-sm transition-colors ${currentChapterIdx === idx ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent'}`}
                      >
                        {ch.title || `Chapter ${ch.sequence_number}`}
                      </button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Reader Settings */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="Reader Settings">
                    <Settings className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 space-y-6" align="end">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Theme</h4>
                    <div className="flex gap-2">
                      <button onClick={() => setTheme('light')} className={`flex-1 py-2 border rounded-md bg-white text-black font-medium ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}>Light</button>
                      <button onClick={() => setTheme('sepia')} className={`flex-1 py-2 border rounded-md bg-[#f4ecd8] text-[#5b4636] font-medium ${theme === 'sepia' ? 'ring-2 ring-primary' : ''}`}>Sepia</button>
                      <button onClick={() => setTheme('dark')} className={`flex-1 py-2 border rounded-md bg-zinc-950 text-white font-medium ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}>Dark</button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Font Size</h4>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" onClick={() => setFontSize(f => Math.max(12, f - 2))}>A-</Button>
                      <span className="flex-1 text-center font-medium">{fontSize}px</span>
                      <Button variant="outline" onClick={() => setFontSize(f => Math.min(32, f + 2))}>A+</Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Font Family</h4>
                    <div className="flex flex-col gap-2">
                      <Button variant={fontFamily === 'font-serif' ? 'default' : 'outline'} onClick={() => setFontFamily('font-serif')} className="justify-start font-serif">Merriweather (Serif)</Button>
                      <Button variant={fontFamily === 'font-sans' ? 'default' : 'outline'} onClick={() => setFontFamily('font-sans')} className="justify-start font-sans">Inter (Sans-serif)</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" className="rounded-full">
                <Bookmark className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Content */}
      <main 
        ref={contentRef}
        className={`mx-auto px-6 md:px-12 pt-24 pb-32 transition-all duration-300 ${maxWidth}`}
      >
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">{currentChapter?.title || `Chapter ${currentChapter?.sequence_number}`}</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-sm">{book.title}</p>
        </div>

        <div 
          className="prose dark:prose-invert max-w-none reader-content"
          dangerouslySetInnerHTML={{ __html: currentChapter?.content || '<em>This chapter is empty.</em>' }}
        />

        {/* Chapter Navigation Footer */}
        <div className="mt-20 pt-8 border-t flex items-center justify-between">
          <Button 
            variant="outline" 
            disabled={currentChapterIdx === 0}
            onClick={() => setCurrentChapterIdx(i => i - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentChapterIdx + 1} of {chapters.length}
          </span>
          <Button 
            variant="outline" 
            disabled={currentChapterIdx === chapters.length - 1}
            onClick={() => setCurrentChapterIdx(i => i + 1)}
          >
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>

      {/* Sacred Text AI Firewall Badge */}
      {book?.content_domain === 'SACRED_TEXT' || book?.ai_enabled === false || isQuran ? (
        <div className="fixed bottom-6 right-6 z-40 bg-amber-950/90 text-amber-200 border border-amber-500/40 text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Sacred Text — Permanent AI Firewall Active</span>
        </div>
      ) : (
        <>
          <AiPanel
            book={book}
            currentChapter={currentChapter}
            onNavigateToChapter={(chapterId) => {
              const idx = chapters.findIndex(c => c.id === chapterId);
              if (idx !== -1) setCurrentChapterIdx(idx);
            }}
          />
          <PassageExplainer bookTitle={book.title} />
        </>
      )}

      {/* CSS overrides for the dynamic reader content */}
      <style dangerouslySetInnerHTML={{__html: `
        .reader-content p {
          margin-bottom: 1.5em;
          text-indent: 1.5em;
        }
        .reader-content h2, .reader-content h3 {
          margin-top: 2em;
          margin-bottom: 1em;
        }
        .quran-active-verse {
          transition: all 0.3s ease;
          border-radius: 0.75rem;
        }
      `}} />
    </div>
  );
}
