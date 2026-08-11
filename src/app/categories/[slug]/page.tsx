import { getCategoryBySlug, getBooksByCategory } from '@/lib/db/categories';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};
  
  return {
    title: `${category.name} Books | Readora`,
    description: `Browse ${category.name} public domain books on Readora.`,
  };
}

export default async function CategoryPage({ params, searchParams }: { params: { slug: string }, searchParams: { page?: string } }) {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    notFound();
  }

  const page = parseInt(searchParams.page || '1');
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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {books?.map((book: any) => (
          <Link key={book.id} href={`/books/${book.slug}`}>
            <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors">
              <div className="aspect-[2/3] relative bg-muted">
                {book.cover_url ? (
                  <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
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
    </div>
  );
}
