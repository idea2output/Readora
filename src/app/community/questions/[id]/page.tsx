"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, CheckCircle2, ThumbsUp, ShieldAlert, BookOpen, Award, ExternalLink, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const questionId = resolvedParams.id;

  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Answer Form
  const [newAnswerBody, setNewAnswerBody] = useState("");
  const [refBook, setRefBook] = useState("");
  const [refCitation, setRefCitation] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  
  // Report Modal State
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("off_topic");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Question & Answers
      const resQ = await fetch(`/api/community/questions?id=${questionId}`);
      const dataQ = await resQ.json();
      if (dataQ.success && dataQ.questions) {
        const found = dataQ.questions.find((q: any) => q.id === questionId);
        setQuestion(found || null);
      }

      const resA = await fetch(`/api/community/answers?question_id=${questionId}`);
      const dataA = await resA.json();
      if (dataA.success) {
        setAnswers(dataA.answers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [questionId]);

  const handleVote = async (type: 'question' | 'answer', id: string) => {
    try {
      const res = await fetch('/api/community/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: type === 'question' ? id : undefined,
          answer_id: type === 'answer' ? id : undefined,
          vote_type: 'upvote'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const res = await fetch('/api/community/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          question_id: questionId,
          answer_id: answerId,
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerBody.trim()) return;

    setSubmittingAnswer(true);
    try {
      const refs = refBook || refCitation ? [{
        book_title: refBook || undefined,
        citation_text: refCitation || undefined,
      }] : [];

      const res = await fetch('/api/community/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          body: newAnswerBody,
          references: refs,
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewAnswerBody("");
        setRefBook("");
        setRefCitation("");
        fetchData();
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleReport = async (itemType: 'question' | 'answer', itemId: string) => {
    try {
      const res = await fetch('/api/community/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: itemType,
          item_id: itemId,
          reason: reportReason,
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Report submitted to Community Moderation Queue.");
        setReportingId(null);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading academic question details...</div>;
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold">Question Not Found</h2>
        <Link href="/community/questions">
          <Button variant="outline" className="rounded-full">Back to Questions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Back Button */}
      <Link href="/community/questions" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Academic Community
      </Link>

      {/* Main Question Card */}
      <Card className="rounded-3xl border shadow-md">
        <CardContent className="p-8 space-y-6">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-b pb-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-0 font-bold">{question.subject_name}</Badge>
              {question.book_title && (
                <Badge variant="outline" className="gap-1">
                  <BookOpen className="w-3 h-3 text-primary" /> {question.book_title}
                </Badge>
              )}
              {question.chapter_title && <span className="font-medium text-foreground/70">• {question.chapter_title}</span>}
            </div>

            <div className="flex items-center gap-3">
              <span>Asked on {new Date(question.created_at).toLocaleDateString()}</span>
              <button 
                onClick={() => setReportingId(question.id)}
                className="text-destructive hover:underline text-[11px] font-semibold flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3" /> Report
              </button>
            </div>
          </div>

          <h1 className="font-serif text-3xl font-bold leading-tight">{question.title}</h1>

          <div className="prose dark:prose-invert max-w-none text-base leading-relaxed">
            <p className="whitespace-pre-wrap">{question.body}</p>
          </div>

          {/* Author & Voting Bar */}
          <div className="pt-4 flex items-center justify-between border-t text-xs">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleVote('question', question.id)}
                className="rounded-full gap-1.5 font-bold"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{question.votes_count} Votes</span>
              </Button>
            </div>

            <div className="flex items-center gap-3 bg-muted/40 px-4 py-2 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                {question.author_name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-sm">{question.author_name}</div>
                <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-500" /> Reputation: {question.author_reputation} pts
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Academic Answers ({answers.length})
          </h2>
        </div>

        {answers.length === 0 ? (
          <Card className="rounded-3xl border p-8 text-center text-muted-foreground text-sm">
            No peer answers submitted yet. Be the first academic scholar to answer this question!
          </Card>
        ) : (
          <div className="grid gap-6">
            {answers.map(ans => (
              <Card key={ans.id} className={`rounded-3xl border transition-all ${ans.is_accepted ? "border-emerald-500/50 bg-emerald-500/5 shadow-md" : "hover:border-primary/40"}`}>
                <CardContent className="p-6 space-y-4">
                  {ans.is_accepted && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Official Accepted Answer
                    </div>
                  )}

                  <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                    <p className="whitespace-pre-wrap">{ans.body}</p>
                  </div>

                  {/* Academic References Block */}
                  {ans.references && ans.references.length > 0 && (
                    <div className="p-4 rounded-2xl bg-muted/60 border text-xs space-y-2">
                      <div className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-primary" /> Peer-Reviewed References &amp; Citations
                      </div>
                      {ans.references.map((ref: any, idx: number) => (
                        <div key={idx} className="text-foreground/90 font-medium leading-relaxed">
                          {ref.book_title && <span className="font-bold text-primary mr-1">[{ref.book_title}]</span>}
                          {ref.citation_text || ref.section}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Answer Footer */}
                  <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleVote('answer', ans.id)}
                        className="rounded-full gap-1.5 text-xs font-bold"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{ans.votes_count} Upvotes</span>
                      </Button>

                      {!ans.is_accepted && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleAcceptAnswer(ans.id)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                        >
                          Mark as Accepted
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold">{ans.author_name}</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                        {ans.author_reputation} pts
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Answer Submission Form */}
      <Card className="rounded-3xl border shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-serif text-xl font-bold">Submit an Academic Answer</h3>
          <p className="text-xs text-muted-foreground">Provide detailed, evidence-based explanations. Include textbook references or equations where applicable.</p>

          <form onSubmit={handleSubmitAnswer} className="space-y-4 text-sm">
            <textarea 
              rows={5}
              placeholder="Write your explanation or mathematical proof here..."
              value={newAnswerBody}
              onChange={(e) => setNewAnswerBody(e.target.value)}
              className="w-full rounded-2xl border bg-background p-4 text-sm"
              required
            />

            <div className="grid md:grid-cols-2 gap-3">
              <Input 
                placeholder="Reference Textbook Title (Optional)"
                value={refBook}
                onChange={(e) => setRefBook(e.target.value)}
              />
              <Input 
                placeholder="Citation details, page # or DOI (Optional)"
                value={refCitation}
                onChange={(e) => setRefCitation(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submittingAnswer} className="rounded-full font-bold gap-2">
                <Send className="w-4 h-4" />
                {submittingAnswer ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
