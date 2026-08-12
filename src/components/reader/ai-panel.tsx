"use client";

import { useState } from "react";
import { Sparkles, MessageSquare, BookOpen, Users, Send, RefreshCw, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface AiPanelProps {
  book: any;
  currentChapter: any;
  onNavigateToChapter?: (chapterId: string) => void;
}

interface Citation {
  sourceId: number;
  chapterId: string;
  chapterTitle: string;
  excerpt: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  citations?: Citation[];
  model?: string;
}

export function AiPanel({ book, currentChapter, onNavigateToChapter }: AiPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ask");

  // Ask the Book State
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: `Hello! I am your AI Reading Assistant for "${book.title}". Ask me any question about the plot, themes, or arguments in this book, and I will answer grounded directly in the text!`
    }
  ]);

  // Summary State
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Characters State
  const [charactersData, setCharactersData] = useState<any[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || asking) return;

    const qText = question.trim();
    setQuestion("");
    setAsking(true);

    setChatHistory(prev => [...prev, { sender: 'user', text: qText }]);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, question: qText }),
      });
      const data = await res.json();

      if (res.ok) {
        setChatHistory(prev => [
          ...prev,
          {
            sender: 'ai',
            text: data.answer,
            citations: data.citations || [],
            model: data.model,
          }
        ]);
      } else {
        setChatHistory(prev => [
          ...prev,
          { sender: 'ai', text: `Sorry, I encountered an error: ${data.error || 'Failed to retrieve answer'}` }
        ]);
      }
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev,
        { sender: 'ai', text: `Network error: ${err.message}` }
      ]);
    } finally {
      setAsking(false);
    }
  };

  const handleFetchSummary = async () => {
    if (!currentChapter?.id || loadingSummary) return;
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, chapterId: currentChapter.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSummaryData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleFetchCharacters = async () => {
    if (loadingCharacters || charactersData.length > 0) return;
    setLoadingCharacters(true);
    try {
      const res = await fetch("/api/ai/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setCharactersData(data.characters || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCharacters(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-6 gap-2 border border-white/20 transition-transform duration-200 hover:scale-105"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm hidden sm:inline">Ask AI Assistant</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[360px] sm:w-[460px] p-0 flex flex-col h-full bg-card">
        {/* Header */}
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <SheetTitle className="text-white font-serif text-lg">AI Reading Assistant</SheetTitle>
          </div>
          <p className="text-xs text-purple-200 truncate">{book.title}</p>
        </SheetHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => {
          setActiveTab(val);
          if (val === 'summary' && !summaryData) handleFetchSummary();
          if (val === 'characters' && charactersData.length === 0) handleFetchCharacters();
        }} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-3 mx-4 mt-3 bg-muted rounded-full p-1">
            <TabsTrigger value="ask" className="rounded-full text-xs font-semibold gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Ask Book
            </TabsTrigger>
            <TabsTrigger value="summary" className="rounded-full text-xs font-semibold gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Summary
            </TabsTrigger>
            <TabsTrigger value="characters" className="rounded-full text-xs font-semibold gap-1">
              <Users className="w-3.5 h-3.5" /> Characters
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ASK THE BOOK */}
          <TabsContent value="ask" className="flex-1 flex flex-col min-h-0 p-4 space-y-4">
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none border'
                    }`}
                  >
                    {msg.text}

                    {/* Source Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Book Sources & Citations:
                        </div>
                        {msg.citations.map((c) => (
                          <div key={c.sourceId} className="p-2 rounded-lg bg-background/60 text-[11px] space-y-1 border">
                            <div className="flex items-center justify-between font-semibold text-primary">
                              <span>Source #{c.sourceId} ({c.chapterTitle})</span>
                              {onNavigateToChapter && (
                                <button
                                  onClick={() => onNavigateToChapter(c.chapterId)}
                                  className="text-[10px] flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
                                >
                                  Open in book <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                            <p className="italic text-muted-foreground text-[10px] line-clamp-2">"{c.excerpt}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {asking && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-3">
                  <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  <span>Searching book text & generating answer...</span>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-500 mt-0.5" />
              <span>AI answers are grounded in the book text. Please verify important citations against the original text.</span>
            </div>

            {/* Question Input */}
            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <Input
                placeholder="Ask something about this book..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="rounded-full text-xs px-4 py-5"
              />
              <Button type="submit" size="icon" disabled={asking} className="rounded-full flex-shrink-0 w-10 h-10">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </TabsContent>

          {/* TAB 2: CHAPTER SUMMARY */}
          <TabsContent value="summary" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Summary for {currentChapter?.title || 'Current Chapter'}</h3>
              <Button size="sm" variant="ghost" onClick={handleFetchSummary} disabled={loadingSummary} className="h-7 text-xs rounded-full">
                <RefreshCw className={`w-3 h-3 ${loadingSummary ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {loadingSummary ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span>Generating chapter summary...</span>
              </div>
            ) : summaryData ? (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                  <span className="font-bold text-primary text-[10px] uppercase tracking-wider">Short Overview</span>
                  <p>{summaryData.shortSummary}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Detailed Summary</span>
                  <p className="text-muted-foreground leading-relaxed">{summaryData.detailedSummary}</p>
                </div>

                {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <span className="font-bold text-xs">Key Takeaways:</span>
                    <ul className="space-y-1">
                      {summaryData.keyPoints.map((pt: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Click refresh to generate an AI summary of this chapter.
              </div>
            )}
          </TabsContent>

          {/* TAB 3: CHARACTERS */}
          <TabsContent value="characters" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Character Map</h3>
              <Button size="sm" variant="ghost" onClick={handleFetchCharacters} disabled={loadingCharacters} className="h-7 text-xs rounded-full">
                <RefreshCw className={`w-3 h-3 ${loadingCharacters ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {loadingCharacters ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span>Extracting characters & roles...</span>
              </div>
            ) : charactersData.length > 0 ? (
              <div className="space-y-3">
                {charactersData.map((c, i) => (
                  <div key={i} className="p-3 rounded-2xl border bg-muted/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-primary">{c.name}</h4>
                      <Badge variant="outline" className="text-[9px]">{c.role}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{c.description}</p>
                    {c.relationships && (
                      <p className="text-[10px] text-muted-foreground/80 italic">Relationships: {c.relationships}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No character data loaded yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
