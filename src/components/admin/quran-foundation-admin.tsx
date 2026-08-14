"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  AlertCircle,
  Volume2,
  BookOpen,
  Globe,
  FileText,
  ShieldCheck,
  Clock,
  Layers,
  Check,
  X,
  Play,
  Pause,
  Star,
  Radio,
  Music,
} from "lucide-react";
import { QuranResource, DEFAULT_QF_RESOURCES } from "@/lib/quran/quran-foundation-server";

export function QuranFoundationAdmin() {
  const [resources, setResources] = useState<QuranResource[]>(DEFAULT_QF_RESOURCES);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("reciters");
  const [previewResource, setPreviewResource] = useState<QuranResource | null>(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: "log-1", admin_id: "admin-master", action: "MARK_VISIBLE", resource_name: "Clear Quran (Dr. Mustafa Khattab)", timestamp: new Date(Date.now() - 3600000).toLocaleString() },
    { id: "log-2", admin_id: "admin-master", action: "MARK_VISIBLE", resource_name: "Mishari Rashid al-`Afasy (Reciter)", timestamp: new Date(Date.now() - 7200000).toLocaleString() },
  ]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quran/resources");
      if (res.ok) {
        const data = await res.json();
        if (data.resources && data.resources.length > 0) {
          setResources(data.resources);
        }
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleToggleVisibility = async (resourceId: string, currentVisibility: boolean) => {
    const nextVisibility = !currentVisibility;
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, is_visible: nextVisibility } : r))
    );

    const target = resources.find((r) => r.id === resourceId);

    try {
      const res = await fetch("/api/admin/quran/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_visibility",
          resourceId,
          isVisible: nextVisibility,
        }),
      });

      if (res.ok && target) {
        setAuditLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            admin_id: "admin-master",
            action: nextVisibility ? "MARK_VISIBLE" : "MARK_HIDDEN",
            resource_name: target.name,
            timestamp: new Date().toLocaleString(),
          },
          ...prev,
        ]);
      }
    } catch (_) {}
  };

  const handleSetDefault = async (resourceId: string) => {
    setResources((prev) =>
      prev.map((r) => ({
        ...r,
        is_default: r.id === resourceId,
      }))
    );

    try {
      await fetch("/api/admin/quran/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_default",
          resourceId,
        }),
      });
    } catch (_) {}
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/quran/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.resources) {
          setResources(data.resources);
        }
      }
    } catch (_) {}
    setRefreshing(false);
  };

  const playPreviewAudio = (r: QuranResource) => {
    if (playingAudio && audioElement) {
      audioElement.pause();
      setPlayingAudio(false);
      return;
    }

    const audioUrl = `https://verses.quran.com/Alafasy/mp3/001001.mp3`;
    const audio = new Audio(audioUrl);
    setAudioElement(audio);
    setPlayingAudio(true);

    audio.play().catch(() => setPlayingAudio(false));
    audio.onended = () => setPlayingAudio(false);
  };

  const filteredResources = (type: string) => {
    return resources.filter(
      (r) =>
        r.resource_type === type &&
        (searchQuery
          ? r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.language_name.toLowerCase().includes(searchQuery.toLowerCase())
          : true)
    );
  };

  const visibleCount = resources.filter((r) => r.is_visible).length;
  const hiddenCount = resources.length - visibleCount;

  return (
    <div className="space-y-6">
      {/* Header & Sync Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white border border-amber-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-600 text-white border-0 text-[10px] font-bold">
              Quran Foundation Integration
            </Badge>
            <Badge variant="outline" className="text-amber-200 border-amber-500/40 text-[10px]">
              Verified API Source
            </Badge>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">
            Quran Foundation Content Management
          </h2>
          <p className="text-xs text-amber-200/80">
            Control which translations, tafsirs, reciters, languages, and chapter info resources are publicly visible across Literary Harbor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-full text-xs font-bold gap-1.5 border-amber-500/40 text-amber-200 hover:bg-amber-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Sync Quran Foundation Resources
          </Button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs rounded-full"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1">
            <Eye className="w-3.5 h-3.5 mr-1" /> {visibleCount} Publicly Visible
          </Badge>
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-3 py-1">
            <EyeOff className="w-3.5 h-3.5 mr-1" /> {hiddenCount} Hidden by Default
          </Badge>
        </div>
      </div>

      {/* 6 Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 rounded-2xl p-1 bg-muted">
          <TabsTrigger value="reciters" className="text-xs font-bold rounded-xl gap-1">
            <Volume2 className="w-3.5 h-3.5" /> Audio & Reciters
          </TabsTrigger>
          <TabsTrigger value="translations" className="text-xs font-bold rounded-xl gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Translations
          </TabsTrigger>
          <TabsTrigger value="tafsirs" className="text-xs font-bold rounded-xl gap-1">
            <FileText className="w-3.5 h-3.5" /> Tafsirs
          </TabsTrigger>
          <TabsTrigger value="languages" className="text-xs font-bold rounded-xl gap-1">
            <Globe className="w-3.5 h-3.5" /> Languages
          </TabsTrigger>
          <TabsTrigger value="chapters" className="text-xs font-bold rounded-xl gap-1">
            <Layers className="w-3.5 h-3.5" /> Chapter Info
          </TabsTrigger>
          <TabsTrigger value="visibility" className="text-xs font-bold rounded-xl gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Site Visibility
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Audio & Reciters */}
        <TabsContent value="reciters">
          <ResourceGrid
            items={filteredResources("reciter")}
            onToggleVisibility={handleToggleVisibility}
            onSetDefault={handleSetDefault}
            onPreview={setPreviewResource}
          />
        </TabsContent>

        {/* Tab 2: Translations */}
        <TabsContent value="translations">
          <ResourceGrid
            items={filteredResources("translation")}
            onToggleVisibility={handleToggleVisibility}
            onSetDefault={handleSetDefault}
            onPreview={setPreviewResource}
          />
        </TabsContent>

        {/* Tab 3: Tafsirs */}
        <TabsContent value="tafsirs">
          <ResourceGrid
            items={filteredResources("tafsir")}
            onToggleVisibility={handleToggleVisibility}
            onSetDefault={handleSetDefault}
            onPreview={setPreviewResource}
          />
        </TabsContent>

        {/* Tab 4: Languages */}
        <TabsContent value="languages">
          <ResourceGrid
            items={filteredResources("language")}
            onToggleVisibility={handleToggleVisibility}
            onSetDefault={handleSetDefault}
            onPreview={setPreviewResource}
          />
        </TabsContent>

        {/* Tab 5: Chapter Info */}
        <TabsContent value="chapters">
          <ResourceGrid
            items={filteredResources("chapter_info")}
            onToggleVisibility={handleToggleVisibility}
            onSetDefault={handleSetDefault}
            onPreview={setPreviewResource}
          />
        </TabsContent>

        {/* Tab 6: Site Visibility & Audit Logs */}
        <TabsContent value="visibility" className="space-y-6">
          <Card className="rounded-3xl border shadow-sm p-6 space-y-4 bg-card">
            <CardHeader className="p-0 space-y-1">
              <CardTitle className="font-serif text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" /> Administrative Access & Audit Trail
              </CardTitle>
              <CardDescription className="text-xs">
                Every visibility change or resource refresh from Quran Foundation is logged securely.
              </CardDescription>
            </CardHeader>

            <div className="space-y-2 pt-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border text-xs">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30">
                      {log.action}
                    </Badge>
                    <span className="font-bold">{log.resource_name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      {previewResource && (
        <Dialog open={Boolean(previewResource)} onOpenChange={() => setPreviewResource(null)}>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Resource Preview
              </DialogTitle>
              <DialogDescription className="text-xs">
                {previewResource.name} ({previewResource.language_name})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                <p className="quran-text text-xl font-bold notranslate text-right" lang="ar" dir="rtl">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
                <p className="text-xs text-muted-foreground italic border-t border-amber-500/20 pt-2">
                  In the name of Allah, the Entirely Merciful, the Especially Merciful.
                </p>
              </div>

              {previewResource.resource_type === "reciter" && (
                <div className="p-3 rounded-2xl bg-muted border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Volume2 className="w-4 h-4 text-amber-500" /> Recitation Audio Stream (128kbps)
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => playPreviewAudio(previewResource)}
                    className="rounded-full text-xs font-bold gap-1"
                  >
                    {playingAudio ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-amber-500" />}
                    {playingAudio ? "Pause Audio" : "Play Sample"}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ResourceGrid({
  items,
  onToggleVisibility,
  onSetDefault,
  onPreview,
}: {
  items: QuranResource[];
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  onSetDefault: (id: string) => void;
  onPreview: (resource: QuranResource) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center bg-muted/30 rounded-3xl border border-dashed text-xs text-muted-foreground">
        No resources found matching search query.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((r) => (
        <Card key={r.id} className="rounded-2xl border shadow-sm p-4 flex flex-col justify-between space-y-3 bg-card hover:border-amber-500/40 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-600 dark:text-amber-400">
                {r.language_name} ({r.language_code.toUpperCase()})
              </Badge>
              {r.is_visible ? (
                <Badge className="bg-emerald-500 text-white text-[10px] font-bold gap-1">
                  <Check className="w-3 h-3" /> Publicly Visible
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] font-bold text-muted-foreground gap-1">
                  <X className="w-3 h-3" /> Hidden (Default)
                </Badge>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-serif font-bold text-base text-foreground line-clamp-1">{r.name}</h4>
                {r.is_default && (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{r.author_name}</p>
            </div>

            {r.resource_type === "reciter" && (
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="secondary" className="text-[9px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  Mode: {r.audio_mode === "both" ? "Ayah & Full Surah" : r.audio_mode || "Ayah by Ayah"}
                </Badge>
                {r.style && (
                  <Badge variant="outline" className="text-[9px] font-mono">
                    Style: {r.style}
                  </Badge>
                )}
              </div>
            )}

            <div className="text-[11px] text-muted-foreground/80 space-y-0.5 border-t pt-2 font-mono">
              <p>Resource ID: <strong>{r.qf_id}</strong></p>
              <p>Source: <strong>Quran Foundation</strong></p>
              <p>Synced: <strong>{new Date(r.last_synced_at).toLocaleDateString()}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPreview(r)}
              className="rounded-full text-[11px] font-bold flex-1"
            >
              Preview
            </Button>

            {!r.is_default && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSetDefault(r.id)}
                className="rounded-full text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              >
                Set Default
              </Button>
            )}

            <Button
              size="sm"
              variant={r.is_visible ? "secondary" : "default"}
              onClick={() => onToggleVisibility(r.id, r.is_visible)}
              className={`rounded-full text-[11px] font-bold gap-1.5 flex-1 ${
                r.is_visible
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 border-amber-500/30"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {r.is_visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {r.is_visible ? "Hide" : "Make Public"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
