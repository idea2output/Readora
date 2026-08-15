import Link from 'next/link';
import { BookOpenText, GraduationCap, MessageSquare, HelpCircle, CheckCircle2, Award, Plus, Search, Layers, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCommunityQuestions } from '@/lib/community/community-service';

export const metadata = {
  title: 'Academic Community | Literary Harbour',
  description: 'Human-to-human academic knowledge sharing, chapter discussions, textbook Q&A, and research explanations.',
};

export default async function CommunityPage() {
  const popularQuestions = await getCommunityQuestions({ sort: 'popular', limit: 4 });
  const recentQuestions = await getCommunityQuestions({ sort: 'recent', limit: 4 });

  const subjects = [
    { name: 'Mathematics', slug: 'mathematics', count: 48, icon: '∑' },
    { name: 'Physics', slug: 'physics', count: 64, icon: '⚛' },
    { name: 'Chemistry', slug: 'chemistry', count: 32, icon: '⚗' },
    { name: 'Biology', slug: 'biology', count: 56, icon: '🧬' },
    { name: 'Computer Science', slug: 'computer-science', count: 82, icon: '💻' },
    { name: 'Engineering', slug: 'engineering', count: 41, icon: '⚙' },
    { name: 'Economics', slug: 'economics', count: 39, icon: '📈' },
    { name: 'Statistics', slug: 'statistics', count: 51, icon: '📊' },
    { name: 'History', slug: 'history', count: 29, icon: '📜' },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10 space-y-12">
      {/* Community Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <Badge className="bg-primary/20 text-white border-0 font-semibold px-4 py-1 text-xs">
            <BookOpenText className="w-3.5 h-3.5 mr-1.5" />
            Human Academic Network
          </Badge>

          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
            Academic Community
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Collaborative academic Q&amp;A, chapter discussions, textbook references, and peer explanations across open educational resources.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 items-center">
            <Link href="/community/questions">
              <Button size="lg" className="rounded-full gap-2 font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                <Search className="w-4 h-4" /> Browse All Questions
              </Button>
            </Link>
            <Link href="/community/questions?ask=true">
              <Button size="lg" variant="outline" className="rounded-full gap-2 font-bold border-white/20 text-white hover:bg-white/10">
                <Plus className="w-4 h-4" /> Ask a Question
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Main Grid: Subjects & Discussions */}
      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* Left 2 Columns: Questions & Active Discussions */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Popular Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-serif font-bold">Popular Questions</h2>
              </div>
              <Link href="/community/questions?sort=popular" className="text-xs font-bold text-primary hover:underline">
                View All
              </Link>
            </div>

            <div className="grid gap-4">
              {popularQuestions.map(q => (
                <Card key={q.id} className="hover:border-primary/50 transition-all rounded-2xl">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">{q.subject_name}</span>
                      {q.book_title && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{q.book_title}</span>
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

                    <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-medium">
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
                      <span className="font-medium">By {q.author_name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <h2 className="text-2xl font-serif font-bold">Recent Academic Questions</h2>
              </div>
              <Link href="/community/questions?sort=recent" className="text-xs font-bold text-primary hover:underline">
                View All
              </Link>
            </div>

            <div className="grid gap-4">
              {recentQuestions.map(q => (
                <Card key={q.id} className="hover:border-primary/50 transition-all rounded-2xl">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">{q.subject_name}</span>
                      <span>•</span>
                      <span>{new Date(q.created_at).toLocaleDateString()}</span>
                    </div>

                    <Link href={`/community/questions/${q.id}`} className="block group">
                      <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                        {q.title}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>{q.answers_count} answers • {q.votes_count} votes</span>
                      <span className="font-medium">Asked by {q.author_name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Subjects & Guidelines */}
        <div className="space-y-8">
          
          {/* Academic Subjects Grid */}
          <Card className="rounded-3xl border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-serif font-bold text-lg">Academic Disciplines</h3>
              </div>

              <div className="grid gap-2">
                {subjects.map(s => (
                  <Link 
                    key={s.slug} 
                    href={`/community/questions?subject=${s.slug}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {s.icon}
                      </span>
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{s.count}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Academic Guidelines Box */}
          <Card className="rounded-3xl bg-indigo-500/5 border border-indigo-500/20">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Award className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Academic Policy</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Literary Harbour Community is strictly dedicated to academic explanations, study discussions, textbook Q&amp;A, and peer-reviewed references. General non-academic discussions are moderated.
              </p>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
