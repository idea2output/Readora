"use client";

import { useState } from "react";
import { ShieldCheck, Lock, AlertTriangle, FileText, Globe, ExternalLink, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SourceRightsProps {
  rightsStatus?: string;
  licenseName?: string;
  sourceName?: string;
  sourceUrl?: string;
  attributionText?: string;
  rightsEvidence?: string;
  countryStatus?: string;
}

export function SourceRightsPanel({
  rightsStatus = "PUBLIC_DOMAIN",
  licenseName = "Public Domain",
  sourceName = "Project Gutenberg",
  sourceUrl,
  attributionText,
  rightsEvidence,
  countryStatus = "ALLOWED",
}: SourceRightsProps) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const getBadgeConfig = () => {
    if (rightsStatus === 'PUBLIC_DOMAIN') {
      return { label: '🟢 Public Domain', bg: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' };
    }
    if (rightsStatus === 'OPEN_LICENSE') {
      return { label: `🟢 ${licenseName}`, bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    }
    if (rightsStatus === 'UNDER_REVIEW') {
      return { label: '🟡 Rights Under Review', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    }
    if (countryStatus === 'RESTRICTED' || countryStatus === 'BLOCKED') {
      return { label: '🔒 Region Restricted', bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
    }
    return { label: '🟢 Rights Verified', bg: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' };
  };

  const badge = getBadgeConfig();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpenDrawer(true)}
        className={`rounded-full text-xs gap-1.5 px-3 py-1 font-bold border ${badge.bg}`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        {badge.label}
      </Button>

      <Dialog open={openDrawer} onOpenChange={setOpenDrawer}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 space-y-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-xl font-bold flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" /> Source & Rights Information
            </DialogTitle>
            <DialogDescription className="text-xs">
              Traceable copyright metadata, license terms, and repository origin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-4 rounded-2xl bg-muted/40 border space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Rights Status:</span>
                <Badge className="font-mono text-[10px]">{rightsStatus}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Applicable License:</span>
                <span className="font-bold">{licenseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Source Repository:</span>
                <span className="font-bold">{sourceName}</span>
              </div>
              {sourceUrl && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Original URL:</span>
                  <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-primary font-bold underline flex items-center gap-1">
                    Source Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {attributionText && (
              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Required Legal Attribution</h4>
                <div className="p-3 rounded-xl border bg-card font-mono text-[11px] leading-relaxed">
                  {attributionText}
                </div>
              </div>
            )}

            {rightsEvidence && (
              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Rights Verification Evidence</h4>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {rightsEvidence}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
