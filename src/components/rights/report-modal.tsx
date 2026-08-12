"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Send, CheckCircle2, RefreshCw } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId?: string;
  bookTitle?: string;
}

export function ReportCopyrightModal({ isOpen, onClose, bookId, bookTitle }: ReportModalProps) {
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reporterOrg, setReporterOrg] = useState("");
  const [relationship, setRelationship] = useState("Copyright Holder");
  const [claimType, setClaimType] = useState("Incorrect Public Domain Claim");
  const [explanation, setExplanation] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !reporterEmail.trim() || !explanation.trim() || submitting) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/rights/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          reporterName: reporterName.trim(),
          reporterEmail: reporterEmail.trim(),
          reporterOrg: reporterOrg.trim(),
          relationship,
          claimType,
          explanation: explanation.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCaseNumber(data.caseNumber);
      } else {
        setErrorMsg(data.error || "Report submission failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="font-serif text-xl font-bold flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-5 h-5" /> Report Copyright or Rights Issue
          </DialogTitle>
          <DialogDescription className="text-xs">
            Submit a formal rights notification regarding {bookTitle ? <span className="font-bold text-foreground">"{bookTitle}"</span> : "a publication"}.
          </DialogDescription>
        </DialogHeader>

        {caseNumber ? (
          <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
            <h4 className="font-bold text-base text-green-800 dark:text-green-300">Notice Received</h4>
            <Badge className="bg-green-600 text-white font-mono py-1 px-3">
              Case Number: {caseNumber}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Our legal rights team has received your claim. A case record has been opened and access is being reviewed.
            </p>
            <Button onClick={onClose} className="rounded-full px-6 text-xs font-bold mt-2">
              Close Window
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold">Full Name *</label>
                <Input
                  required
                  placeholder="Jane Doe"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="rounded-xl py-4 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="rights@publisher.com"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="rounded-xl py-4 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Organization (Optional)</label>
                <Input
                  placeholder="Publisher / Law Firm"
                  value={reporterOrg}
                  onChange={(e) => setReporterOrg(e.target.value)}
                  className="rounded-xl py-4 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold">Relationship to Work</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-muted border rounded-xl px-3 py-2 text-xs font-medium"
                >
                  <option value="Copyright Holder">Copyright Holder</option>
                  <option value="Authorized Representative">Authorized Representative</option>
                  <option value="Publisher">Publisher</option>
                  <option value="Public Reader">Public Reader</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold">Claim Type</label>
              <select
                value={claimType}
                onChange={(e) => setClaimType(e.target.value)}
                className="w-full bg-muted border rounded-xl px-3 py-2 text-xs font-medium"
              >
                <option value="Incorrect Public Domain Claim">Work is incorrectly marked Public Domain</option>
                <option value="Incorrect License">Stated License is incorrect</option>
                <option value="Contains Copyrighted Text">Contains unauthorized copyrighted material</option>
                <option value="Geographic Restriction Missing">Geographic restriction missing for jurisdiction</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold">Explanation & Legal Basis *</label>
              <textarea
                required
                rows={3}
                placeholder="Provide detailed legal basis, original publication dates, and evidence..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full rounded-xl border bg-card p-3 text-xs focus:ring-primary"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-destructive">{errorMsg}</p>
            )}

            <Button type="submit" disabled={submitting} className="w-full rounded-full py-5 text-xs font-bold gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Formal Rights Report
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
