import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchInput } from "@/components/ui/search-input";
import { Anchor, ShieldCheck, BookOpen, GraduationCap } from "lucide-react";

export function Header() {
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
        <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider">
          <Link href="/catalog" className="transition-colors hover:text-primary text-foreground/70">
            Catalog
          </Link>
          <Link href="/academic" className="transition-colors hover:text-primary text-foreground/70 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-primary" /> Academic
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

        {/* Right Tools */}
        <div className="flex items-center space-x-3">
          <div className="w-full max-w-[180px] lg:max-w-[240px] hidden sm:block">
            <SearchInput placeholder="Search books, DOIs..." />
          </div>
          <ThemeToggle />
          <Link href="/login" className="text-xs font-bold px-4 py-2 rounded-full border border-border/80 hover:bg-muted transition-colors">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
