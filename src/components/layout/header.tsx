import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { SearchInput } from "@/components/ui/search-input"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-serif font-bold text-xl tracking-tight hidden sm:inline-block">Readora</span>
          <span className="font-serif font-bold text-xl tracking-tight sm:hidden">R</span>
        </Link>
        <div className="flex flex-1 items-center space-x-4 justify-end md:justify-between">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/catalog"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Catalog
            </Link>
            <Link
              href="/collections"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Collections
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="w-full max-w-[200px] lg:max-w-[300px] hidden sm:block">
              <SearchInput placeholder="Search books, authors..." />
            </div>
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
