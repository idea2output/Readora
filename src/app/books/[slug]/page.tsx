import { getBookBySlug } from '@/lib/db/books';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const book = await getBookBySlug(params.slug);
  if (!book) return {};
  
  return {
    title: `${book.title} by ${book.authors?.name} | Readora`,
    description: book.description || `Read ${book.title} by ${book.authors?.name} for free on Readora.`,
    openGraph: {
      title: book.title,
      description: book.description,
      images: book.cover_url ? [book.cover_url] : [],
    }
  };
}

export default async function BookPage({ params }: { params: { slug: string } }) {
  const book = await getBookBySlug(params.slug);
  
  if (!book) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="grid md:grid-cols-[300px_1fr] gap-12">
        {/* Left Column: Cover & Actions */}
        <div className="space-y-6">
          <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl bg-muted">
            {book.cover_url && (
              <Image src={book.cover_url} alt={book.title} fill className="object-cover" priority />
            )}
          </div>
          <div className="space-y-3">
            <Button size="lg" className="w-full">Start Reading</Button>
            <Button size="lg" variant="secondary" className="w-full">Add to Library</Button>
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">{book.title}</h1>
            {book.subtitle && <h2 className="text-xl text-muted-foreground mb-4">{book.subtitle}</h2>}
            
            <div className="text-lg">
              By <Link href={`/authors/${book.authors?.slug}`} className="font-bold text-primary hover:underline">{book.authors?.name}</Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {book.book_categories?.map((bc: any) => (
              <Link key={bc.categories.slug} href={`/categories/${bc.categories.slug}`}>
                <span className="px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/30 transition-colors">
                  {bc.categories.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {book.description || "No description available."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Publication Year</div>
              <div className="font-medium">{book.publication_year || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Language</div>
              <div className="font-medium uppercase">{book.language}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Reading Time</div>
              <div className="font-medium">{Math.round(book.reading_time_minutes / 60)} hrs</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Copyright</div>
              <div className="font-medium capitalize">{book.copyright_status.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
