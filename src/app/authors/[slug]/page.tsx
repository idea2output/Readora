import { getAuthorBySlug, getAuthorBooks } from '@/lib/db/authors';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const author = await getAuthorBySlug(resolvedParams.slug);
  if (!author) return {};
  
  return {
    title: `${author.name} | Readora`,
    description: `Read books by ${author.name} on Readora. ${author.biography?.substring(0, 100)}...`,
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const author = await getAuthorBySlug(resolvedParams.slug);
  
  if (!author) {
    notFound();
  }

  const books = await getAuthorBooks(author.id);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="space-y-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="font-serif text-5xl font-bold">{author.name}</h1>
          <p className="text-muted-foreground text-lg">
            {author.birth_year && author.death_year 
              ? `${author.birth_year} – ${author.death_year}` 
              : ''}
          </p>
          <div className="prose dark:prose-invert mx-auto text-left">
            <p className="text-muted-foreground">{author.biography}</p>
          </div>
          {author.wikipedia_url && (
            <a href={author.wikipedia_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-block mt-4">
              Wikipedia Profile →
            </a>
          )}
        </div>

        <div className="pt-12 border-t">
          <h2 className="font-serif text-3xl font-bold mb-8">Books by {author.name}</h2>
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
                    <h3 className="font-bold line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">{book.publication_year}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {(!books || books.length === 0) && (
            <p className="text-muted-foreground">No books available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
