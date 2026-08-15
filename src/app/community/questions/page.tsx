"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, BookOpenText, MessageSquare, CheckCircle2, Filter, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function QuestionsFeedPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sortOption, setSortOption] = useState("recent");
  
  // Ask Question Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newSubject, setNewSubject] = useState("physics");
  const [bookTitle, setBookTitle] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const subjects = [
    { label: "All Disciplines", value: "" },
    { label: "Physics", value: "physics" },
    { label: "Mathematics", value: "mathematics" },
    { label: "Statistics", value: "statistics" },
    { label: "Biology", value: "biology" },
    { label: "Computer Science", value: "computer-science" },
    { label: "Economics", value: "economics" },
    { label: "Chemistry", value: "chemistry" },
    { label: "Engineering", value: "engineering" },
    { label: "History", value: "history" },
  ];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/community/questions', window.location.origin);
      if (selectedSubject) url.searchParams.set('subject', selectedSubject);
      if (searchQuery) url.searchParams.set('q', searchQuery);
      if (sortOption) url.searchParams.set('sort', sortOption);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const res = await fetch('/api/community/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          body: newBody,
          subject_slug: newSubject,
          subject_name: subjects.find(s => s.value === newSubject)?.label || newSubject,
          book_title: bookTitle || undefined,
          chapter_title: chapterTitle || undefined,
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsDialogOpen(false);
        setNewTitle("");
        setNewBody("");
        fetchQuestions();
      } else {
        setErrorMessage(data.error || "Failed to submit question.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit question.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Academic Questions &amp; Discussions</h1>
          <p className="text-sm text-muted-foreground">Search peer-reviewed textbook explanations, chapter inquiries, and academic references.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full gap-2 font-bold bg-primary text-primary-foreground">
              <Plus className="w-4 h-4" /> Ask a Question
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-bold">Ask the Academic Community</DialogTitle>
              <p className="text-xs text-muted-foreground">Questions must be related to an academic discipline, textbook, chapter, or educational concept.</p>
            </DialogHeader>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-xs uppercase tracking-wider">Discipline / Subject *</label>
                <select 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                >
                  {subjects.filter(s => s.value).map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-xs uppercase tracking-wider">Book Title (Optional)</label>
                  <Input 
                    placeholder="e.g. College Physics 2e"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-xs uppercase tracking-wider">Chapter / Section (Optional)</label>
                  <Input 
                    placeholder="e.g. Chapter 4: Dynamics"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-xs uppercase tracking-wider">Question Title *</label>
                <Input 
                  placeholder="State your academic question clearly..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-xs uppercase tracking-wider">Details &amp; Context *</label>
                <textarea 
                  rows={5}
                  placeholder="Provide detailed context, formulas, equations, or relevant textbook passages..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full rounded-lg border bg-background p-3 text-sm"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="font-bold">
                  {submitting ? "Posting..." : "Post Question"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search questions or keywords..."
            className="pl-9 rounded-full text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Sort & Subject Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex border rounded-full p-1 bg-muted/40 text-xs font-semibold">
            <button 
              onClick={() => setSortOption("recent")}
              className={`px-3 py-1.5 rounded-full transition-colors ${sortOption === "recent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Recent
            </button>
            <button 
              onClick={() => setSortOption("popular")}
              className={`px-3 py-1.5 rounded-full transition-colors ${sortOption === "popular" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Popular
            </button>
            <button 
              onClick={() => setSortOption("unanswered")}
              className={`px-3 py-1.5 rounded-full transition-colors ${sortOption === "unanswered" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Unanswered
            </button>
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex flex-wrap gap-2 pt-2">
        {subjects.map(s => (
          <button
            key={s.value}
            onClick={() => setSelectedSubject(s.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedSubject === s.value ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted text-muted-foreground"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground font-medium text-sm">Loading academic questions...</div>
      ) : questions.length === 0 ? (
        <Card className="rounded-3xl border p-12 text-center space-y-4">
          <p className="text-muted-foreground text-sm font-medium">No academic questions found matching your filter criteria.</p>
          <Button onClick={() => { setSelectedSubject(""); setSearchQuery(""); }} variant="outline" className="rounded-full">Clear Filters</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {questions.map(q => (
            <Card key={q.id} className="hover:border-primary/50 transition-all rounded-2xl">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">{q.subject_name}</span>
                  {q.book_title && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-foreground/80">{q.book_title}</span>
                    </>
                  )}
                  {q.chapter_title && (
                    <>
                      <span>•</span>
                      <span>{q.chapter_title}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{new Date(q.created_at).toLocaleDateString()}</span>
                </div>

                <Link href={`/community/questions/${q.id}`} className="block group">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors leading-snug">
                    {q.title}
                  </h3>
                </Link>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {q.body}
                </p>

                <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-semibold text-foreground/80">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" /> {q.answers_count} answers
                    </span>
                    <span className="font-medium">
                      ▲ {q.votes_count} votes
                    </span>
                    {q.accepted_answer_id && (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 font-semibold gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Solved
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium">Asked by {q.author_name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
