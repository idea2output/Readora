import { getCategoryBySlug, getBooksByCategory } from '@/lib/db/categories';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const category = await getCategoryBySlug(resolvedParams.slug);
  if (!category) return {};
  
  return {
    title: `${category.name} Books | Readora`,
    description: `Browse ${category.name} public domain books on Readora.`,
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const category = await getCategoryBySlug(resolvedParams.slug);
  
  if (!category) {
    notFound();
  }

  const page = parseInt(resolvedSearchParams.page || '1');
  const { books, count } = await getBooksByCategory(category.id, page);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-serif text-4xl font-bold mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-xl text-muted-foreground max-w-2xl">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-4">{count || 0} books found</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {books?.map((book: any) => (
          <Link key={book.id} href={`/books/${book.slug}`}>
            <Card className="h-full overflow-hidden hover:border-primary/50 transition-all rounded-xl border group flex flex-col">
              <div className="aspect-[2/3] relative bg-muted overflow-hidden">
                {book.cover_url ? (
                  <Image src={book.cover_url} alt={book.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-muted-foreground font-serif text-xs">
                    {book.title}
                  </div>
                )}
              </div>
              <CardContent className="p-2.5 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-xs line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h3>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{book.authors?.name || "Unknown Author"}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
