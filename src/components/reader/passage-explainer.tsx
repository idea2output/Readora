"use client";

import { useState, useEffect } from "react";
import { Sparkles, HelpCircle, BookMarked, History, RefreshCw, Languages, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PassageExplainerProps {
  bookTitle?: string;
}

export function PassageExplainer({ bookTitle }: PassageExplainerProps) {
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [explanationResult, setExplanationResult] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<string | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 10) {
        const text = selection.toString().trim();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(text);
        setPosition({
          top: rect.top + window.scrollY - 60,
          left: Math.max(10, rect.left + rect.width / 2 - 150),
        });
      } else {
        if (!explaining && !explanationResult) {
          setSelectedText("");
          setPosition(null);
        }
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [explaining, explanationResult]);

  const handleExplain = async (mode: string) => {
    if (!selectedText || explaining) return;
    setExplaining(true);
    setActiveMode(mode);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText, mode, bookTitle }),
      });
      const data = await res.json();
      if (res.ok) {
        setExplanationResult(data.explanation);
      } else {
        setExplanationResult("Could not explain passage.");
      }
    } catch (e) {
      setExplanationResult("Network error.");
    } finally {
      setExplaining(false);
    }
  };

  const handleClose = () => {
    setSelectedText("");
    setPosition(null);
    setExplanationResult(null);
    setActiveMode(null);
  };

  if (!position || !selectedText) return null;

  return (
    <div
      className="absolute z-50 transition-all duration-200"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <Card className="p-2 shadow-2xl rounded-2xl bg-card/95 backdrop-blur border border-primary/20 flex flex-col gap-2 max-w-md">
        {explanationResult ? (
          <div className="p-3 text-xs leading-relaxed space-y-2 relative">
            <div className="flex items-center justify-between font-bold text-primary">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                AI Explanation ({activeMode})
              </span>
              <button onClick={handleClose} className="p-1 rounded-full hover:bg-muted">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-muted-foreground">{explanationResult}</p>
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-bold text-muted-foreground px-2 uppercase tracking-wider">AI Explain:</span>
            <Button
              size="sm"
              variant="ghost"
              disabled={explaining}
              onClick={() => handleExplain("simple")}
              className="h-7 text-[11px] rounded-full gap-1 px-2.5"
            >
              <HelpCircle className="w-3 h-3 text-primary" /> Simple
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={explaining}
              onClick={() => handleExplain("historical")}
              className="h-7 text-[11px] rounded-full gap-1 px-2.5"
            >
              <History className="w-3 h-3 text-purple-500" /> Context
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={explaining}
              onClick={() => handleExplain("modern")}
              className="h-7 text-[11px] rounded-full gap-1 px-2.5"
            >
              <Languages className="w-3 h-3 text-indigo-500" /> Modern
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={explaining}
              onClick={() => handleExplain("vocabulary")}
              className="h-7 text-[11px] rounded-full gap-1 px-2.5"
            >
              <BookMarked className="w-3 h-3 text-amber-500" /> Vocab
            </Button>
            <button onClick={handleClose} className="p-1 rounded-full hover:bg-muted ml-auto">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        {explaining && (
          <div className="p-2 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>Analyzing selected passage...</span>
          </div>
        )}
      </Card>
    </div>
  );
}
