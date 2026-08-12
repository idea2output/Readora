import { getCategories } from '@/lib/db/categories';
import { getFeaturedBooks } from '@/lib/db/books';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Compass } from 'lucide-react';

export const metadata = {
  title: 'Curated Collections | Readora',
  description: 'Explore curated collections of world literature, sacred texts, and historical works.',
};

export default async function CollectionsPage() {
  const categories = await getCategories();
  const featuredBooks = await getFeaturedBooks(8);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge className="bg-white/20 text-white border-0">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Curated Reading
          </Badge>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
            Special Collections
          </h1>
          <p className="text-purple-100 text-sm md:text-base">
            Hand-picked selections of copyright-free literature, sacred manuscripts, scientific landmarks, and world classics.
          </p>
        </div>
      </div>

      {/* Category Collections Grid */}
      <div className="space-y-6">
        <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" /> Topic Collections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}>
              <Card className="rounded-3xl p-6 hover:shadow-xl hover:border-primary/50 transition-all border group bg-card">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                    Collection
                  </Badge>
                  <span className="text-xs text-primary font-bold group-hover:translate-x-1 transition-transform">
                    Explore →
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  Browse classic works, historical texts, and landmark publications categorized under {cat.name}.
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Masterpieces */}
      <div className="space-y-6">
        <h2 className="font-serif text-2xl font-bold">Featured Masterpieces</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {featuredBooks.map((book: any) => (
            <Link key={book.id} href={`/books/${book.slug}`}>
              <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors rounded-2xl">
                <div className="aspect-[2/3] relative bg-muted">
                  {book.cover_url && (
                    <Image
                      src={book.cover_url}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-bold text-sm line-clamp-1">{book.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{book.authors?.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
