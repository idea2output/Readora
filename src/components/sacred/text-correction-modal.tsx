"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileEdit, CheckCircle2, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface TextCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId?: string;
  bookTitle?: string;
}

export function TextCorrectionModal({ isOpen, onClose, bookId, bookTitle = "Sacred Publication" }: TextCorrectionModalProps) {
  const [email, setEmail] = useState("");
  const [chapterNum, setChapterNum] = useState("");
  const [verseNum, setVerseNum] = useState("");
  const [correctionType, setCorrectionType] = useState("TYPO_CORRECTION");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [caseNum, setCaseNum] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !description.trim() || submitting) return;

    setSubmitting(true);
    const newCaseNum = `LH-TEXT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await supabase.from("text_corrections").insert({
        case_number: newCaseNum,
        book_id: bookId || null,
        chapter_number: chapterNum ? parseInt(chapterNum) : null,
        verse_number: verseNum || null,
        correction_type: correctionType,
        reported_by_email: email.trim(),
        description: description.trim(),
        status: "PENDING",
      });

      setCaseNum(newCaseNum);
    } catch (_) {
      setCaseNum(newCaseNum);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
            <FileEdit className="w-6 h-6" />
          </div>
          <DialogTitle className="font-serif text-2xl font-bold">Report Text / Metadata Correction</DialogTitle>
          <DialogDescription className="text-xs">
            Report typos, corrupted text, wrong verse numbering, or translation attribution issues for <strong>{bookTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        {caseNum ? (
          <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
            <h4 className="font-bold text-sm text-green-800 dark:text-green-300">Correction Report Logged</h4>
            <Badge className="bg-amber-600 text-white font-mono text-xs px-3 py-1">{caseNum}</Badge>
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              Thank you for helping maintain textual precision. Our editorial team will review the original source edition.
            </p>
            <Button onClick={onClose} className="rounded-full px-6 text-xs font-bold mt-2">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Correction Type *</label>
              <select
                value={correctionType}
                onChange={(e) => setCorrectionType(e.target.value)}
                className="w-full rounded-xl border bg-background p-3 text-xs font-medium"
              >
                <option value="TYPO_CORRECTION">Typo / Spelling Error</option>
                <option value="CORRUPTED_TEXT">Corrupted Text / Formatting</option>
                <option value="WRONG_VERSE_NUMBER">Incorrect Verse or Chapter Number</option>
                <option value="TRANSLATION_ATTRIBUTION">Incorrect Translation Attribution</option>
                <option value="METADATA_FIX">Metadata / Edition Fix</option>
                <option value="OTHER">Other Textual Issue</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Chapter #</label>
                <Input
                  placeholder="e.g. 1"
                  value={chapterNum}
                  onChange={(e) => setChapterNum(e.target.value)}
                  className="rounded-xl py-4 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Verse #</label>
                <Input
                  placeholder="e.g. 25"
                  value={verseNum}
                  onChange={(e) => setVerseNum(e.target.value)}
                  className="rounded-xl py-4 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Your Email Address *</label>
              <Input
                required
                type="email"
                placeholder="editor@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl py-4 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Correction Details *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the text error and expected correct reading..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border bg-background p-3 text-xs"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full rounded-full py-5 text-xs font-bold gap-2 shadow-md bg-amber-700 hover:bg-amber-800 text-white">
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileEdit className="w-4 h-4" />}
              Submit Text Correction Report
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
