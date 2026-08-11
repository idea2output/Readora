import { searchBooks } from '@/lib/db/books';
import { getCategories } from '@/lib/db/categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Search | Readora',
  description: 'Search for public domain books, authors, and genres.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const page = parseInt(resolvedSearchParams.page || '1');
  const categoryId = resolvedSearchParams.category || '';

  const { books, count } = await searchBooks(query, page);
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/search" className={!categoryId ? 'text-primary font-bold' : 'hover:text-foreground'}>All Categories</Link>
              </li>
              {categories.map((cat: any) => (
                <li key={cat.id}>
                  <Link href={`/categories/${cat.slug}`} className="hover:text-foreground">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">Search Results</h1>
            <p className="text-muted-foreground">Found {count || 0} books {query && `for "${query}"`}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books?.map((book: any) => (
              <Link key={book.id} href={`/books/${book.slug}`}>
                <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="aspect-[2/3] relative bg-muted">
                    {book.cover_url ? (
                      <Image src={book.cover_url} alt={book.title} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-muted-foreground font-serif">
                        {book.title}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{book.authors?.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
