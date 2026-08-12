"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, FileText, Download } from "lucide-react";

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    title: string;
    author: string;
    publisher?: string;
    year?: number;
    doi?: string;
    isbn?: string;
    url?: string;
  };
}

export function CitationModal({ isOpen, onClose, book }: CitationModalProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const authorName = book.author || "Unknown Author";
  const year = book.year || new Date().getFullYear();
  const publisher = book.publisher || "Literary Harbor Press";
  const doiStr = book.doi ? ` https://doi.org/${book.doi}` : "";

  const citations: Record<string, string> = {
    APA: `${authorName}. (${year}). ${book.title}.${publisher}.${doiStr}`,
    MLA: `${authorName}. ${book.title}. ${publisher}, ${year}.${doiStr}`,
    Chicago: `${authorName}. ${book.title}. ${publisher}, ${year}.${doiStr}`,
    Harvard: `${authorName} (${year}) ${book.title}. ${publisher}.${doiStr}`,
    BibTeX: `@book{${book.author.split(' ').pop()?.toLowerCase() || 'book'}${year},\n  author = {${authorName}},\n  title = {${book.title}},\n  publisher = {${publisher}},\n  year = {${year}},\n  doi = {${book.doi || ''}}\n}`,
    RIS: `TY  - BOOK\nAU  - ${authorName}\nTI  - ${book.title}\nPY  - ${year}\nPB  - ${publisher}\nDO  - ${book.doi || ''}\nER  -`,
  };

  const handleCopy = (format: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl rounded-3xl p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="font-serif text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Cite this Publication
          </DialogTitle>
          <DialogDescription className="text-xs">
            Generate scholarly academic citations for <span className="font-bold text-foreground">"{book.title}"</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {Object.entries(citations).map(([format, text]) => (
            <div key={format} className="p-3.5 rounded-2xl border bg-muted/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-primary">{format} Format</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs rounded-full gap-1 px-3"
                  onClick={() => handleCopy(format, text)}
                >
                  {copiedFormat === format ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedFormat === format ? "Copied" : "Copy Citation"}
                </Button>
              </div>
              <p className="font-mono text-[11px] leading-relaxed select-all text-muted-foreground whitespace-pre-wrap break-all">
                {text}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
