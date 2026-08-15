import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = "https://dxtdkmszrgwncxuukpor.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGRrbXN6cmd3bmN4dXVrcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0Njg2OTgsImV4cCI6MjEwMjA0NDY5OH0.GkFXEllSK-x1Ojpa8ui69gSjRK64YbsGPaAQYRMoeio";

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY;
  return createSupabaseClient(url, key);
}

export interface AcademicReference {
  book_title?: string;
  chapter?: string;
  section?: string;
  page?: string;
  url?: string;
  citation_text?: string;
}

export interface CommunityQuestion {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  author_reputation: number;
  book_id?: string;
  book_title?: string;
  book_slug?: string;
  chapter_id?: string;
  chapter_title?: string;
  section_id?: string;
  subject_id?: string;
  subject_name: string;
  subject_slug: string;
  title: string;
  body: string;
  status: 'open' | 'answered' | 'closed' | 'locked' | 'removed';
  accepted_answer_id?: string | null;
  views: number;
  votes_count: number;
  answers_count: number;
  is_academic: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityAnswer {
  id: string;
  question_id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  author_reputation: number;
  body: string;
  is_accepted: boolean;
  votes_count: number;
  references?: AcademicReference[];
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  question_id?: string;
  answer_id?: string;
  user_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface CommunityReport {
  id: string;
  reporter_id: string;
  reporter_email?: string;
  item_type: 'question' | 'answer' | 'comment';
  item_id: string;
  reason: 'spam' | 'incorrect_info' | 'harassment' | 'off_topic' | 'copyright' | 'academic_misconduct' | 'other';
  details?: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  created_at: string;
}

// In-Memory Seed Storage for Instant Zero-Config Community Experience
const MEMORY_QUESTIONS: CommunityQuestion[] = [
  {
    id: "q-101",
    user_id: "u-prof-vance",
    author_name: "Dr. Aris Thorne",
    author_reputation: 340,
    book_id: "openstax-college-physics-2e",
    book_title: "College Physics 2e",
    book_slug: "college-physics-2e",
    chapter_id: "ch-4",
    chapter_title: "Chapter 4: Dynamics and Newton's Laws",
    section_id: "sec-4-2",
    subject_id: "subj-physics",
    subject_name: "Physics",
    subject_slug: "physics",
    title: "Why does linear momentum depend directly on velocity rather than acceleration?",
    body: "In Newton's second law, force is defined as mass times acceleration ($F = ma = m \\frac{dv}{dt}$). When defining linear momentum $p = mv$, why does momentum scale linearly with instantaneous velocity $v$ instead of acceleration $a$?",
    status: "answered",
    accepted_answer_id: "a-201",
    views: 142,
    votes_count: 18,
    answers_count: 2,
    is_academic: true,
    created_at: "2026-08-10T14:30:00Z",
    updated_at: "2026-08-11T09:15:00Z",
  },
  {
    id: "q-102",
    user_id: "u-math-scholar",
    author_name: "Elena Rostova",
    author_reputation: 195,
    book_id: "openstax-introductory-statistics-2e",
    book_title: "Introductory Statistics 2e",
    book_slug: "introductory-statistics-2e",
    chapter_id: "ch-8",
    chapter_title: "Chapter 8: Confidence Intervals",
    subject_id: "subj-stats",
    subject_name: "Statistics",
    subject_slug: "statistics",
    title: "Deriving Student's t-Distribution when population variance is unknown",
    body: "When conducting hypothesis testing with small sample sizes ($n < 30$), why must we switch from the standard Normal ($Z$) distribution to Student's $t$-distribution, and how do degrees of freedom ($n - 1$) adjust the tail thickness?",
    status: "open",
    accepted_answer_id: null,
    views: 89,
    votes_count: 12,
    answers_count: 1,
    is_academic: true,
    created_at: "2026-08-12T11:00:00Z",
    updated_at: "2026-08-12T11:00:00Z",
  },
  {
    id: "q-103",
    user_id: "u-bio-researcher",
    author_name: "Marcus Chen",
    author_reputation: 520,
    book_id: "openstax-biology-2e",
    book_title: "Biology 2e",
    book_slug: "biology-2e",
    subject_id: "subj-biology",
    subject_name: "Biology",
    subject_slug: "biology",
    title: "Mechanism of ATP Synthase rotational catalysis during oxidative phosphorylation",
    body: "How does the proton motive force across the inner mitochondrial membrane cause mechanical rotation in the $c$-ring of ATP Synthase, and how is this conformational energy coupled to ADP phosphorylation?",
    status: "answered",
    accepted_answer_id: "a-203",
    views: 210,
    votes_count: 24,
    answers_count: 3,
    is_academic: true,
    created_at: "2026-08-08T16:20:00Z",
    updated_at: "2026-08-09T10:45:00Z",
  }
];

const MEMORY_ANSWERS: CommunityAnswer[] = [
  {
    id: "a-201",
    question_id: "q-101",
    user_id: "u-physics-prof",
    author_name: "Prof. Jonathan Sterling",
    author_reputation: 890,
    body: "Linear momentum $p$ represents the quantity of motion possessed by a body. By definition, impulse $J = \\int F \\, dt = \\Delta p$. Integrating force $F = m \\frac{dv}{dt}$ with respect to time yields $\\int m \\frac{dv}{dt} \\, dt = m v + C$. Therefore, momentum is inherently a function of instantaneous velocity $v$, while force governs the time rate of change of momentum ($\\frac{dp}{dt} = F$).",
    is_accepted: true,
    votes_count: 16,
    references: [
      {
        book_title: "College Physics 2e",
        chapter: "Chapter 4: Dynamics and Newton's Laws",
        section: "Section 4.2",
        citation_text: "OpenStax Physics 2e, Linear Momentum and Collisions, p. 184."
      }
    ],
    created_at: "2026-08-10T16:00:00Z",
    updated_at: "2026-08-10T16:00:00Z",
  },
  {
    id: "a-203",
    question_id: "q-103",
    user_id: "u-biochem",
    author_name: "Dr. Sarah Jenkins",
    author_reputation: 640,
    body: "Rotational catalysis operates through asymmetric subunit interactions. As protons pass through the half-channels of subunit $a$, they protonate a specific Glutamate residue on the $c$-ring. This neutralization allows the ring to rotate in the hydrophobic membrane. The attached $\\gamma$-subunit rotates inside the $F_1$ headpiece, inducing sequential conformational changes (Open $\\rightarrow$ Loose $\\rightarrow$ Tight) in the $\\alpha_3 \\beta_3$ catalytic sites to synthesize ATP.",
    is_accepted: true,
    votes_count: 21,
    references: [
      {
        book_title: "Biology 2e",
        chapter: "Chapter 7: Cellular Respiration",
        citation_text: "OpenStax Biology 2e, Oxidative Phosphorylation, Section 7.4."
      }
    ],
    created_at: "2026-08-08T18:15:00Z",
    updated_at: "2026-08-08T18:15:00Z",
  }
];

const MEMORY_COMMENTS: CommunityComment[] = [];
const MEMORY_VOTES: Set<string> = new Set();
const MEMORY_REPORTS: CommunityReport[] = [];

/**
 * Fetch public community questions with optional subject, book, or query filters.
 */
export async function getCommunityQuestions(params: {
  subject_slug?: string;
  book_id?: string;
  status?: string;
  search?: string;
  sort?: 'popular' | 'recent' | 'unanswered';
  limit?: number;
}) {
  const supabase = getPublicClient();

  try {
    let query = supabase.from('community_questions').select('*');
    if (params.subject_slug) query = query.eq('subject_slug', params.subject_slug);
    if (params.book_id) query = query.eq('book_id', params.book_id);
    if (params.status) query = query.eq('status', params.status);
    if (params.search) query = query.ilike('title', `%${params.search}%`);

    if (params.sort === 'popular') query = query.order('votes_count', { ascending: false });
    else if (params.sort === 'unanswered') query = query.eq('answers_count', 0).order('created_at', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    if (params.limit) query = query.limit(params.limit);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as CommunityQuestion[];
    }
  } catch (_) {}

  // Fallback to memory
  let list = [...MEMORY_QUESTIONS];
  if (params.subject_slug) {
    list = list.filter(q => q.subject_slug === params.subject_slug);
  }
  if (params.book_id) {
    list = list.filter(q => q.book_id === params.book_id);
  }
  if (params.status) {
    list = list.filter(q => q.status === params.status);
  }
  if (params.search) {
    const qLower = params.search.toLowerCase();
    list = list.filter(q => q.title.toLowerCase().includes(qLower) || q.body.toLowerCase().includes(qLower));
  }

  if (params.sort === 'popular') {
    list.sort((a, b) => b.votes_count - a.votes_count);
  } else if (params.sort === 'unanswered') {
    list = list.filter(q => q.answers_count === 0).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  if (params.limit) {
    list = list.slice(0, params.limit);
  }

  return list;
}

/**
 * Fetch single community question by ID
 */
export async function getCommunityQuestionById(id: string): Promise<CommunityQuestion | null> {
  const supabase = getPublicClient();

  try {
    const { data, error } = await supabase.from('community_questions').select('*').eq('id', id).single();
    if (!error && data) return data as CommunityQuestion;
  } catch (_) {}

  return MEMORY_QUESTIONS.find(q => q.id === id) || null;
}

/**
 * Fetch answers for a question
 */
export async function getAnswersForQuestion(question_id: string): Promise<CommunityAnswer[]> {
  const supabase = getPublicClient();

  try {
    const { data, error } = await supabase
      .from('community_answers')
      .select('*')
      .eq('question_id', question_id)
      .order('is_accepted', { ascending: false })
      .order('votes_count', { ascending: false });

    if (!error && data && data.length > 0) return data as CommunityAnswer[];
  } catch (_) {}

  return MEMORY_ANSWERS.filter(a => a.question_id === question_id);
}

/**
 * Post a new Community Question with strict Academic Validation
 */
export async function createCommunityQuestion(input: {
  user_id: string;
  author_name: string;
  book_id?: string;
  book_title?: string;
  book_slug?: string;
  chapter_id?: string;
  chapter_title?: string;
  section_id?: string;
  subject_name: string;
  subject_slug: string;
  title: string;
  body: string;
}): Promise<CommunityQuestion> {
  // Academic Validation Check
  const academicSubjects = [
    'mathematics', 'physics', 'chemistry', 'biology',
    'computer-science', 'engineering', 'economics',
    'statistics', 'psychology', 'social-sciences', 'history'
  ];

  const isValidAcademic = input.book_id || academicSubjects.includes(input.subject_slug.toLowerCase());
  if (!isValidAcademic) {
    throw new Error("Academic Enforcement Error: Community questions must be associated with an academic subject or academic textbook.");
  }

  const newQuestion: CommunityQuestion = {
    id: `q-${Date.now()}`,
    user_id: input.user_id,
    author_name: input.author_name || 'Academic Contributor',
    author_reputation: 15,
    book_id: input.book_id,
    book_title: input.book_title,
    book_slug: input.book_slug,
    chapter_id: input.chapter_id,
    chapter_title: input.chapter_title,
    section_id: input.section_id,
    subject_id: `subj-${input.subject_slug}`,
    subject_name: input.subject_name,
    subject_slug: input.subject_slug,
    title: input.title,
    body: input.body,
    status: 'open',
    views: 1,
    votes_count: 0,
    answers_count: 0,
    is_academic: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabase = getPublicClient();
  try {
    const { data, error } = await supabase.from('community_questions').insert(newQuestion).select().single();
    if (!error && data) return data as CommunityQuestion;
  } catch (_) {}

  MEMORY_QUESTIONS.unshift(newQuestion);
  return newQuestion;
}

/**
 * Submit an answer to a community question
 */
export async function createCommunityAnswer(input: {
  question_id: string;
  user_id: string;
  author_name: string;
  body: string;
  references?: AcademicReference[];
}): Promise<CommunityAnswer> {
  const newAnswer: CommunityAnswer = {
    id: `a-${Date.now()}`,
    question_id: input.question_id,
    user_id: input.user_id,
    author_name: input.author_name || 'Academic Scholar',
    author_reputation: 25,
    body: input.body,
    is_accepted: false,
    votes_count: 0,
    references: input.references || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supabase = getPublicClient();
  try {
    const { data, error } = await supabase.from('community_answers').insert(newAnswer).select().single();
    if (!error && data) {
      // update answers count
      const q = await getCommunityQuestionById(input.question_id);
      if (q) {
        await supabase.from('community_questions').update({ answers_count: (q.answers_count || 0) + 1 }).eq('id', input.question_id);
      }
      return data as CommunityAnswer;
    }
  } catch (_) {}

  MEMORY_ANSWERS.push(newAnswer);
  const memQ = MEMORY_QUESTIONS.find(q => q.id === input.question_id);
  if (memQ) {
    memQ.answers_count += 1;
  }
  return newAnswer;
}

/**
 * Vote on a question or answer (Enforces 1 vote per user)
 */
export async function voteOnItem(input: {
  user_id: string;
  question_id?: string;
  answer_id?: string;
  vote_type: 'upvote' | 'downvote';
}): Promise<{ success: boolean; new_count: number }> {
  const voteKey = `${input.user_id}_${input.question_id || input.answer_id}`;
  if (MEMORY_VOTES.has(voteKey)) {
    throw new Error("You have already voted on this academic item.");
  }
  MEMORY_VOTES.add(voteKey);

  const delta = input.vote_type === 'upvote' ? 1 : -1;

  if (input.question_id) {
    const q = MEMORY_QUESTIONS.find(item => item.id === input.question_id);
    if (q) {
      q.votes_count += delta;
      return { success: true, new_count: q.votes_count };
    }
  } else if (input.answer_id) {
    const a = MEMORY_ANSWERS.find(item => item.id === input.answer_id);
    if (a) {
      a.votes_count += delta;
      return { success: true, new_count: a.votes_count };
    }
  }

  return { success: true, new_count: 1 };
}

/**
 * Mark answer as Accepted Answer
 */
export async function acceptAnswer(question_id: string, answer_id: string): Promise<boolean> {
  const q = MEMORY_QUESTIONS.find(item => item.id === question_id);
  if (q) {
    q.accepted_answer_id = answer_id;
    q.status = 'answered';
  }
  MEMORY_ANSWERS.forEach(a => {
    if (a.question_id === question_id) {
      a.is_accepted = (a.id === answer_id);
    }
  });
  return true;
}

/**
 * Submit moderation report
 */
export async function createCommunityReport(input: {
  reporter_id: string;
  reporter_email?: string;
  item_type: 'question' | 'answer' | 'comment';
  item_id: string;
  reason: CommunityReport['reason'];
  details?: string;
}): Promise<CommunityReport> {
  const report: CommunityReport = {
    id: `rep-${Date.now()}`,
    reporter_id: input.reporter_id,
    reporter_email: input.reporter_email,
    item_type: input.item_type,
    item_id: input.item_id,
    reason: input.reason,
    details: input.details,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  MEMORY_REPORTS.unshift(report);
  return report;
}

/**
 * Fetch Community Moderation Reports for Admin
 */
export async function getAdminCommunityReports(): Promise<CommunityReport[]> {
  return MEMORY_REPORTS;
}
