"use client";

import { ShieldAlert, Globe, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GeoBannerProps {
  countryCode?: string;
  reason?: string;
}

export function GeoRestrictionBanner({ countryCode = "Your Region", reason }: GeoBannerProps) {
  return (
    <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-900 dark:text-amber-200 space-y-3">
      <div className="flex items-center gap-2">
        <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-200 border-0 text-xs font-bold gap-1">
          <Globe className="w-3.5 h-3.5" /> Regional Availability Notice
        </Badge>
        <span className="text-xs font-mono">[{countryCode}]</span>
      </div>

      <h3 className="font-serif font-bold text-lg leading-snug">
        Publication Unavailable in {countryCode}
      </h3>

      <p className="text-xs leading-relaxed opacity-90">
        {reason || "This title is currently unavailable through Literary Harbor in your region because access to this publication may be subject to local legal, licensing, or regulatory restrictions."}
      </p>

      <div className="text-[11px] font-semibold text-amber-800/80 dark:text-amber-300/80 pt-2 border-t border-amber-500/20 flex items-center justify-between">
        <span>Literary Harbor respects global jurisdiction rights & legal compliance.</span>
        <a href="/rights#geo" className="underline hover:opacity-80">Learn More</a>
      </div>
    </div>
  );
}
