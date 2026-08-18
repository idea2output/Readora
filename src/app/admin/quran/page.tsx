"use client";

import { useState, useEffect } from "react";
import { Lock, KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from 'next/dynamic';

const QuranFoundationAdmin = dynamic(
  () => import('@/components/admin/quran-foundation-admin').then((m) => m.QuranFoundationAdmin),
  { ssr: false, loading: () => <div className="p-8 text-center text-sm font-medium text-muted-foreground">Loading Quran Foundation Admin...</div> }
);

export default function AdminQuranPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("readora_admin_auth");
    if (saved === "hsibat") {
      setAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === "hsibat") {
      sessionStorage.setItem("readora_admin_auth", "hsibat");
      setAuthenticated(true);
      setPassError("");
    } else {
      setPassError("Incorrect authorization key.");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-2xl border border-primary/20 bg-card overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto backdrop-blur-md">
              <Lock className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="font-serif text-2xl font-bold">Quran Foundation Admin Area</h2>
            <p className="text-xs text-slate-300">
              Restricted area. Please enter your admin password to manage Quran Foundation resources.
            </p>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary" /> Admin Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="rounded-full px-4 py-5 border-muted-foreground/30 focus-visible:ring-primary"
                  autoFocus
                />
              </div>

              {passError && (
                <p className="text-xs text-destructive font-semibold text-center">{passError}</p>
              )}

              <Button type="submit" className="w-full rounded-full font-bold py-5 bg-primary hover:bg-primary/90 text-primary-foreground">
                Authorize Access
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <QuranFoundationAdmin />
    </div>
  );
}
