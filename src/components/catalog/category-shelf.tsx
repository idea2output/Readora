"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Sparkles, LucideIcon } from "lucide-react";
import { trackBookEvent } from "@/lib/analytics";

export interface Book {
  id: string;
  title: string;
  slug: string;
  cover_url?: string;
  genre?: string;
  authors?: any;
  categorySlug?: string;
}

interface CategoryShelfProps {
  id?: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeColor?: string;
  books: Book[];
  totalCount?: number;
  categorySlug?: string;
  actionNode?: React.ReactNode;
  emptyStateText?: string;
}

export function CategoryShelf({
  title,
  subtitle,
  icon: IconComponent,
  badgeText,
  badgeColor = "border-primary/20 bg-primary/10 text-primary",
  books,
  totalCount,
  categorySlug,
  actionNode,
  emptyStateText = "No books available in this shelf yet.",
}: CategoryShelfProps) {
  // Max 2 rows of books on desktop (6 columns per row = 12 cards)
  const INITIAL_VISIBLE_COUNT = 12;
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleBooks = isExpanded ? books : books.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = books.length > INITIAL_VISIBLE_COUNT;

  return (
    <section aria-labelledby={`shelf-heading-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="space-y-4 pt-4 border-t first:border-t-0 first:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              id={`shelf-heading-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="font-serif text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground"
            >
              <IconComponent className="w-5 h-5 text-primary shrink-0" />
              {title}
            </h2>

            {badgeText && (
              <Badge variant="outline" className={`text-[11px] px-2.5 py-0.5 font-semibold ${badgeColor}`}>
                <Sparkles className="w-3 h-3 mr-1" />
                {badgeText}
              </Badge>
            )}

            {totalCount !== undefined && totalCount > 0 && (
              <Badge variant="secondary" className="text-[10px] font-mono">
                {totalCount} {totalCount === 1 ? 'book' : 'books'}
              </Badge>
            )}
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
            {subtitle}
          </p>
        </div>

        {/* Optional Action Node (e.g. Manage recommendations button) */}
        {actionNode && <div className="shrink-0">{actionNode}</div>}
      </div>

      {/* Grid of Books (6 per line on Large screens, 75% card scaling) */}
      {!books || books.length === 0 ? (
        <div className="p-8 text-center bg-muted/30 rounded-2xl border border-dashed text-xs text-muted-foreground">
          {emptyStateText}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {visibleBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.slug}`}
                onClick={() => trackBookEvent(book.id, 'view', categorySlug || book.genre)}
              >
                <Card className="h-full overflow-hidden hover:border-primary/50 hover:shadow-md transition-all rounded-xl group flex flex-col border bg-card">
                  <div className="aspect-[2/3] relative bg-muted overflow-hidden">
                    {book.cover_url ? (
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-muted-foreground font-serif text-xs">
                        {book.title}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3
                        className="font-bold text-xs line-clamp-1 group-hover:text-primary transition-colors leading-tight"
                        title={book.title}
                      >
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {Array.isArray(book.authors) ? book.authors[0]?.name : book.authors?.name || "Unknown Author"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground font-medium truncate max-w-[75px]">
                        {book.genre || "Classic"}
                      </span>
                      <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform">
                        Read →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Show More Button */}
          {(hasMore || categorySlug) && (
            <div className="flex justify-center pt-2">
              {categorySlug && !isExpanded ? (
                <Link href={`/categories/${categorySlug}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs font-bold gap-1.5 px-6 border-primary/30 hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    Show More →
                  </Button>
                </Link>
              ) : hasMore ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="rounded-full text-xs font-bold gap-1.5 px-6 border-primary/30 hover:bg-primary/10 hover:text-primary transition-all"
                >
                  {isExpanded ? "Show Less ↑" : "Show More →"}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
