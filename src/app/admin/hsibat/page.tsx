"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Download, RefreshCw, CheckCircle2, Clock, BookOpen, Sparkles, Layers, Library, Lock, KeyRound, Settings2, Cpu, Save, ShieldAlert, Users, ShieldCheck, FileText, Ban, Trash2, ToggleLeft, ToggleRight, CreditCard, Building2, History, Globe } from "lucide-react";
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
  admin_status?: string;
  deleted_at?: string | null;
}

interface UserRecord {
  id: string;
  display_name: string;
  created_at: string;
  role: string;
  status: string;
  plan: string;
}

interface AuditLogRecord {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
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

  // Users State
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // AI & Monetization Settings State
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [aiProvider, setAiProvider] = useState("openai");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [resendKey, setResendKey] = useState("");
  const [stripeSecret, setStripeSecret] = useState("");
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
          setMonetizationEnabled(s.monetization_enabled === "true");
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

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch("/api/admin/audit");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg("");
    try {
      const payload: any = {
        monetization_enabled: String(monetizationEnabled),
        ai_provider: aiProvider,
        chunk_size_tokens: parseInt(chunkSize) || 750,
        daily_user_quota: parseInt(userQuota) || 50,
      };

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

  const handleBookAction = async (bookId: string, action: string, status?: string) => {
    try {
      const res = await fetch("/api/admin/books/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, action, status }),
      });
      if (res.ok) {
        fetchLocalBooks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "change_role", role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUserStatusToggle = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "toggle_status", status: newStatus }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
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
      fetchUsers();
      fetchAuditLogs();
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
            <Sparkles className="w-3.5 h-3.5" /> Literary Harbor Master Governance
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Literary Harbor Control Suite
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            Rights case management, takedown review, academic metadata, user roles, subscriptions, & audit logging.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 rounded-full bg-muted p-1 gap-1">
          <TabsTrigger value="books" className="rounded-full text-xs font-bold gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Ingestion & Books
          </TabsTrigger>
          <TabsTrigger value="rights_cases" className="rounded-full text-xs font-bold gap-1.5 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5" /> Takedowns & Cases
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-full text-xs font-bold gap-1.5">
            <Users className="w-3.5 h-3.5" /> Users & Roles
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-full text-xs font-bold gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Subscriptions & Orgs
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-full text-xs font-bold gap-1.5">
            <History className="w-3.5 h-3.5" /> Audit Logs
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full text-xs font-bold gap-1.5">
            <Settings2 className="w-3.5 h-3.5" /> AI & Settings
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INGESTION & BOOK ADMINISTRATION */}
        <TabsContent value="books" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Gutenberg Ingestion Search (7 cols) */}
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

            {/* Book Curation & Soft Delete Manager (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="rounded-3xl shadow-lg border-primary/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Library Curation & Soft Delete
                      </CardTitle>
                      <CardDescription>
                        Publish, block, or soft delete books.
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
                      No books imported yet.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                      {localBooks.map((book) => {
                        const isSyncing = syncingBookId === book.id;
                        const msg = syncMessages[book.id];
                        const isBlocked = book.admin_status === 'blocked';
                        const isSoftDeleted = !!book.deleted_at;

                        return (
                          <div key={book.id} className="p-3.5 rounded-2xl border bg-card flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-3">
                              <div className="w-10 h-14 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                                {book.cover_url && (
                                  <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="40px" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-xs truncate">{book.title}</h4>
                                <p className="text-[11px] text-muted-foreground truncate">{book.authors?.name}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Badge variant={isBlocked ? "destructive" : isSoftDeleted ? "outline" : "default"} className="text-[9px]">
                                    {isBlocked ? "Blocked" : isSoftDeleted ? "Soft Deleted" : "Published"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Curation Controls */}
                            <div className="flex items-center justify-end gap-1.5 pt-2 border-t text-xs">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] rounded-full px-2"
                                onClick={() => handleSyncChapters(book.id)}
                              >
                                <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? "animate-spin" : ""}`} /> Sync
                              </Button>

                              <Button
                                size="sm"
                                variant={isBlocked ? "default" : "outline"}
                                className="h-7 text-[10px] rounded-full px-2"
                                onClick={() => handleBookAction(book.id, "update_status", isBlocked ? "published" : "blocked")}
                              >
                                <Ban className="w-3 h-3 mr-1" /> {isBlocked ? "Unblock" : "Block"}
                              </Button>

                              <Button
                                size="sm"
                                variant={isSoftDeleted ? "outline" : "secondary"}
                                className="h-7 text-[10px] rounded-full px-2 text-destructive"
                                onClick={() => handleBookAction(book.id, isSoftDeleted ? "restore" : "soft_delete")}
                              >
                                <Trash2 className="w-3 h-3 mr-1" /> {isSoftDeleted ? "Restore" : "Soft Delete"}
                              </Button>
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

        {/* TAB: RIGHTS CASES & TAKEDOWN QUEUE */}
        <TabsContent value="rights_cases">
          <Card className="rounded-3xl shadow-xl border-amber-500/20">
            <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-extrabold flex items-center gap-2 text-amber-950 dark:text-amber-200">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Copyright Takedown & Rights Case Queue
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground font-medium">
                  Review formal rights notifications, claims, and counter-notices (Cases format: LH-RIGHTS-2026-XXXXXX).
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-100 border border-amber-300 dark:bg-amber-950/60 dark:border-amber-700 text-xs font-bold text-amber-950 dark:text-amber-100 shadow-sm">
                Notice: When a copyright report is submitted, the title is automatically placed under temporary restriction pending reviewer decision.
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500 text-white font-mono text-[10px]">LH-RIGHTS-2026-849201</Badge>
                      <Badge variant="outline" className="text-[10px]">RECEIVED</Badge>
                    </div>
                    <h4 className="font-bold text-sm mt-1">Claim: Incorrect Public Domain Claim</h4>
                    <p className="text-muted-foreground text-[11px]">Reporter: Jane Doe (rights@publisher.com)</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-1 italic">"1928 modern translation commentary is copyrighted."</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="rounded-full text-xs h-8 px-3">
                      Request Evidence
                    </Button>
                    <Button size="sm" className="rounded-full text-xs h-8 px-3 font-bold bg-green-600 hover:bg-green-700 text-white">
                      Approve & Remove
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: USER & ROLE MANAGEMENT */}
        <TabsContent value="users">
          <Card className="rounded-3xl shadow-xl border-primary/20">
            <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> User & Role Management
                </CardTitle>
                <CardDescription>Search user accounts, assign roles (User, Admin, Org Admin), or suspend accounts.</CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={fetchUsers} className="rounded-full">
                <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {loadingUsers ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                  <span>Loading user accounts...</span>
                </div>
              ) : usersList.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No registered users found.
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {usersList.map((user) => (
                    <div key={user.id} className="p-4 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <h4 className="font-bold text-sm">{user.display_name}</h4>
                        <p className="text-muted-foreground text-[11px] font-mono">{user.id}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{user.plan.toUpperCase()} Plan</Badge>
                          <Badge variant={user.status === 'suspended' ? 'destructive' : 'default'} className="text-[10px]">{user.status}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                          className="bg-muted border rounded-xl px-3 py-1.5 text-xs font-semibold"
                        >
                          <option value="user">User</option>
                          <option value="org_admin">Org Admin</option>
                          <option value="admin">Platform Admin</option>
                        </select>

                        <Button
                          size="sm"
                          variant={user.status === 'suspended' ? 'outline' : 'secondary'}
                          className="rounded-full text-xs h-8 px-3 text-destructive"
                          onClick={() => handleUserStatusToggle(user.id, user.status === 'suspended' ? 'active' : 'suspended')}
                        >
                          {user.status === 'suspended' ? 'Restore' : 'Suspend'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SUBSCRIPTIONS & ORGANIZATIONS */}
        <TabsContent value="subscriptions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-3xl shadow-lg border p-6 space-y-4">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Commercial Subscription Tiers
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stripe commercial plans (Free, Student, Pro, Institutional) are configured and ready.
              </p>
              <div className="space-y-2 pt-2">
                <div className="p-3 rounded-xl border bg-muted/30 flex justify-between text-xs font-semibold">
                  <span>Free Plan</span>
                  <span className="text-muted-foreground">10 AI Queries/Day</span>
                </div>
                <div className="p-3 rounded-xl border bg-muted/30 flex justify-between text-xs font-semibold">
                  <span>Student Plan</span>
                  <span className="text-muted-foreground">$2.99/mo (50 AI Queries/Day)</span>
                </div>
                <div className="p-3 rounded-xl border bg-primary/10 border-primary/20 flex justify-between text-xs font-semibold">
                  <span className="text-primary">Pro Plan</span>
                  <span className="text-primary font-bold">$6.99/mo (Unlimited Claude AI)</span>
                </div>
                <div className="p-3 rounded-xl border bg-muted/30 flex justify-between text-xs font-semibold">
                  <span>Institutional Plan</span>
                  <span className="text-muted-foreground">$49.99/mo (100 Member Seats)</span>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl shadow-lg border p-6 space-y-4">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Institutional Organizations
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Institutional administrators can manage student seats and university allocations at <Link href="/organization" className="text-primary font-bold underline">/organization</Link>.
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: AUDIT LOGS */}
        <TabsContent value="audit">
          <Card className="rounded-3xl shadow-xl border-primary/20">
            <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" /> Administrative Security Audit Logs
                </CardTitle>
                <CardDescription>Immutable log tracking sensitive admin actions.</CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={fetchAuditLogs} className="rounded-full">
                <RefreshCw className={`w-4 h-4 ${loadingAudit ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {loadingAudit ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                  <span>Loading audit logs...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No security audit events recorded yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto font-mono text-xs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl border bg-muted/40 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-primary mr-2">[{log.action}]</span>
                        <span className="text-muted-foreground">{log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}</span>
                        {log.details && (
                          <span className="text-[10px] text-muted-foreground/80 block mt-0.5">{JSON.stringify(log.details)}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: AI & SYSTEM CONFIGURATIONS */}
        <TabsContent value="settings" className="space-y-8">
          {/* Website Languages Management Matrix */}
          <Card className="rounded-3xl shadow-xl max-w-3xl border-primary/20">
            <CardHeader className="p-8 border-b">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                Website Languages Control (Top 10 Global Languages)
              </CardTitle>
              <CardDescription>
                Enable or Disable specific website translation languages for visitors. Disabled languages are immediately hidden from the header language selector.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { code: "en", name: "English", flag: "🇬🇧" },
                  { code: "es", name: "Español", flag: "🇪🇸" },
                  { code: "fr", name: "Français", flag: "🇫🇷" },
                  { code: "de", name: "Deutsch", flag: "🇩🇪" },
                  { code: "zh-CN", name: "中文 (Chinese)", flag: "🇨🇳" },
                  { code: "ar", name: "العربية (Arabic)", flag: "🇸🇦" },
                  { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
                  { code: "pt", name: "Português", flag: "🇧🇷" },
                  { code: "ru", name: "Русский (Russian)", flag: "🇷🇺" },
                  { code: "ja", name: "日本語 (Japanese)", flag: "🇯🇵" },
                ].map((lang) => {
                  const saved = typeof window !== "undefined" ? localStorage.getItem("enabled_website_languages") : null;
                  const currentEnabled: string[] = saved ? JSON.parse(saved) : ["en", "es", "fr", "de", "zh-CN", "ar", "hi", "pt", "ru", "ja"];
                  const isEnabled = currentEnabled.includes(lang.code);

                  const toggleLang = (code: string) => {
                    let updated: string[];
                    if (isEnabled) {
                      updated = currentEnabled.filter((c) => c !== code);
                    } else {
                      updated = [...currentEnabled, code];
                    }
                    if (updated.length === 0) updated = ["en"]; // Always keep English
                    localStorage.setItem("enabled_website_languages", JSON.stringify(updated));
                    window.location.reload();
                  };

                  return (
                    <div key={lang.code} className="p-4 rounded-2xl bg-card border flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-bold text-sm">{lang.name}</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={isEnabled ? "default" : "outline"}
                        onClick={() => toggleLang(lang.code)}
                        className="rounded-full text-xs font-bold gap-1 px-3 py-1"
                      >
                        {isEnabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                        {isEnabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center font-medium pt-2">
                Changes apply instantly across the entire platform and header navigation bar.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl max-w-3xl border-primary/20">
            <CardHeader className="p-8 border-b">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Cpu className="w-6 h-6 text-primary" />
                AI Provider, Monetization, & API Keys Configuration
              </CardTitle>
              <CardDescription>
                Configure LLM providers, toggle commercial subscriptions ON/OFF, and manage API keys.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Monetization Toggle Switch */}
                <div className="p-4 rounded-2xl bg-muted/60 border flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Monetization & Commercial Subscriptions</h4>
                    <p className="text-xs text-muted-foreground">When OFF, all books and AI features are 100% free for everyone. Toggle ON when ready to launch paywalls.</p>
                  </div>
                  <Button
                    type="button"
                    variant={monetizationEnabled ? "default" : "outline"}
                    onClick={() => setMonetizationEnabled(!monetizationEnabled)}
                    className="rounded-full px-5 py-2 font-bold text-xs gap-2"
                  >
                    {monetizationEnabled ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5" />}
                    {monetizationEnabled ? "ON (Commercial)" : "OFF (100% Free)"}
                  </Button>
                </div>

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
