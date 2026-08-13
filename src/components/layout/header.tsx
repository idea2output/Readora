"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/layout/language-selector";
import { SearchInput } from "@/components/ui/search-input";
import { Anchor, ShieldCheck, GraduationCap, User, LogOut, BookMarked } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 1. Fetch initial user session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    // 2. Subscribe to Auth state changes in real time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Typography-First Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            <Anchor className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg leading-none tracking-tight">Literary Harbor</span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Rights-Aware Library</span>
          </div>
        </Link>

        {/* Primary Navigation */}
        <nav className="hidden lg:flex items-center space-x-5 text-xs font-bold uppercase tracking-wider">
          <Link href="/catalog" className="transition-colors hover:text-primary text-foreground/70">
            Catalog
          </Link>
          <Link href="/academic" className="transition-colors hover:text-primary text-foreground/70 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-primary" /> Academic
          </Link>
          <Link href="/sacred-texts" className="transition-colors hover:text-primary text-foreground/70 flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <BookMarked className="w-3.5 h-3.5" /> Sacred Texts
          </Link>
          <Link href="/collections" className="transition-colors hover:text-primary text-foreground/70">
            Classics
          </Link>
          <Link href="/request" className="transition-colors hover:text-primary text-foreground/70 text-indigo-600 dark:text-indigo-400">
            Request a Book
          </Link>
          <Link href="/rights" className="transition-colors hover:text-primary text-foreground/70 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Rights & Policy
          </Link>
        </nav>

        {/* Right Tools & User Auth State */}
        <div className="flex items-center space-x-2.5">
          <div className="w-full max-w-[160px] lg:max-w-[200px] hidden sm:block">
            <SearchInput placeholder="Search books, DOIs..." />
          </div>

          {/* Top 10 Language Selector (Google Translate Engine) */}
          <LanguageSelector />

          {/* Theme Toggle */}
          <ThemeToggle />

          {!loading && (
            user ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Badge className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full px-3 py-1.5 text-xs font-semibold gap-1.5 transition-all">
                    <User className="w-3.5 h-3.5" />
                    <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                  </Badge>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSignOut}
                  className="rounded-full text-xs h-8 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-xs font-bold px-4 py-2 rounded-full border border-border/80 hover:bg-muted transition-colors">
                  Login
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
