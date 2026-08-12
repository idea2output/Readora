import { getBookBySlug } from '@/lib/db/books';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { SourceRightsPanel } from '@/components/rights/source-rights-panel';
import { ShieldAlert, BookOpen } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const book = await getBookBySlug(resolvedParams.slug);
  if (!book) return {};
  
  return {
    title: `${book.title} by ${book.authors?.name} | Literary Harbor`,
    description: book.description || `Read ${book.title} by ${book.authors?.name} on Literary Harbor.`,
    openGraph: {
      title: book.title,
      description: book.description,
      images: book.cover_url ? [book.cover_url] : [],
    }
  };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const book = await getBookBySlug(resolvedParams.slug);
  
  if (!book) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
      <div className="grid md:grid-cols-[300px_1fr] gap-12">
        {/* Left Column: Cover & Actions */}
        <div className="space-y-6">
          <div className="aspect-[2/3] relative rounded-3xl overflow-hidden shadow-2xl bg-muted border">
            {book.cover_url && (
              <Image src={book.cover_url} alt={book.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" priority />
            )}
          </div>

          <div className="space-y-3">
            <Link href={`/read/${book.slug}`} className="block w-full">
              <Button size="lg" className="w-full rounded-full py-6 font-bold text-sm gap-2">
                <BookOpen className="w-4 h-4" /> Start Reading
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full rounded-full py-6 font-bold text-sm">
              Add to Personal Harbor
            </Button>
          </div>

          {/* Rights Badge Panel */}
          <div className="pt-2">
            <SourceRightsPanel
              rightsStatus={book.copyright_status === 'public_domain' ? 'PUBLIC_DOMAIN' : 'OPEN_LICENSE'}
              licenseName="Public Domain CC0"
              sourceName="Project Gutenberg"
              sourceUrl={book.source_url || undefined}
              attributionText={`Original edition hosted by Project Gutenberg. Digitized for open educational reading.`}
            />
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2 tracking-tight">{book.title}</h1>
            {book.subtitle && <h2 className="text-xl text-muted-foreground mb-4">{book.subtitle}</h2>}
            
            <div className="text-lg font-medium">
              By <Link href={`/authors/${book.authors?.slug}`} className="font-bold text-primary hover:underline">{book.authors?.name}</Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {book.book_categories?.map((bc: any) => (
              <Link key={bc.categories.slug} href={`/categories/${bc.categories.slug}`}>
                <span className="px-3 py-1 bg-muted border text-foreground rounded-full text-xs font-semibold hover:bg-muted/80 transition-colors">
                  {bc.categories.name}
                </span>
              </Link>
            ))}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-base leading-relaxed text-muted-foreground">
              {book.description || "No description available."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Publication Year</div>
              <div className="font-bold text-sm">{book.publication_year || '1923'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Language</div>
              <div className="font-bold text-sm uppercase">{book.language}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Reading Time</div>
              <div className="font-bold text-sm">{Math.round((book.reading_time_minutes || 120) / 60)} hrs</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Rights Basis</div>
              <div className="font-bold text-sm capitalize">{book.copyright_status?.replace('_', ' ') || 'Public Domain'}</div>
            </div>
          </div>

          {/* Legal Governance & Report Link */}
          <div className="p-4 rounded-2xl bg-muted/40 border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Have a copyright query or edition report?</span>
            <Link href="/rights" className="text-destructive font-bold hover:underline flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Report Issue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
