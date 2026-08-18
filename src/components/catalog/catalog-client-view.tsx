"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Sparkles,
  TrendingUp,
  BookMarked,
  Landmark,
  Compass,
  Feather,
  Clock,
  Layers,
  Settings2,
  Search,
  ArrowRight,
  Library,
} from "lucide-react";
import { CategoryShelf, Book } from "@/components/catalog/category-shelf";
import { ManageRecommendationsModal } from "@/components/catalog/manage-recommendations-modal";
import { getUserTopCategories, getPopularityScores, trackBookEvent } from "@/lib/analytics";

interface CatalogClientViewProps {
  initialBooks: Book[];
  totalCount: number;
  categories: any[];
  initialQuery?: string;
  selectedCat?: string;
}

export function CatalogClientView({
  initialBooks,
  totalCount,
  categories,
  initialQuery = "",
  selectedCat = "",
}: CatalogClientViewProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(selectedCat);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [userTopCats, setUserTopCats] = useState<string[]>([]);
  const [popularityScores, setPopularityScores] = useState<Record<string, number>>({});
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);

  // Reset pagination limit when search query, active category, or view mode changes
  useEffect(() => {
    setVisibleCount(50);
  }, [searchQuery, activeCategory, showAllGrid]);

  // Load analytics & recommendations on mount
  const refreshAnalytics = () => {
    setUserTopCats(getUserTopCategories());
    setPopularityScores(getPopularityScores());
  };

  useEffect(() => {
    refreshAnalytics();
  }, []);

  // Filter books if search query or active category filter is typed
  const filteredBooks = useMemo(() => {
    return initialBooks.filter((book) => {
      const matchesSearch = searchQuery
        ? book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.authors?.name && book.authors.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      const matchesCat = activeCategory
        ? book.genre?.toLowerCase().includes(activeCategory.toLowerCase()) ||
          book.categorySlug?.toLowerCase() === activeCategory.toLowerCase()
        : true;

      return matchesSearch && matchesCat;
    });
  }, [initialBooks, searchQuery, activeCategory]);

  // Shelf 1: Recommended For You
  const recommendedBooks = useMemo(() => {
    if (userTopCats.length === 0) return initialBooks.slice(0, 12);
    return initialBooks
      .filter((b) => userTopCats.some((c) => b.genre?.toLowerCase().includes(c.toLowerCase())))
      .concat(initialBooks)
      .slice(0, 12);
  }, [initialBooks, userTopCats]);

  // Shelf 2: Most Popular
  const popularBooks = useMemo(() => {
    return [...initialBooks].sort((a, b) => {
      const scoreA = popularityScores[a.id] || 0;
      const scoreB = popularityScores[b.id] || 0;
      return scoreB - scoreA;
    });
  }, [initialBooks, popularityScores]);

  // Shelf 3: Classics
  const classicsBooks = useMemo(() => {
    const matched = initialBooks.filter(
      (b) =>
        b.genre?.toLowerCase().includes("classic") ||
        b.genre?.toLowerCase().includes("fiction") ||
        b.genre?.toLowerCase().includes("literature")
    );
    return matched.length >= 12 ? matched : [...matched, ...initialBooks.slice(0, 36)];
  }, [initialBooks]);

  // Shelf 4: Sacred Texts & Religion
  const sacredBooks = useMemo(() => {
    const matched = initialBooks.filter(
      (b) =>
        b.genre?.toLowerCase().includes("sacred") ||
        b.genre?.toLowerCase().includes("religion") ||
        b.genre?.toLowerCase().includes("quran") ||
        b.genre?.toLowerCase().includes("bible")
    );
    return matched.length >= 12 ? matched : [...matched, ...initialBooks.slice(36, 72)];
  }, [initialBooks]);

  // Shelf 5: History & Civilization
  const historyBooks = useMemo(() => {
    const matched = initialBooks.filter(
      (b) =>
        b.genre?.toLowerCase().includes("history") ||
        b.genre?.toLowerCase().includes("civilization") ||
        b.genre?.toLowerCase().includes("biography")
    );
    return matched.length >= 12 ? matched : [...matched, ...initialBooks.slice(72, 108)];
  }, [initialBooks]);

  // Shelf 6: Philosophy & Thought
  const philosophyBooks = useMemo(() => {
    const matched = initialBooks.filter(
      (b) =>
        b.genre?.toLowerCase().includes("philosophy") ||
        b.genre?.toLowerCase().includes("thought") ||
        b.genre?.toLowerCase().includes("ethics")
    );
    return matched.length >= 12 ? matched : [...matched, ...initialBooks.slice(108, 144)];
  }, [initialBooks]);

  // Shelf 7: Poetry & Drama
  const poetryBooks = useMemo(() => {
    const matched = initialBooks.filter(
      (b) =>
        b.genre?.toLowerCase().includes("poetry") ||
        b.genre?.toLowerCase().includes("drama") ||
        b.genre?.toLowerCase().includes("play")
    );
    return matched.length >= 12 ? matched : [...matched, ...initialBooks.slice(144, 180)];
  }, [initialBooks]);

  // Shelf 8: Adventure, Mystery & Fiction
  const adventureBooks = useMemo(() => {
    const matched = initialBooks.filter(
      (b) =>
        b.genre?.toLowerCase().includes("adventure") ||
        b.genre?.toLowerCase().includes("sci-fi") ||
        b.genre?.toLowerCase().includes("mystery")
    );
    return matched.length >= 12 ? matched : [...matched, ...initialBooks.slice(180, 216)];
  }, [initialBooks]);

  // Shelf 9: Recently Added
  const recentlyAddedBooks = useMemo(() => {
    return [...initialBooks].reverse();
  }, [initialBooks]);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Catalogue Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 md:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 p-6 pointer-events-none">
          <BookOpen className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge className="bg-primary/20 text-primary-foreground hover:bg-primary/30 border-0 text-xs">
            Global Digital Library
          </Badge>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
            Library Catalog
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Explore literature by subject, tradition, era, and reader interest. Discover classics, sacred texts, philosophy, history, poetry, and more.
          </p>
        </div>
      </div>

      {/* Global Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or subject..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border bg-background text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Toggle Button */}
          <Button
            variant={showAllGrid ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAllGrid(!showAllGrid)}
            className="rounded-full text-xs font-bold gap-1.5 shrink-0 px-4 h-10"
          >
            <Layers className="w-4 h-4" />
            {showAllGrid ? "Switch to Shelves View" : "View Complete Grid"}
          </Button>
        </div>

        {/* Horizontal Category Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => setActiveCategory("")}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
              !activeCategory
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
            }`}
          >
            All Categories ({totalCount})
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap border transition-colors ${
                activeCategory === cat.slug
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* IF USER SEARCHES OR TOGGLES ALL GRID VIEW */}
      {searchQuery || activeCategory || showAllGrid ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                {searchQuery ? `Results for "${searchQuery}"` : activeCategory ? `Category: ${activeCategory}` : "Complete Library Grid"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Showing {Math.min(visibleCount, filteredBooks.length)} of {filteredBooks.length} titles
              </p>
            </div>
            {(searchQuery || activeCategory) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("");
                  setShowAllGrid(false);
                }}
                className="text-xs text-primary font-bold"
              >
                Reset Filters
              </Button>
            )}
          </div>

          {filteredBooks.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-muted/30 rounded-3xl border border-dashed text-sm">
              No books matching your query found. Try adjusting your search term or exploring another category!
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {filteredBooks.slice(0, visibleCount).map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.slug}`}
                    onClick={() => trackBookEvent(book.id, "view", book.genre)}
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
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-muted-foreground font-serif text-xs">
                            {book.title}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h3 className="font-bold text-xs line-clamp-1 group-hover:text-primary transition-colors leading-tight" title={book.title}>
                            {book.title}
                          </h3>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5" title={book.authors?.name}>
                            {book.authors?.name || "Unknown Author"}
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

              {/* Show More Pagination Button */}
              {visibleCount < filteredBooks.length && (
                <div className="flex flex-col items-center justify-center pt-6 space-y-2">
                  <Button
                    onClick={() => setVisibleCount((prev) => prev + 50)}
                    size="lg"
                    className="rounded-full px-8 font-bold gap-2 text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    <span>Show More Books</span>
                    <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-mono">
                      +{Math.min(50, filteredBooks.length - visibleCount)}
                    </Badge>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Showing {Math.min(visibleCount, filteredBooks.length)} of {filteredBooks.length} titles
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* THE 10 CATEGORY SHELVES IN EXACT ORDER */
        <div className="space-y-12">
          {/* SHELF 1: Recommended for You */}
          <CategoryShelf
            title="Recommended for You"
            subtitle="Chosen from the subjects and books you explore most."
            icon={Sparkles}
            badgeText="Based on your reading interests"
            badgeColor="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300"
            books={recommendedBooks}
            totalCount={recommendedBooks.length}
            emptyStateText="Start exploring books across Literary Harbor to build personalized recommendations."
            actionNode={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManageModalOpen(true)}
                className="rounded-full text-[11px] font-bold gap-1 px-3 h-8 text-purple-600 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/10"
              >
                <Settings2 className="w-3.5 h-3.5" /> Manage recommendations
              </Button>
            }
          />

          {/* SHELF 2: Most Popular */}
          <CategoryShelf
            title="Most Popular"
            subtitle="The books readers are discovering, opening, and reading most."
            icon={TrendingUp}
            badgeText="Popular this month"
            badgeColor="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            books={popularBooks.slice(0, 12)}
            totalCount={popularBooks.length}
          />

          {/* SHELF 3: Classics */}
          <CategoryShelf
            title="Classics"
            subtitle="Enduring works that continue to shape literature and culture."
            icon={BookOpen}
            books={classicsBooks.length > 0 ? classicsBooks : initialBooks.slice(0, 12)}
            totalCount={classicsBooks.length || initialBooks.length}
            categorySlug="fiction-classics"
          />

          {/* SHELF 4: Sacred Texts & Religion */}
          <CategoryShelf
            title="Sacred Texts & Religion"
            subtitle="Foundational texts, traditions, commentary, and spiritual literature."
            icon={BookMarked}
            badgeText="Verified Rights"
            badgeColor="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            books={sacredBooks.length > 0 ? sacredBooks : initialBooks.slice(2, 14)}
            totalCount={sacredBooks.length || initialBooks.length}
            categorySlug="sacred-texts-religion"
          />

          {/* SHELF 5: History & Civilization */}
          <CategoryShelf
            title="History & Civilization"
            subtitle="Stories, records, and ideas that shaped societies."
            icon={Landmark}
            books={historyBooks.length > 0 ? historyBooks : initialBooks.slice(4, 16)}
            totalCount={historyBooks.length || initialBooks.length}
            categorySlug="history"
          />

          {/* SHELF 6: Philosophy & Thought */}
          <CategoryShelf
            title="Philosophy & Thought"
            subtitle="Questions of ethics, reason, politics, and human understanding."
            icon={Compass}
            books={philosophyBooks.length > 0 ? philosophyBooks : initialBooks.slice(6, 18)}
            totalCount={philosophyBooks.length || initialBooks.length}
            categorySlug="philosophy"
          />

          {/* SHELF 7: Poetry & Drama */}
          <CategoryShelf
            title="Poetry & Drama"
            subtitle="Verse, theatre, and timeless expressions of the human experience."
            icon={Feather}
            books={poetryBooks.length > 0 ? poetryBooks : initialBooks.slice(8, 20)}
            totalCount={poetryBooks.length || initialBooks.length}
            categorySlug="poetry"
          />

          {/* SHELF 8: Adventure, Mystery & Fiction */}
          <CategoryShelf
            title="Adventure, Mystery & Fiction"
            subtitle="Classic storytelling, imagination, mystery, and discovery."
            icon={Compass}
            books={adventureBooks.length > 0 ? adventureBooks : initialBooks.slice(10, 22)}
            totalCount={adventureBooks.length || initialBooks.length}
            categorySlug="fiction-sci-fi"
          />

          {/* SHELF 9: Recently Added */}
          <CategoryShelf
            title="Recently Added"
            subtitle="Newly available works in the Literary Harbor collection."
            icon={Clock}
            badgeText="Fresh Acquisitions"
            badgeColor="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            books={recentlyAddedBooks.slice(0, 12)}
            totalCount={recentlyAddedBooks.length}
          />

          {/* SHELF 10: Browse All Books */}
          <section aria-labelledby="shelf-heading-browse-all-books" className="pt-8 border-t space-y-6 text-center">
            <div className="max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                <Library className="w-3.5 h-3.5" />
                Complete Catalogue Index
              </div>
              <h2 id="shelf-heading-browse-all-books" className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
                Browse All Books
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Access every volume across our global digital library with full search and filtering.
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => setShowAllGrid(true)}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 h-12 text-sm shadow-lg gap-2"
            >
              View Complete Catalogue →
            </Button>
          </section>
        </div>
      )}

      {/* Manage Recommendations Modal */}
      <ManageRecommendationsModal
        open={manageModalOpen}
        onOpenChange={setManageModalOpen}
        onReset={refreshAnalytics}
      />
    </div>
  );
}
