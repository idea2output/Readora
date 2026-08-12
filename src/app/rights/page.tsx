"use client";

import { useState } from "react";
import { ShieldCheck, FileText, Globe, Scale, Lock, HeartHandshake, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportCopyrightModal } from "@/components/rights/report-modal";

export default function RightsPolicyPage() {
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge className="rounded-full px-4 py-1 bg-green-500/10 text-green-600 dark:text-green-400 border-0 font-semibold text-xs gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Rights Governance Policy
        </Badge>
        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
          Copyright, Rights & Legal Policy
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Literary Harbor is a global, rights-aware digital library. Copyright compliance comes before content acquisition. Download availability does not mean redistribution permission.
        </p>
        <Button onClick={() => setReportModalOpen(true)} variant="outline" className="rounded-full px-6 py-5 text-xs font-bold gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
          <AlertTriangle className="w-4 h-4" /> Report Copyright or Rights Issue
        </Button>
      </div>

      {/* Core Rights Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border p-6 space-y-3">
          <h3 className="font-serif font-bold text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" /> Public Domain Policy
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Works are evaluated for public-domain status based on publication dates, author death dates (+70 years rule), and applicable national jurisdiction. Unknown status defaults safely to restricted review.
          </p>
        </Card>

        <Card className="rounded-3xl border p-6 space-y-3">
          <h3 className="font-serif font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Open Access & Creative Commons
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Academic books from DOAB, OAPEN, and OpenStax retain their exact Creative Commons licenses (CC BY, CC BY-SA, CC BY-NC). Commercial and derivative restrictions are programmatically enforced.
          </p>
        </Card>

        <Card className="rounded-3xl border p-6 space-y-3">
          <h3 className="font-serif font-bold text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-500" /> Geographic Restrictions Policy
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Copyright status varies by country. A work public-domain in the USA may remain protected in Germany or the UK. Literary Harbor applies country-specific access rules rather than global deletion.
          </p>
        </Card>

        <Card className="rounded-3xl border p-6 space-y-3">
          <h3 className="font-serif font-bold text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" /> Takedown & Case Procedure
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Submitting a copyright report automatically generates a traceable case (<span className="font-mono">LH-RIGHTS-2026-XXXXXX</span>) and places the publication under temporary restriction pending legal review.
          </p>
        </Card>
      </div>

      {/* Designated Rights Agent Notice */}
      <Card className="rounded-3xl border bg-muted/30 p-8 space-y-4">
        <h3 className="font-serif font-bold text-xl">Designated Copyright Agent</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Notifications of claimed copyright infringement should be submitted via our online reporting form or sent to our Designated Rights Agent:
        </p>
        <div className="font-mono text-xs space-y-1 p-4 rounded-2xl bg-card border">
          <p className="font-bold text-foreground">Literary Harbor Rights & Governance Office</p>
          <p>Email: rights@literaryharbor.org</p>
          <p>Address: Legal Affairs Office, Literary Harbor Digital Library</p>
        </div>
      </Card>

      <ReportCopyrightModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}
