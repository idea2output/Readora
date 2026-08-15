"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Search, ShieldCheck, FileText, BookOpen, Layers, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CitationModal } from "@/components/academic/citation-modal";

interface AcademicBook {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  genre: string;
  author: string;
  doi?: string;
  isbn?: string;
  publisher?: string;
  institution?: string;
  year?: number;
  peerReviewed?: boolean;
  provider?: string;
  providerUrl?: string;
  license?: string;
}

export default function AcademicLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [peerReviewedOnly, setPeerReviewedOnly] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);
  const [citingBook, setCitingBook] = useState<AcademicBook | null>(null);

  const disciplines = [
    "Humanities", "Social Sciences", "History", "Philosophy",
    "Computer Science", "Economics", "Law", "Medicine & Health",
    "Physics", "Environmental Science"
  ];

  const mockAcademicBooks: AcademicBook[] = [
    {
      id: "ostax-101",
      title: "College Physics 2e",
      slug: "college-physics-2e",
      cover_url: null,
      genre: "Physics",
      author: "Paul Peter Urone, Roger Hinrichs",
      isbn: "978-1-951693-60-2",
      publisher: "OpenStax",
      institution: "Rice University",
      year: 2022,
      peerReviewed: true,
      provider: "OpenStax",
      providerUrl: "https://openstax.org/details/books/college-physics-2e",
      license: "CC BY 4.0",
    },
    {
      id: "ostax-102",
      title: "Introductory Statistics 2e",
      slug: "introductory-statistics-2e",
      cover_url: null,
      genre: "Statistics",
      author: "Barbara Illowsky, Susan Dean",
      isbn: "978-1-951693-85-5",
      publisher: "OpenStax",
      institution: "Rice University",
      year: 2023,
      peerReviewed: true,
      provider: "OpenStax",
      providerUrl: "https://openstax.org/details/books/introductory-statistics-2e",
      license: "CC BY 4.0",
    },
    {
      id: "ostax-103",
      title: "Biology 2e",
      slug: "biology-2e",
      cover_url: null,
      genre: "Biology",
      author: "Mary Ann Clark, Matthew Douglas",
      isbn: "978-1-947172-51-7",
      publisher: "OpenStax",
      institution: "Rice University",
      year: 2021,
      peerReviewed: true,
      provider: "OpenStax",
      providerUrl: "https://openstax.org/details/books/biology-2e",
      license: "CC BY 4.0",
    },
    {
      id: "1",
      title: "Principles of Open Educational Economics",
      slug: "principles-open-educational-economics",
      cover_url: null,
      genre: "Economics",
      author: "Prof. Helena Vance",
      doi: "10.1016/j.jebo.2026.04.012",
      isbn: "978-0-262-53890-1",
      publisher: "Oxford Open Press",
      institution: "University of Oxford",
      year: 2024,
      peerReviewed: true,
    },
  ];

  const filteredBooks = mockAcademicBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (book.doi && book.doi.includes(searchQuery)) ||
                          (book.isbn && book.isbn.includes(searchQuery));
    const matchesDiscipline = !selectedDiscipline || book.genre === selectedDiscipline;
    const matchesPeer = !peerReviewedOnly || book.peerReviewed;
    return matchesSearch && matchesDiscipline && matchesPeer;
  });

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <Badge className="bg-primary/20 text-white border-0 font-semibold px-4 py-1 text-xs">
            First-Class Academic Repository
          </Badge>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
            Open Academic Knowledge & Research
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Peer-reviewed monographs, university press publications, DOAB & OAPEN open textbooks with verified DOIs, citations, and institutional access.
          </p>
        </div>
      </div>

      {/* Search & Discipline Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Title, Author, ISBN, or DOI (e.g. 10.1016/...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full pl-11 py-6 bg-card border-border/80 text-xs"
            />
          </div>
          <Button
            variant={peerReviewedOnly ? "default" : "outline"}
            onClick={() => setPeerReviewedOnly(!peerReviewedOnly)}
            className="rounded-full py-6 text-xs gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {peerReviewedOnly ? "Peer-Reviewed Only" : "All Academic Books"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant={selectedDiscipline === null ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs"
            onClick={() => setSelectedDiscipline(null)}
          >
            All Disciplines
          </Button>
          {disciplines.map((d) => (
            <Button
              key={d}
              variant={selectedDiscipline === d ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setSelectedDiscipline(d)}
            >
              {d}
            </Button>
          ))}
        </div>
      </div>

      {/* Academic Books List */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" /> Verified Academic Works ({filteredBooks.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="rounded-3xl border bg-card hover:shadow-xl transition-all p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">
                    {book.genre}
                  </Badge>
                  {book.peerReviewed && (
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0 text-[10px] gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Peer-Reviewed
                    </Badge>
                  )}
                </div>

                <Link href={`/books/${book.slug}`}>
                  <h3 className="font-serif font-bold text-base hover:text-primary transition-colors leading-snug">
                    {book.title}
                  </h3>
                </Link>

                <p className="text-xs text-muted-foreground font-medium">{book.author}</p>

                <div className="space-y-1 text-[11px] text-muted-foreground/80 border-t pt-3 font-mono">
                  {book.publisher && <div>Publisher: {book.publisher}</div>}
                  {book.institution && <div>Institution: {book.institution}</div>}
                  {book.doi && <div className="text-primary truncate">DOI: {book.doi}</div>}
                  {book.isbn && <div>ISBN: {book.isbn}</div>}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-2 border-t mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs gap-1.5 py-4 flex-1"
                  onClick={() => setCitingBook(book)}
                >
                  <FileText className="w-3.5 h-3.5" /> Cite
                </Button>
                {book.provider === 'OpenStax' || book.providerUrl || (book.slug && book.slug.includes('physics')) ? (
                  <a href={book.providerUrl || `https://openstax.org/books/${book.slug}`} target="_blank" rel="noreferrer" className="flex-1">
                    <Button size="sm" className="w-full rounded-full text-xs gap-1.5 py-4 font-bold bg-blue-600 hover:bg-blue-500 text-white">
                      <ExternalLink className="w-3.5 h-3.5" /> View Reader
                    </Button>
                  </a>
                ) : (
                  <Link href={`/read/${book.slug}`} className="flex-1">
                    <Button size="sm" className="w-full rounded-full text-xs gap-1.5 py-4 font-bold">
                      <BookOpen className="w-3.5 h-3.5" /> Read Online
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {citingBook && (
        <CitationModal
          isOpen={!!citingBook}
          onClose={() => setCitingBook(null)}
          book={citingBook}
        />
      )}
    </div>
  );
}
