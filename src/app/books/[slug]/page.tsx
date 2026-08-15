import { getBookBySlug } from '@/lib/db/books';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { SourceRightsPanel } from '@/components/rights/source-rights-panel';
import { ShieldAlert, BookOpen, ExternalLink } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const book = await getBookBySlug(resolvedParams.slug);
  if (!book) return {};
  
  const authorName = Array.isArray(book.authors) ? book.authors[0]?.name : book.authors?.name;

  return {
    title: `${book.title} by ${authorName || 'Author'} | Literary Harbor`,
    description: book.description || `Read ${book.title} on Literary Harbor.`,
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

  const rightsRecord = Array.isArray(book.book_rights) ? book.book_rights[0] : book.book_rights;
  const sourceId = rightsRecord?.source_id || book.source_id;
  const isOpenStax = sourceId === 'openstax' || book.publisher === 'OpenStax' || (book.source_url && book.source_url.includes('openstax.org'));
  const externalReaderUrl = book.reader_url || book.source_url || `https://openstax.org/books/${book.slug}`;
  const authorName = Array.isArray(book.authors) ? book.authors[0]?.name : book.authors?.name;
  const authorSlug = Array.isArray(book.authors) ? book.authors[0]?.slug : book.authors?.slug;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
      <div className="grid md:grid-cols-[300px_1fr] gap-12">
        {/* Left Column: Cover & Actions */}
        <div className="space-y-6">
          <div className="aspect-[2/3] relative rounded-3xl overflow-hidden shadow-2xl bg-muted border flex items-center justify-center">
            {book.cover_url ? (
              <Image src={book.cover_url} alt={book.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" priority />
            ) : (
              <div className="p-6 text-center space-y-2">
                <BookOpen className="w-12 h-12 text-primary/40 mx-auto" />
                <h3 className="font-serif font-bold text-sm line-clamp-2">{book.title}</h3>
                <p className="text-xs text-muted-foreground">{authorName}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {isOpenStax ? (
              <a href={externalReaderUrl} target="_blank" rel="noreferrer" className="block w-full">
                <Button size="lg" className="w-full rounded-full py-6 font-bold text-sm gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-lg">
                  <ExternalLink className="w-4 h-4" /> View Reader on OpenStax
                </Button>
              </a>
            ) : (
              <Link href={`/read/${book.slug}`} className="block w-full">
                <Button size="lg" className="w-full rounded-full py-6 font-bold text-sm gap-2">
                  <BookOpen className="w-4 h-4" /> Start Reading
                </Button>
              </Link>
            )}

            <Button size="lg" variant="outline" className="w-full rounded-full py-6 font-bold text-sm">
              Add to Personal Harbor
            </Button>
          </div>

          {/* Rights Badge Panel */}
          <div className="pt-2">
            <SourceRightsPanel
              rightsStatus={rightsRecord?.rights_status || (book.copyright_status === 'public_domain' ? 'PUBLIC_DOMAIN' : 'OPEN_LICENSE')}
              licenseName={rightsRecord?.license_id ? rightsRecord.license_id.toUpperCase() : (book.license || "CC BY 4.0")}
              sourceName={isOpenStax ? "OpenStax" : (sourceId || "Project Gutenberg")}
              sourceUrl={book.source_url || externalReaderUrl}
              attributionText={rightsRecord?.attribution_text || (isOpenStax ? `Access for free at ${book.source_url || externalReaderUrl} by OpenStax.` : `Original edition hosted by Project Gutenberg. Digitized for open educational reading.`)}
            />
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2 tracking-tight">{book.title}</h1>
            {book.subtitle && <h2 className="text-xl text-muted-foreground mb-4">{book.subtitle}</h2>}
            
            <div className="text-lg font-medium">
              By {authorSlug ? (
                <Link href={`/authors/${authorSlug}`} className="font-bold text-primary hover:underline">{authorName}</Link>
              ) : (
                <span className="font-bold text-primary">{authorName || 'OpenStax Authors'}</span>
              )}
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
              <div className="font-bold text-sm">{book.publication_year || '2022'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Language</div>
              <div className="font-bold text-sm uppercase">{book.language || 'en'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Provider</div>
              <div className="font-bold text-sm">{isOpenStax ? 'OpenStax' : 'Literary Harbour'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Rights Basis</div>
              <div className="font-bold text-sm capitalize">{(rightsRecord?.rights_status || book.copyright_status || 'OPEN_LICENSE').replace('_', ' ')}</div>
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
