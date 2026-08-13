import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Building2 } from "lucide-react"
import { getFeaturedBooks, getBooksByCategory, getTotalBooksCount } from "@/lib/db/books"
import { FullHeroCarousel } from "@/components/home/full-hero-carousel"

export default async function Home() {
  const featuredBooks = await getFeaturedBooks(6) || [];
  const sacredTexts = await getBooksByCategory('sacred-texts-religion', 6) || [];
  const totalBooksCount = await getTotalBooksCount();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Full-Screen 4-Page Hero Carousel */}
      <FullHeroCarousel totalBooksCount={totalBooksCount} />

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
