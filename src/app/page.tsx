import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Sparkles, Building2, Library, Layers } from "lucide-react"
import { getFeaturedBooks, getBooksByCategory, getTotalBooksCount } from "@/lib/db/books"

export default async function Home() {
  const featuredBooks = await getFeaturedBooks(6) || [];
  const sacredTexts = await getBooksByCategory('sacred-texts-religion', 6) || [];
  const totalBooksCount = await getTotalBooksCount();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden bg-background">
        {/* Vibrant Glow Backgrounds */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/20 blur-[100px] pointer-events-none" />
        
        <div className="container relative px-4 md:px-6 mx-auto z-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px] items-center">
            <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
              
              {/* Live Live Ingestion Worker Counter Badge */}
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 via-primary/10 to-indigo-500/10 border border-primary/30 text-xs font-bold text-foreground shadow-md backdrop-blur">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-sm font-extrabold text-primary">{totalBooksCount.toLocaleString()}</span> books and Growing...
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="font-serif text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
                  Humanity's Knowledge, <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Freely Accessible.</span>
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto lg:mx-0 font-medium">
                  Explore thousands of public domain books, academic monographs, and sacred texts — beautifully formatted and permanently free for everyone.
                </p>
              </div>
              <div className="w-full max-w-2xl space-y-4 mx-auto lg:mx-0">
                <div className="flex w-full items-center space-x-2">
                  <SearchInput 
                    className="flex-1 text-lg h-12 shadow-md rounded-full" 
                    placeholder="Search by title, author, or keyword..." 
                  />
                  <Button size="lg" className="h-12 px-8 rounded-full shadow-md font-bold">Search</Button>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
                  <span>Try:</span>
                  <Link href="/search?q=shakespeare" className="hover:text-foreground hover:underline font-semibold">Shakespeare</Link>
                  <span className="hidden sm:inline">•</span>
                  <Link href="/search?q=philosophy" className="hover:text-foreground hover:underline font-semibold">Philosophy</Link>
                  <span className="hidden sm:inline">•</span>
                  <Link href="/sacred-texts" className="hover:text-foreground hover:underline font-semibold text-amber-600 dark:text-amber-400">Sacred Texts</Link>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-2xl border border-white/10 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Library className="w-48 h-48" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-xs font-semibold text-primary-foreground border border-primary/30">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Rights-Aware Open Library
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {totalBooksCount.toLocaleString()} Available
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold tracking-tight">Literary Harbor</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Preserving global literature, peer-reviewed monographs, open textbooks, and sacred manuscripts under verified rights governance.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <span className="font-bold text-primary block">Public Domain</span>
                    <span className="text-[10px] text-slate-400">Classics & Literature</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <span className="font-bold text-indigo-400 block">Open Academic</span>
                    <span className="text-[10px] text-slate-400">DOAB, OAPEN, OpenStax</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="w-full py-12 md:py-16">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-bold tracking-tight">Featured Additions</h2>
            <Link href="/search" className="text-sm font-medium text-primary hover:underline">
              View all books →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {featuredBooks.length > 0 ? featuredBooks.map((book: any) => (
              <Link key={book.id} href={`/books/${book.slug}`}>
                <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="aspect-[2/3] relative bg-muted">
                    {book.cover_url ? (
                      <Image src={book.cover_url} alt={book.title} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-serif p-4 text-center text-sm">
                        {book.title}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold line-clamp-1 text-sm">{book.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{book.authors?.name}</p>
                  </CardContent>
                </Card>
              </Link>
            )) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No featured books available yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sacred Texts & Religion Section */}
      <section className="w-full py-12 md:py-16 bg-muted/10">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-bold tracking-tight">Sacred Texts & Religion</h2>
            <Link href="/sacred-texts" className="text-sm font-medium text-primary hover:underline">
              View sacred texts portal →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {sacredTexts.length > 0 ? sacredTexts.map((book: any) => (
              <Link key={book.id} href={`/books/${book.slug}`}>
                <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="aspect-[2/3] relative bg-muted">
                    {book.cover_url ? (
                      <Image src={book.cover_url} alt={book.title} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-serif p-4 text-center text-sm">
                        {book.title}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold line-clamp-1 text-sm">{book.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{book.authors?.name}</p>
                  </CardContent>
                </Card>
              </Link>
            )) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Explore global sacred texts in our dedicated <Link href="/sacred-texts" className="text-primary underline">Sacred Texts Portal</Link>.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="w-full py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="font-serif text-3xl font-bold tracking-tight mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {['Fiction - Classics', 'Fiction - Sci-Fi', 'Philosophy', 'History', 'Poetry'].map((cat) => (
              <Link key={cat} href={`/categories/${cat.toLowerCase().replace(/[^a-z]+/g, '-')}`}>
                <Button variant="outline" className="w-full h-auto py-4 justify-start font-serif font-bold text-lg hover:bg-primary/10 hover:text-primary transition-all">
                  <BookOpen className="mr-3 h-5 w-5 opacity-70" />
                  {cat}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto text-center max-w-3xl space-y-8">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h2 className="font-serif text-3xl font-bold">For Institutions & Educators</h2>
          <p className="text-muted-foreground text-lg">
            Literary Harbor provides robust access for universities, schools, and research institutions. 
            All our texts are carefully digitized, verified, and structured for academic use.
          </p>
          <Button size="lg" variant="secondary">Institutional Access</Button>
        </div>
      </section>
    </div>
  )
}
