"use client";

import { ShieldAlert, Globe, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GeoBannerProps {
  countryCode?: string;
  reason?: string;
}

export function GeoRestrictionBanner({ countryCode = "Your Region", reason }: GeoBannerProps) {
  return (
    <div className="rounded-3xl border border-amber-300 bg-amber-100 dark:bg-amber-950/50 dark:border-amber-700 p-6 text-amber-950 dark:text-amber-100 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Badge className="bg-amber-600 text-white dark:bg-amber-400 dark:text-slate-950 border-0 text-xs font-bold gap-1">
          <Globe className="w-3.5 h-3.5" /> Regional Availability Notice
        </Badge>
        <span className="text-xs font-mono font-bold">[{countryCode}]</span>
      </div>

      <h3 className="font-serif font-extrabold text-lg leading-snug text-amber-950 dark:text-amber-100">
        Publication Unavailable in {countryCode}
      </h3>

      <p className="text-xs font-medium leading-relaxed text-amber-900 dark:text-amber-200">
        {reason || "This title is currently unavailable through Literary Harbor in your region because access to this publication may be subject to local legal, licensing, or regulatory restrictions."}
      </p>

      <div className="text-[11px] font-bold text-amber-950 dark:text-amber-300 pt-2 border-t border-amber-300 dark:border-amber-800 flex items-center justify-between">
        <span>Literary Harbor respects global jurisdiction rights & legal compliance.</span>
        <a href="/rights#geo" className="underline hover:opacity-80">Learn More</a>
      </div>
    </div>
  );
}
