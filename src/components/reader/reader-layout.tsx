"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Settings, Bookmark, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ReaderLayoutProps {
  book: any;
  chapters: any[];
}

export default function ReaderLayout({ book, chapters }: ReaderLayoutProps) {
  const { theme, setTheme } = useTheme();
  
  // Reader Settings State
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontFamily, setFontFamily] = useState('font-serif');
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [maxWidth, setMaxWidth] = useState('max-w-3xl');
  const [isNavVisible, setIsNavVisible] = useState(true);

  const contentRef = useRef<HTMLDivElement>(null);

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

  // Save progress when chapter changes
  useEffect(() => {
    localStorage.setItem(`readora_progress_${book.id}`, JSON.stringify({
      chapterIdx: currentChapterIdx,
      timestamp: Date.now()
    }));
    // Scroll to top when changing chapters
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapterIdx, book.id]);

  const currentChapter = chapters[currentChapterIdx];

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

              {/* Settings */}
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

      {/* CSS overrides for the dynamic reader content */}
      <style dangerouslySetInnerHTML={{__html: `
        .reader-content p {
          margin-bottom: 1.5em;
          text-indent: 1.5em;
        }
        .reader-content h2, .reader-content h3 {
          margin-top: 2em;
          margin-bottom: 1em;
          font-weight: bold;
        }
      `}} />
    </div>
  );
}
