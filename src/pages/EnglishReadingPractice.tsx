import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CircleAlert,
  FileQuestion,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";

type Difficulty = "easy" | "medium" | "hard";
type QuestionType = "short" | "true_false" | "fill_blank" | "title";
type PracticeQuestion = { id: number; prompt: string; type: QuestionType };
type Practice = { passage: string; questions: PracticeQuestion[]; difficulty: Difficulty };
type Verdict = "correct" | "partial" | "incorrect";
type ReviewItem = {
  question_index: number;
  verdict: Verdict;
  correct_answer: string;
  mistake: string;
  feedback_ar: string;
  feedback_en: string;
};
type Review = {
  results: ReviewItem[];
  score: number;
  overall_feedback_ar: string;
  overall_feedback_en: string;
};

const COPY = {
  en: {
    badge: "English · Reading Practice",
    title: "Unseen Paragraph Trainer",
    description: "Generate an original passage, answer six questions, and learn exactly where you made a mistake.",
    topic: "Topic (optional)",
    topicPlaceholder: "e.g. teamwork, technology, school life",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    generate: "Create a paragraph",
    generating: "Writing your practice...",
    passage: "Read the passage carefully",
    answered: "answered",
    question: "Question",
    titleQuestion: "Title question",
    answerPlaceholder: "Write your answer in English...",
    check: "Check my answers",
    checking: "Checking every answer...",
    completeAll: "Answer all six questions before checking.",
    newPractice: "New paragraph",
    retry: "Try these questions again",
    score: "Your score",
    yourAnswer: "Your answer",
    expected: "Model answer",
    mistake: "Where the answer went wrong",
    correct: "Correct",
    partial: "Partly correct",
    incorrect: "Incorrect",
  },
  ar: {
    badge: "الإنجليزية · تدريب القطعة الخارجية",
    title: "مدرّب القطع الخارجية",
    description: "ولّد قطعة جديدة، أجب عن ستة أسئلة، واعرف بالضبط أين أخطأت في كل إجابة.",
    topic: "الموضوع (اختياري)",
    topicPlaceholder: "مثلاً: التعاون، التكنولوجيا، الحياة المدرسية",
    difficulty: "الصعوبة",
    easy: "سهل",
    medium: "متوسط",
    hard: "صعب",
    generate: "أنشئ قطعة جديدة",
    generating: "جاري كتابة التدريب...",
    passage: "اقرأ القطعة جيداً",
    answered: "تمت إجابتها",
    question: "السؤال",
    titleQuestion: "سؤال العنوان",
    answerPlaceholder: "اكتب إجابتك بالإنجليزية...",
    check: "صحّح إجاباتي",
    checking: "جاري تصحيح كل الإجابات...",
    completeAll: "أجب عن الأسئلة الستة قبل التصحيح.",
    newPractice: "قطعة جديدة",
    retry: "أعد محاولة هذه الأسئلة",
    score: "درجتك",
    yourAnswer: "إجابتك",
    expected: "الإجابة النموذجية",
    mistake: "موضع الخطأ في الإجابة",
    correct: "صحيحة",
    partial: "صحيحة جزئياً",
    incorrect: "غير صحيحة",
  },
} as const;

const verdictStyle: Record<Verdict, { icon: typeof CheckCircle2; classes: string }> = {
  correct: { icon: CheckCircle2, classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" },
  partial: { icon: CircleAlert, classes: "border-amber-500/30 bg-amber-500/10 text-amber-500" },
  incorrect: { icon: XCircle, classes: "border-rose-500/30 bg-rose-500/10 text-rose-500" },
};

function FacetCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`border border-white/15 bg-secondary/55 shadow-[0_24px_70px_rgba(15,23,42,.18)] backdrop-blur-xl ${className}`}
      style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}
    >
      {children}
    </div>
  );
}

async function invokeReading<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("english-reading-practice", { body });
  if (!error) return data as T;
  let message = error.message || "Request failed";
  const response = (error as unknown as { context?: unknown }).context;
  if (response instanceof Response) {
    try { message = (await response.json())?.error || message; } catch { /* keep fallback */ }
  }
  throw new Error(message);
}

export default function EnglishReadingPractice({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const text = COPY[language];
  const isArabic = language === "ar";
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [topic, setTopic] = useState("");
  const [practice, setPractice] = useState<Practice | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState<"generate" | "grade" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = useMemo(() => answers.filter((answer) => answer.trim()).length, [answers]);

  const generate = async () => {
    setLoading("generate");
    setError(null);
    setReview(null);
    try {
      const generated = await invokeReading<Practice>({ action: "generate", difficulty, topic });
      setPractice(generated);
      setAnswers(generated.questions.map(() => ""));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed");
    } finally {
      setLoading(null);
    }
  };

  const grade = async () => {
    if (!practice || answeredCount !== practice.questions.length) {
      setError(text.completeAll);
      return;
    }
    setLoading("grade");
    setError(null);
    try {
      const result = await invokeReading<Review>({
        action: "grade",
        passage: practice.passage,
        questions: practice.questions,
        answers,
      });
      setReview(result);
      window.setTimeout(() => document.getElementById("reading-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed");
    } finally {
      setLoading(null);
    }
  };

  const startOver = () => {
    setPractice(null);
    setAnswers([]);
    setReview(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const retry = () => {
    setReview(null);
    setAnswers(practice?.questions.map(() => "") ?? []);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 pb-28 pt-6 text-foreground sm:px-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,hsl(var(--primary)/.18),transparent_34%),radial-gradient(circle_at_92%_72%,hsl(var(--accent)/.16),transparent_36%)]" />
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <button onClick={practice ? startOver : onBack} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-secondary/60 text-muted-foreground backdrop-blur transition hover:border-primary/40 hover:text-foreground" aria-label={isArabic ? "رجوع" : "Back"}>
            {isArabic ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </button>
          {practice && <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">{answeredCount} / {practice.questions.length} {text.answered}</span>}
        </div>

        {!practice ? (
          <>
            <header className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" />{text.badge}</div>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">{text.title}</h1>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground sm:text-lg">{text.description}</p>
            </header>

            <FacetCard className="mx-auto mt-10 max-w-2xl p-5 sm:p-7">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">{text.topic}</span>
                <input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={120} placeholder={text.topicPlaceholder} className="h-14 w-full rounded-2xl border border-white/15 bg-background/60 px-4 outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10" />
              </label>
              <div className="mt-5">
                <p className="mb-2 text-sm font-bold">{text.difficulty}</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                    <button key={level} type="button" onClick={() => setDifficulty(level)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${difficulty === level ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_24px_hsl(var(--primary)/.12)]" : "border-white/10 bg-background/35 text-muted-foreground hover:border-primary/25"}`}>
                      {text[level]}
                    </button>
                  ))}
                </div>
              </div>
              {error && <ErrorBanner message={error} />}
              <button onClick={() => { void generate(); }} disabled={loading !== null} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-primary to-accent font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60">
                {loading === "generate" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileQuestion className="h-5 w-5" />}
                {loading === "generate" ? text.generating : text.generate}
              </button>
            </FacetCard>
          </>
        ) : (
          <div className="space-y-6">
            <header className="text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold text-primary"><BookOpen className="h-3.5 w-3.5" />{text.passage}</div>
              <h1 className="text-3xl font-black sm:text-4xl">{text.title}</h1>
            </header>

            <FacetCard className="p-6 sm:p-9">
              <p dir="ltr" className="text-left font-serif text-lg leading-9 text-foreground sm:text-xl sm:leading-10">{practice.passage}</p>
            </FacetCard>

            <section className="space-y-4">
              {practice.questions.map((question, index) => (
                <FacetCard key={question.id} className={`p-5 sm:p-6 ${question.type === "title" ? "border-primary/35 bg-primary/[0.08]" : ""}`}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-sm font-black text-primary">{index + 1}</span>
                    <span className="text-xs font-bold text-muted-foreground">{question.type === "title" ? text.titleQuestion : `${text.question} ${index + 1}`}</span>
                  </div>
                  <p dir="ltr" className="text-left text-base font-bold leading-7 sm:text-lg">{question.prompt}</p>
                  <textarea
                    dir="ltr"
                    rows={2}
                    value={answers[index] ?? ""}
                    disabled={!!review}
                    onChange={(event) => setAnswers((previous) => previous.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))}
                    placeholder={text.answerPlaceholder}
                    className="mt-4 w-full resize-none rounded-2xl border border-white/15 bg-background/55 p-4 text-left leading-7 outline-none transition placeholder:text-muted-foreground/45 focus:border-primary/55 focus:ring-4 focus:ring-primary/10 disabled:opacity-70"
                  />
                </FacetCard>
              ))}
            </section>

            {error && <ErrorBanner message={error} />}
            {!review && <button onClick={() => { void grade(); }} disabled={loading !== null || answeredCount !== practice.questions.length} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-400 to-primary font-black text-slate-950 shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45">
              {loading === "grade" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {loading === "grade" ? text.checking : text.check}
            </button>}

            {review && <Results language={language} review={review} questions={practice.questions} answers={answers} onNew={startOver} onRetry={retry} />}
          </div>
        )}
      </div>
    </main>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <div className="mt-5 flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-500"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /><span>{message}</span></div>;
}

function Results({ language, review, questions, answers, onNew, onRetry }: { language: AppLanguage; review: Review; questions: PracticeQuestion[]; answers: string[]; onNew: () => void; onRetry: () => void }) {
  const text = COPY[language];
  const feedback = language === "ar" ? review.overall_feedback_ar : review.overall_feedback_en;
  return (
    <section id="reading-results" className="scroll-mt-5 space-y-4">
      <FacetCard className="p-6 text-center sm:p-8">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-primary/15 text-3xl font-black text-primary">{Math.round(review.score * 10) / 10}</div>
        <h2 className="mt-4 text-2xl font-black">{text.score}: {Math.round(review.score * 10) / 10} / 6</h2>
        <p className="mx-auto mt-2 max-w-2xl leading-7 text-muted-foreground">{feedback}</p>
      </FacetCard>

      {questions.map((question, index) => {
        const item = review.results.find((result) => result.question_index === index + 1);
        if (!item) return null;
        const style = verdictStyle[item.verdict];
        const Icon = style.icon;
        const detail = language === "ar" ? item.feedback_ar : item.feedback_en;
        return (
          <FacetCard key={question.id} className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-black">{text.question} {index + 1}</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${style.classes}`}><Icon className="h-3.5 w-3.5" />{text[item.verdict]}</span>
            </div>
            <p dir="ltr" className="mt-3 text-left font-bold leading-7">{question.prompt}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-background/45 p-4"><p className="text-xs font-bold text-muted-foreground">{text.yourAnswer}</p><p dir="ltr" className="mt-1 text-left leading-7">{answers[index]}</p></div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4"><p className="text-xs font-bold text-emerald-500">{text.expected}</p><p dir="ltr" className="mt-1 text-left leading-7">{item.correct_answer}</p></div>
            </div>
            {item.mistake && <div className="mt-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4"><p className="text-xs font-black text-amber-500">{text.mistake}</p><p className="mt-1 text-sm leading-7">{item.mistake}</p></div>}
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{detail}</p>
          </FacetCard>
        );
      })}

      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={onRetry} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-secondary/60 px-5 py-3 font-black transition hover:border-primary/35"><RotateCcw className="h-4 w-4" />{text.retry}</button>
        <button onClick={onNew} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-primary to-accent px-5 py-3 font-black text-primary-foreground shadow-lg shadow-primary/15"><RefreshCw className="h-4 w-4" />{text.newPractice}</button>
      </div>
    </section>
  );
}
