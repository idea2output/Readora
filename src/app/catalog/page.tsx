import { searchBooks } from '@/lib/db/books';
import { getCategories } from '@/lib/db/categories';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Filter, Layers } from 'lucide-react';

export const metadata = {
  title: 'Catalog | Readora',
  description: 'Explore our complete catalog of public domain books, sacred texts, and classic literature.',
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const page = parseInt(resolvedSearchParams.page || '1');
  const selectedCat = resolvedSearchParams.category || '';

  const { data: books, count } = await searchBooks(query, page, 24);
  const categories = await getCategories();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Catalog Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 p-6 pointer-events-none">
          <BookOpen className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge className="bg-primary/20 text-primary-foreground hover:bg-primary/30 border-0">
            Global Digital Library
          </Badge>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
            Library Catalog
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Browse our complete collection of copyright-free classics, sacred texts, history, philosophy, and timeless literature.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Categories */}
        <aside className="w-full lg:w-64 space-y-6 flex-shrink-0">
          <Card className="rounded-2xl p-6 shadow-sm border">
            <h3 className="font-serif font-bold text-base flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-primary" /> Browse Categories
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link
                  href="/catalog"
                  className={`block px-3 py-2 rounded-xl transition-colors ${
                    !selectedCat ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  All Books ({count || 0})
                </Link>
              </li>
              {categories.map((cat: any) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="block px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        {/* Main Catalog Grid */}
        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                {query ? `Results for "${query}"` : 'All Books'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Showing {books?.length || 0} of {count || 0} titles
              </p>
            </div>
          </div>

          {!books || books.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-muted/30 rounded-3xl border border-dashed">
              No books found in the catalog. Try clearing your search filters or importing books in Admin!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {books.map((book: any) => (
                <Link key={book.id} href={`/books/${book.slug}`}>
                  <Card className="h-full overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all rounded-2xl group flex flex-col">
                    <div className="aspect-[2/3] relative bg-muted overflow-hidden">
                      {book.cover_url ? (
                        <Image
                          src={book.cover_url}
                          alt={book.title}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-muted-foreground font-serif text-sm">
                          {book.title}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {book.authors?.name || 'Unknown Author'}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className="bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">
                          {book.genre || 'Classic'}
                        </span>
                        <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
                          Read →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
