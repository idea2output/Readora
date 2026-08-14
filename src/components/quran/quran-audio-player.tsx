"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Loader2,
  ListMusic,
  Radio,
  SlidersHorizontal,
  X,
  AlertCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ReciterOption {
  id: string;
  qf_id: number | string;
  name: string;
  author_name: string;
  style?: string | null;
  audio_mode?: "ayah_by_ayah" | "full_surah" | "both";
  is_default?: boolean;
}

interface QuranAudioPlayerProps {
  chapterNumber: number;
  chapterName: string;
  totalVerses: number;
  visibleReciters: ReciterOption[];
  onActiveVerseChange?: (verseKey: string | null) => void;
}

export function QuranAudioPlayer({
  chapterNumber,
  chapterName,
  totalVerses,
  visibleReciters,
  onActiveVerseChange,
}: QuranAudioPlayerProps) {
  // Audio state
  const [selectedReciter, setSelectedReciter] = useState<ReciterOption | null>(
    visibleReciters.find((r) => r.is_default) || visibleReciters[0] || null
  );
  const [audioMode, setAudioMode] = useState<"ayah_by_ayah" | "full_surah">("ayah_by_ayah");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [currentVerseIndex, setCurrentVerseIndex] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Audio playlists
  const [ayahAudioList, setAyahAudioList] = useState<{ verse_key: string; url: string }[]>([]);
  const [fullSurahUrl, setFullSurahUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync selected reciter if props update
  useEffect(() => {
    if (visibleReciters.length > 0 && !selectedReciter) {
      setSelectedReciter(visibleReciters.find((r) => r.is_default) || visibleReciters[0]);
    }
  }, [visibleReciters, selectedReciter]);

  // Fetch Audio Data when Reciter, Chapter, or Mode changes
  const fetchAudioData = async () => {
    if (!selectedReciter) return;
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");

    try {
      if (audioMode === "ayah_by_ayah") {
        const res = await fetch(
          `/api/quran?action=ayah_audio&recitation_id=${selectedReciter.qf_id}&chapter=${chapterNumber}`
        );
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = await res.json();
        if (data.audio_files && data.audio_files.length > 0) {
          setAyahAudioList(data.audio_files);
          setHasError(false);
        } else {
          throw new Error("No verse audio files available for this reciter.");
        }
      } else {
        const res = await fetch(
          `/api/quran?action=full_surah_audio&reciter_id=${selectedReciter.qf_id}&chapter=${chapterNumber}`
        );
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = await res.json();
        if (data.audio_file && data.audio_file.audio_url) {
          setFullSurahUrl(data.audio_file.audio_url);
          setHasError(false);
        } else {
          throw new Error("Full Surah audio not available for this reciter.");
        }
      }
    } catch (err: any) {
      console.error("Quran Audio Fetch Error:", err);
      setHasError(true);
      setErrorMessage(err.message || "Failed to load audio stream");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudioData();
    setIsPlaying(false);
  }, [selectedReciter, chapterNumber, audioMode]);

  // Load current audio track into HTMLAudioElement
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.playbackRate = playbackRate;
    audio.volume = isMuted ? 0 : volume;

    let targetUrl = "";
    if (audioMode === "ayah_by_ayah" && ayahAudioList.length > 0) {
      const activeTrack = ayahAudioList[currentVerseIndex - 1];
      if (activeTrack) {
        targetUrl = activeTrack.url;
      }
    } else if (audioMode === "full_surah" && fullSurahUrl) {
      targetUrl = fullSurahUrl;
    }

    if (targetUrl) {
      audio.src = targetUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch((err) => {
          console.error("Audio playback error:", err);
          setIsPlaying(false);
        });
      }
    }

    const handleEnded = () => {
      if (audioMode === "ayah_by_ayah") {
        if (currentVerseIndex < totalVerses) {
          setCurrentVerseIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          setCurrentVerseIndex(1);
        }
      } else {
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      setHasError(true);
      setErrorMessage("Audio stream disconnected or restricted");
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentVerseIndex, ayahAudioList, fullSurahUrl, audioMode]);

  // Notify parent of active verse highlight
  useEffect(() => {
    if (isPlaying && audioMode === "ayah_by_ayah") {
      const activeVerseKey = `${chapterNumber}:${currentVerseIndex}`;
      onActiveVerseChange?.(activeVerseKey);

      // Smooth scroll to verse in DOM
      const elem = document.getElementById(`verse-${chapterNumber}-${currentVerseIndex}`);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      onActiveVerseChange?.(null);
    }
  }, [isPlaying, currentVerseIndex, audioMode, chapterNumber]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        setHasError(true);
        setErrorMessage(err.message || "Failed to start audio playback");
      });
    }
  };

  const handlePrevVerse = () => {
    if (currentVerseIndex > 1) {
      setCurrentVerseIndex((prev) => prev - 1);
    }
  };

  const handleNextVerse = () => {
    if (currentVerseIndex < totalVerses) {
      setCurrentVerseIndex((prev) => prev + 1);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  if (!visibleReciters || visibleReciters.length === 0) {
    return null;
  }

  return (
    <>
      {/* Reader Bar Play Action Button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isPlaying ? "default" : "outline"}
            size="sm"
            className={`rounded-full gap-2 transition-all shadow-sm ${
              isPlaying
                ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                : "border-amber-500/40 text-amber-900 dark:text-amber-300 hover:bg-amber-500/10"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span className="font-semibold text-xs">
              {isPlaying ? "Playing Recitation" : "Listen Audio"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 space-y-4 shadow-2xl rounded-2xl border-amber-500/30" align="start">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-500" />
              <span className="font-serif font-bold text-sm">Quran Audio Settings</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-300">
              Verified CDN
            </Badge>
          </div>

          {/* Reciter Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <ListMusic className="w-3.5 h-3.5 text-amber-500" /> Approved Reciters
            </label>
            <select
              value={selectedReciter?.id}
              onChange={(e) => {
                const found = visibleReciters.find((r) => r.id === e.target.value);
                if (found) setSelectedReciter(found);
              }}
              className="w-full text-xs rounded-xl border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {visibleReciters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.style ? `(${r.style})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" /> Playback Mode
            </label>
            <div className="flex gap-2">
              <Button
                variant={audioMode === "ayah_by_ayah" ? "default" : "outline"}
                size="sm"
                onClick={() => setAudioMode("ayah_by_ayah")}
                className="flex-1 text-xs rounded-xl"
              >
                Ayah by Ayah
              </Button>
              <Button
                variant={audioMode === "full_surah" ? "default" : "outline"}
                size="sm"
                onClick={() => setAudioMode("full_surah")}
                className="flex-1 text-xs rounded-xl"
              >
                Full Surah
              </Button>
            </div>
          </div>

          {/* Quick Play Trigger */}
          <Button
            onClick={togglePlayPause}
            className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            {isPlaying ? "Pause Recitation" : "Start Audio Playback"}
          </Button>
        </PopoverContent>
      </Popover>

      {/* Sticky Mini Player (Appears when audio is active/playing) */}
      {(isPlaying || isLoading || hasError) && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 transition-all duration-300 animate-in slide-in-from-bottom-5">
          <div className="p-4 rounded-3xl bg-slate-950/95 text-white backdrop-blur-md border border-amber-500/40 shadow-2xl space-y-3">
            
            {/* Error Banner */}
            {hasError ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchAudioData} className="h-7 px-2 text-xs text-red-300 hover:text-white">
                  <RotateCcw className="w-3 h-3 mr-1" /> Retry
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div className="truncate space-y-0.5">
                    <h4 className="text-xs font-bold text-white truncate">{selectedReciter?.name}</h4>
                    <p className="text-[11px] text-amber-300/80 truncate">
                      Surah {chapterName} • {audioMode === "ayah_by_ayah" ? `Verse ${currentVerseIndex} of ${totalVerses}` : "Full Chapter"}
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="icon" onClick={() => setIsPlaying(false)} className="h-8 w-8 text-slate-400 hover:text-white rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-1">
              {/* Previous Ayah */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevVerse}
                disabled={audioMode !== "ayah_by_ayah" || currentVerseIndex <= 1}
                className="h-8 w-8 text-slate-300 hover:text-amber-400 rounded-full disabled:opacity-30"
                aria-label="Previous Verse"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              {/* Play/Pause */}
              <Button
                onClick={togglePlayPause}
                disabled={isLoading}
                size="icon"
                className="h-10 w-10 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg transition-transform active:scale-95"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-slate-950" />
                ) : (
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                )}
              </Button>

              {/* Next Ayah */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextVerse}
                disabled={audioMode !== "ayah_by_ayah" || currentVerseIndex >= totalVerses}
                className="h-8 w-8 text-slate-300 hover:text-amber-400 rounded-full disabled:opacity-30"
                aria-label="Next Verse"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* Speed Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-full px-2 py-0.5">
                {[0.75, 1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                      playbackRate === speed ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Mute Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVolumeToggle}
                className="h-8 w-8 text-slate-300 hover:text-white rounded-full"
                aria-label="Toggle Volume"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
