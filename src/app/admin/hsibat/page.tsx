"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Download, RefreshCw, CheckCircle2, Clock, BookOpen, Sparkles, Layers, Library, Lock, KeyRound, Settings2, Cpu, Save, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GutendexBook {
  id: number;
  title: string;
  authors: { name: string; birth_year?: number; death_year?: number }[];
  subjects: string[];
  formats: Record<string, string>;
  download_count: number;
}

interface LocalBook {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  genre: string;
  source_url: string | null;
  authors?: { name: string };
  chapterCount?: number;
}

export default function AdminHsibatPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passError, setPassError] = useState("");

  const [activeTab, setActiveTab] = useState("books");

  // Ingestion State
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GutendexBook[]>([]);
  const [searchError, setSearchError] = useState("");

  const [importingId, setImportingId] = useState<number | null>(null);
  const [importMessage, setImportMessage] = useState<{ [id: number]: string }>({});

  const [localBooks, setLocalBooks] = useState<LocalBook[]>([]);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [syncingBookId, setSyncingBookId] = useState<string | null>(null);
  const [syncMessages, setSyncMessages] = useState<{ [id: string]: string }>({});

  // AI Settings State
  const [aiProvider, setAiProvider] = useState("openai");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [chunkSize, setChunkSize] = useState("750");
  const [userQuota, setUserQuota] = useState("50");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("readora_admin_auth");
    if (saved === "hsibat") {
      setAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === "hsibat") {
      sessionStorage.setItem("readora_admin_auth", "hsibat");
      setAuthenticated(true);
      setPassError("");
    } else {
      setPassError("Incorrect password. Please try again.");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        const s = data.settings;
        if (s) {
          setAiProvider(s.ai_provider || "openai");
          setOpenaiKey(s.openai_api_key || "");
          setAnthropicKey(s.anthropic_api_key || "");
          setGeminiKey(s.gemini_api_key || "");
          setChunkSize(String(s.chunk_size_tokens || 750));
          setUserQuota(String(s.daily_user_quota || 50));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg("");
    try {
      const payload: any = {
        ai_provider: aiProvider,
        chunk_size_tokens: parseInt(chunkSize) || 750,
        daily_user_quota: parseInt(userQuota) || 50,
      };

      // Only send API keys if modified (not empty or masked string)
      if (openaiKey && !openaiKey.includes("••••")) payload.openai_api_key = openaiKey;
      if (anthropicKey && !anthropicKey.includes("••••")) payload.anthropic_api_key = anthropicKey;
      if (geminiKey && !geminiKey.includes("••••")) payload.gemini_api_key = geminiKey;

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSettingsMsg("✅ Settings and API keys updated successfully!");
        fetchSettings();
      } else {
        setSettingsMsg("❌ Failed to save settings.");
      }
    } catch (err: any) {
      setSettingsMsg(`❌ ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const popularTopics = [
    { label: "Popular Classics", query: "" },
    { label: "Sci-Fi & Fantasy", topic: "science-fiction" },
    { label: "Philosophy & Religion", topic: "religion" },
    { label: "History & Biography", topic: "history" },
    { label: "Mystery & Detective", topic: "mystery" },
  ];

  const fetchLocalBooks = async () => {
    setLoadingLocal(true);
    try {
      const res = await fetch("/api/admin/books/list");
      if (res.ok) {
        const data = await res.json();
        setLocalBooks(data.books || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLocal(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchLocalBooks();
      fetchSettings();
      handleSearch("");
    }
  }, [authenticated]);

  const handleSearch = async (queryOverride?: string, topicOverride?: string) => {
    const q = queryOverride !== undefined ? queryOverride : searchQuery;
    setSearching(true);
    setSearchError("");
    try {
      let url = `/api/admin/books/search?q=${encodeURIComponent(q)}`;
      if (topicOverride) {
        url = `/api/admin/books/search?topic=${encodeURIComponent(topicOverride)}`;
      }
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.results) {
        setSearchResults(data.results);
      } else {
        setSearchError(data.error || "Failed to search Gutendex");
      }
    } catch (err: any) {
      setSearchError(err.message || "Network error");
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async (gBook: GutendexBook) => {
    setImportingId(gBook.id);
    setImportMessage(prev => ({ ...prev, [gBook.id]: "Importing..." }));
    try {
      const res = await fetch("/api/admin/books/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gutenbergBook: gBook }),
      });
      const data = await res.json();

      if (res.ok) {
        setImportMessage(prev => ({ ...prev, [gBook.id]: "✅ Imported!" }));
        fetchLocalBooks();
      } else {
        setImportMessage(prev => ({ ...prev, [gBook.id]: `❌ ${data.error || "Import failed"}` }));
      }
    } catch (err: any) {
      setImportMessage(prev => ({ ...prev, [gBook.id]: `❌ ${err.message}` }));
    } finally {
      setImportingId(null);
    }
  };

  const handleSyncChapters = async (bookId: string) => {
    setSyncingBookId(bookId);
    setSyncMessages(prev => ({ ...prev, [bookId]: "Syncing real chapters..." }));
    try {
      const res = await fetch("/api/admin/books/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();

      if (res.ok) {
        setSyncMessages(prev => ({ ...prev, [bookId]: `✅ Synced ${data.chapterCount} chapters!` }));
        fetchLocalBooks();
      } else {
        setSyncMessages(prev => ({ ...prev, [bookId]: `❌ ${data.error || "Sync failed"}` }));
      }
    } catch (err: any) {
      setSyncMessages(prev => ({ ...prev, [bookId]: `❌ ${err.message}` }));
    } finally {
      setSyncingBookId(null);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-2xl border border-primary/20 bg-card overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto backdrop-blur-md">
              <Lock className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="font-serif text-2xl font-bold">Admin Portal</h2>
            <p className="text-xs text-slate-300">
              Restricted area. Please enter your authorization password to continue.
            </p>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary" /> Admin Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="rounded-full px-4 py-5 border-muted-foreground/30 focus-visible:ring-primary"
                  autoFocus
                />
              </div>

              {passError && (
                <p className="text-xs text-destructive font-semibold text-center">{passError}</p>
              )}

              <Button type="submit" className="w-full rounded-full py-5 font-bold shadow-md">
                Authenticate & Access
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/90 via-purple-600 to-indigo-700 text-white p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Library className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Readora Control Center
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Admin Management Portal
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            Ingest public domain books, manage RAG vector search, and configure OpenAI, Anthropic Claude, & Gemini API keys.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md rounded-full bg-muted p-1">
          <TabsTrigger value="books" className="rounded-full text-xs font-bold gap-2">
            <BookOpen className="w-4 h-4" /> Book Ingestion Engine
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full text-xs font-bold gap-2">
            <Settings2 className="w-4 h-4" /> AI & API Configurations
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: BOOK INGESTION */}
        <TabsContent value="books" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Gutendex Live Search & Import (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="rounded-3xl shadow-lg border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Search className="w-5 h-5 text-primary" />
                    Fetch Books from Project Gutenberg
                  </CardTitle>
                  <CardDescription>
                    Search by Title, Author, Topic, or enter exact Gutenberg Book ID (e.g. 1342 for Pride & Prejudice).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
                    <Input
                      placeholder="Enter title, author, or ID (e.g. 84, Frankenstein)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-full px-5 py-6 bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary"
                    />
                    <Button type="submit" disabled={searching} className="rounded-full px-6 py-6 gap-2">
                      {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Search
                    </Button>
                  </form>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {popularTopics.map((t, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs hover:bg-primary/10"
                        onClick={() => {
                          setSearchQuery("");
                          handleSearch("", t.topic);
                        }}
                      >
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Search Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Gutenberg Results ({searchResults.length})
                  </h2>
                </div>

                {searchError && (
                  <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-medium">
                    {searchError}
                  </div>
                )}

                {searching ? (
                  <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                    <p>Querying Gutenberg catalog...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground bg-muted/30 rounded-3xl border border-dashed">
                    No books found. Try searching for a different title or Gutenberg ID!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((gBook) => {
                      const cover = gBook.formats['image/jpeg'];
                      const author = gBook.authors[0]?.name || "Unknown Author";
                      const statusMsg = importMessage[gBook.id];
                      const isImporting = importingId === gBook.id;

                      return (
                        <Card key={gBook.id} className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                          <div className="p-4 flex gap-4 flex-1">
                            <div className="w-20 h-28 relative rounded-lg overflow-hidden bg-muted flex-shrink-0 shadow">
                              {cover ? (
                                <Image src={cover} alt={gBook.title} fill className="object-cover" sizes="80px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] text-muted-foreground">
                                  No Cover
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <Badge variant="secondary" className="text-[10px] mb-1">
                                  ID: #{gBook.id}
                                </Badge>
                                <h3 className="font-bold text-sm line-clamp-2 leading-tight" title={gBook.title}>
                                  {gBook.title}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {author}
                                </p>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[11px] text-muted-foreground">
                                  {(gBook.download_count || 0).toLocaleString()} downloads
                                </span>
                                <Button
                                  size="sm"
                                  disabled={isImporting}
                                  className="rounded-full text-xs gap-1.5 px-3 py-1 h-8"
                                  onClick={() => handleImport(gBook)}
                                >
                                  {isImporting ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Download className="w-3.5 h-3.5" />
                                  )}
                                  Import
                                </Button>
                              </div>
                            </div>
                          </div>
                          {statusMsg && (
                            <div className="px-4 py-2 bg-muted/60 text-xs font-semibold text-center border-t border-border">
                              {statusMsg}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Local Library Status & Sync Manager (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="rounded-3xl shadow-lg border-primary/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Library Sync Manager
                      </CardTitle>
                      <CardDescription>
                        Manage imported books and hydrate real chapters.
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchLocalBooks} className="rounded-full">
                      <RefreshCw className={`w-4 h-4 ${loadingLocal ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingLocal ? (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <p className="text-xs">Loading library...</p>
                    </div>
                  ) : localBooks.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed text-sm">
                      No books imported yet. Use the Gutenberg search on the left to import your first book!
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                      {localBooks.map((book) => {
                        const isSyncing = syncingBookId === book.id;
                        const msg = syncMessages[book.id];
                        const hasRealChapters = (book.chapterCount || 0) > 1;

                        return (
                          <div key={book.id} className="p-3 rounded-2xl border bg-card hover:bg-accent/40 transition-colors flex items-center justify-between gap-3">
                            <div className="w-12 h-16 relative rounded-md overflow-hidden bg-muted flex-shrink-0 shadow-sm">
                              {book.cover_url ? (
                                <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="48px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center p-1 text-[8px] text-center text-muted-foreground">
                                  No Cover
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs truncate" title={book.title}>
                                {book.title}
                              </h4>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {book.authors?.name || "Unknown Author"}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                {hasRealChapters ? (
                                  <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 px-1.5 py-0 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> {book.chapterCount} Chapters
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 px-1.5 py-0 font-medium flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> Pending Sync
                                  </Badge>
                                )}
                              </div>
                              {msg && <p className="text-[10px] font-semibold text-primary mt-1">{msg}</p>}
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <Button
                                size="sm"
                                variant={hasRealChapters ? "outline" : "default"}
                                className="rounded-full text-[11px] px-2.5 py-0.5 h-7 gap-1"
                                disabled={isSyncing}
                                onClick={() => handleSyncChapters(book.id)}
                              >
                                <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                                {hasRealChapters ? "Re-sync" : "Sync Now"}
                              </Button>
                              <Link href={`/read/${book.slug}`} target="_blank" className="text-[10px] text-muted-foreground hover:underline">
                                Preview
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: AI & API KEYS CONFIGURATION */}
        <TabsContent value="settings">
          <Card className="rounded-3xl shadow-xl max-w-3xl border-primary/20">
            <CardHeader className="p-8 border-b">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Cpu className="w-6 h-6 text-primary" />
                AI Provider & API Keys Configuration
              </CardTitle>
              <CardDescription>
                Set up your LLM providers (Anthropic Claude, OpenAI, or Gemini) and RAG vector parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Active AI Provider */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">
                    Primary AI Model Provider
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAiProvider("openai")}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        aiProvider === "openai" ? "border-primary bg-primary/10 font-bold" : "hover:bg-muted"
                      }`}
                    >
                      OpenAI (GPT-4o)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiProvider("anthropic")}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        aiProvider === "anthropic" ? "border-primary bg-primary/10 font-bold" : "hover:bg-muted"
                      }`}
                    >
                      Anthropic Claude
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiProvider("gemini")}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        aiProvider === "gemini" ? "border-primary bg-primary/10 font-bold" : "hover:bg-muted"
                      }`}
                    >
                      Google Gemini
                    </button>
                  </div>
                </div>

                {/* API Keys Inputs */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      OpenAI API Key (`sk-...`)
                    </label>
                    <Input
                      type="password"
                      placeholder="sk-proj-..."
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      className="rounded-xl font-mono text-xs py-5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Anthropic Claude API Key (`sk-ant-...`)
                    </label>
                    <Input
                      type="password"
                      placeholder="sk-ant-..."
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      className="rounded-xl font-mono text-xs py-5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Google Gemini API Key (`AIzaSy...`)
                    </label>
                    <Input
                      type="password"
                      placeholder="AIzaSy..."
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="rounded-xl font-mono text-xs py-5"
                    />
                  </div>
                </div>

                {/* Chunker & Quota Settings */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Semantic Chunk Size (Tokens)
                    </label>
                    <Input
                      type="number"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(e.target.value)}
                      className="rounded-xl py-5"
                    />
                    <p className="text-[10px] text-muted-foreground">Target size per vector chunk (Recommended: 500 - 1000).</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Daily User AI Quota (Queries/Day)
                    </label>
                    <Input
                      type="number"
                      value={userQuota}
                      onChange={(e) => setUserQuota(e.target.value)}
                      className="rounded-xl py-5"
                    />
                    <p className="text-[10px] text-muted-foreground">Maximum Ask-the-Book queries allowed per user per day.</p>
                  </div>
                </div>

                {settingsMsg && (
                  <div className="p-4 rounded-xl text-xs font-semibold bg-muted text-center">
                    {settingsMsg}
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Keys are encrypted & stored in Supabase.
                  </div>
                  <Button type="submit" disabled={savingSettings} className="rounded-full px-8 py-5 gap-2 font-bold">
                    {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Configurations
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
