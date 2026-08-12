"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldCheck, RefreshCw, Send, CheckCircle2, AlertTriangle, Layers, BookOpen } from "lucide-react";

export default function RequestBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [doi, setDoi] = useState("");
  const [publisher, setPublisher] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [requestResult, setRequestResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || submitting) return;

    setSubmitting(true);
    setErrorMsg("");
    setRequestResult(null);

    try {
      const res = await fetch("/api/books/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          isbn: isbn.trim(),
          doi: doi.trim(),
          publisher: publisher.trim(),
          userEmail: userEmail.trim(),
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRequestResult(data.request);
      } else {
        setErrorMsg(data.error || "Failed to submit request.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge className="rounded-full px-4 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-0 font-semibold text-xs">
          Rights-Aware Acquisition Engine
        </Badge>
        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
          Request a Book or Publication
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Can't find a book in Literary Harbor? Submit a request and our Rights Engine will search DOAB, OAPEN, OpenStax, Gutenberg, and Standard Ebooks to identify legally reusable editions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Form (7 cols) */}
        <div className="md:col-span-7">
          <Card className="rounded-3xl border shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Book Title *</label>
                <Input
                  required
                  placeholder="e.g. Meditations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl py-5 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Author / Editor *</label>
                <Input
                  required
                  placeholder="e.g. Marcus Aurelius"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="rounded-xl py-5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">ISBN (Optional)</label>
                  <Input
                    placeholder="978-..."
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="rounded-xl py-5 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">DOI (Optional)</label>
                  <Input
                    placeholder="10.1000/..."
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    className="rounded-xl py-5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Your Email (For Notification)</label>
                <Input
                  type="email"
                  placeholder="scholar@university.edu"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="rounded-xl py-5 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Reason / Research Context</label>
                <Input
                  placeholder="Academic research, course reading, personal study..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="rounded-xl py-5 text-xs"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full rounded-full py-6 font-bold text-xs gap-2 shadow-md">
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Request & Search Global Repositories
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Status Panel (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <Card className="rounded-3xl border shadow-md p-6 space-y-4">
            <h3 className="font-serif font-bold text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" /> Safe Rights Verification
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Literary Harbor evaluates edition rights and geographic availability before hosting any requested book. We never scrape or copy unauthorized copyrighted material.
            </p>
          </Card>

          {requestResult && (
            <Card className="rounded-3xl border border-primary/30 shadow-xl p-6 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-bold">
                  Request Received
                </Badge>
                <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                  Status: {requestResult.status}
                </Badge>
              </div>

              <div>
                <h4 className="font-serif font-bold text-lg">{requestResult.title}</h4>
                <p className="text-xs text-muted-foreground">by {requestResult.author}</p>
              </div>

              <div className="space-y-2 border-t pt-3">
                <h5 className="font-bold text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" /> Approved Candidates Found ({requestResult.candidate_sources?.length || 0})
                </h5>
                {(requestResult.candidate_sources || []).map((cand: any, i: number) => (
                  <div key={i} className="p-3 rounded-2xl border bg-muted/30 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>{cand.source}</span>
                      <Badge className={cand.decision === 'AUTO_APPROVED' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}>
                        {cand.decision} ({cand.rightsConfidence}% Confidence)
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{cand.title}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
