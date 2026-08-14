"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";
import { clearReadingHistory } from "@/lib/analytics";

interface ManageRecommendationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
}

export function ManageRecommendationsModal({ open, onOpenChange, onReset }: ManageRecommendationsModalProps) {
  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    clearReadingHistory();
    setCleared(true);
    setTimeout(() => {
      onReset();
      setCleared(false);
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 border shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-500" /> Recommendation Settings
            </Badge>
          </div>
          <DialogTitle className="font-serif text-2xl font-bold">
            Manage Your Reading Recommendations
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Literary Harbor generates personalized book suggestions entirely on-device based on the categories and titles you explore. Your reading choices are never shared or sold.
          </DialogDescription>
        </DialogHeader>

        {cleared ? (
          <div className="py-6 text-center space-y-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Reading History Reset!</p>
            <p className="text-xs text-muted-foreground">Your recommendations have been cleared.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Privacy Guarantee
              </div>
              <p className="text-muted-foreground leading-normal">
                No sensitive personal, political, or religious data is inferred. Recommendations adapt strictly to your voluntary reading habits.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="rounded-full text-xs">
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="rounded-full text-xs gap-1.5 px-4 text-red-500 border-red-500/30 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Reading History
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
