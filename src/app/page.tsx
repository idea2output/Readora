import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Sparkles, Building2, Library } from "lucide-react"
import { getFeaturedBooks } from "@/lib/db/books"

export default async function Home() {
  const featuredBooks = await getFeaturedBooks(6) || [];
  
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
              <div className="space-y-4">
                <h1 className="font-serif text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
                  Humanity's Knowledge, <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Freely Accessible.</span>
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto lg:mx-0">
                  Explore thousands of public domain books, beautifully formatted and permanently free for everyone.
                </p>
              </div>
              <div className="w-full max-w-2xl space-y-4 mx-auto lg:mx-0">
                <div className="flex w-full items-center space-x-2">
                  <SearchInput 
                    className="flex-1 text-lg h-12" 
                    placeholder="Search by title, author, or keyword..." 
                  />
                  <Button size="lg" className="h-12 px-8">Search</Button>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
                  <span>Try:</span>
                  <Link href="/search?q=shakespeare" className="hover:text-foreground hover:underline">Shakespeare</Link>
                  <span className="hidden sm:inline">•</span>
                  <Link href="/search?q=philosophy" className="hover:text-foreground hover:underline">Philosophy</Link>
                  <span className="hidden sm:inline">•</span>
                  <Link href="/search?q=austen" className="hover:text-foreground hover:underline">Jane Austen</Link>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/Readora.png"
                width={550}
                height={550}
                alt="Readora Hero"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-contain sm:w-full"
                priority
              />
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
                      <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
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

      {/* AI Intro */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto grid gap-12 lg:grid-cols-2 items-center">
          <div className="flex flex-col justify-center space-y-4 rounded-2xl bg-primary/5 p-8 border">
            <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary w-fit">
              <Sparkles className="mr-2 h-4 w-4" />
              Coming Soon
            </div>
            <h3 className="font-serif text-2xl font-bold">AI Reading Assistant</h3>
            <p className="text-muted-foreground">
              Enhance your understanding of classic literature with our upcoming AI assistant. Get context for archaic words, historical background, and deep structural analysis as you read.
            </p>
            <Button variant="outline" className="w-fit mt-4">Learn More</Button>
          </div>
        </div>
      </section>

      {/* Institutional Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6 mx-auto text-center max-w-3xl space-y-8">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h2 className="font-serif text-3xl font-bold">For Institutions & Educators</h2>
          <p className="text-muted-foreground text-lg">
            The Global Library provides robust access for universities, schools, and research institutions. 
            All our texts are carefully digitized, verified, and structured for academic use.
          </p>
          <Button size="lg" variant="secondary">Institutional Access</Button>
        </div>
      </section>
    </div>
  )
}
