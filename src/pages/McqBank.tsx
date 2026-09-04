import { useCallback, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X, Loader2, HelpCircle, Trophy, Frown, RotateCcw, CalendarClock, Sparkles, Layers3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";
import { showAward } from "@/lib/points";
import { recordMistake } from "@/lib/mistakes";
import { getBuiltInPhysicsCh2 } from "@/lib/physicsChapter2Mcqs";

type Row = {
  id: string;
  subject: string;
  chapter: number;
  chapter_title: string | null;
  question: string;
  choices: unknown;
  answer_index: number;
  explanation: string | null;
};

const SUBJECT_LABELS: Record<string, { ar: string; en: string; emoji: string }> = {
  physics: { ar: "الفيزياء", en: "Physics", emoji: "🧲" },
  chemistry: { ar: "الكيمياء", en: "Chemistry", emoji: "⚗️" },
  biology: { ar: "الأحياء", en: "Biology", emoji: "🧬" },
  english: { ar: "الإنجليزية", en: "English", emoji: "🔤" },
  french: { ar: "الفرنسية", en: "French", emoji: "🇫🇷" },
  arabic: { ar: "العربية", en: "Arabic", emoji: "📖" },
  islamic: { ar: "التربية الإسلامية", en: "Islamic", emoji: "🕌" },
  math: { ar: "الرياضيات", en: "Math", emoji: "➗" },
};

const SUBJECT_STYLES: Record<string, { card: string; icon: string; glow: string }> = {
  physics: { card: "border-sky-500/25 bg-sky-500/10 hover:border-sky-400/60", icon: "bg-sky-500/15 text-sky-500", glow: "bg-sky-500/15" },
  chemistry: { card: "border-orange-500/25 bg-orange-500/10 hover:border-orange-400/60", icon: "bg-orange-500/15 text-orange-500", glow: "bg-orange-500/15" },
  biology: { card: "border-lime-500/25 bg-lime-500/10 hover:border-lime-400/60", icon: "bg-lime-500/15 text-lime-600 dark:text-lime-400", glow: "bg-lime-500/15" },
  english: { card: "border-blue-500/25 bg-blue-500/10 hover:border-blue-400/60", icon: "bg-blue-500/15 text-blue-500", glow: "bg-blue-500/15" },
  french: { card: "border-violet-500/25 bg-violet-500/10 hover:border-violet-400/60", icon: "bg-violet-500/15 text-violet-500", glow: "bg-violet-500/15" },
  arabic: { card: "border-rose-500/25 bg-rose-500/10 hover:border-rose-400/60", icon: "bg-rose-500/15 text-rose-500", glow: "bg-rose-500/15" },
  islamic: { card: "border-emerald-500/25 bg-emerald-500/10 hover:border-emerald-400/60", icon: "bg-emerald-500/15 text-emerald-500", glow: "bg-emerald-500/15" },
  math: { card: "border-indigo-500/25 bg-indigo-500/10 hover:border-indigo-400/60", icon: "bg-indigo-500/15 text-indigo-500", glow: "bg-indigo-500/15" },
};

const subjectLabel = (s: string, isAr: boolean) => {
  const m = SUBJECT_LABELS[s?.toLowerCase?.() ?? ""];
  return m ? (isAr ? m.ar : m.en) : s;
};

function celebrate() {
  confetti({ particleCount: 90, spread: 80, startVelocity: 45, origin: { y: 0.4 } });
  setTimeout(() => confetti({ particleCount: 60, spread: 110, origin: { y: 0.5 } }), 220);
}

export default function McqBank({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const isAr = language === "ar";
  const lang = isAr ? "ar" : "en";
  const Back = isAr ? ArrowRight : ArrowLeft;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<string | null>(null);
  const [chapter, setChapter] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [delta, setDelta] = useState(0);
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  const [dueQuestionIds, setDueQuestionIds] = useState<string[]>([]);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data }, dueResult] = await Promise.all([
        supabase
          .from("mcq_banks")
          .select("id, subject, chapter, chapter_title, question, choices, answer_index, explanation")
          .eq("language", lang)
          .order("subject", { ascending: true })
          .order("chapter", { ascending: true })
          .order("sort_order", { ascending: true })
          .limit(2000),
        (supabase as any).rpc("get_due_mcq_bank_reviews"),
      ]);
      const databaseRows = (data ?? []) as Row[];
      const existingQuestions = new Set(databaseRows.map((row) => row.question.trim()));
      const chapterTwoFallback = getBuiltInPhysicsCh2(lang).filter(
        (row) => !existingQuestions.has(row.question.trim()),
      );
      setRows([...databaseRows, ...chapterTwoFallback]);
      setDueQuestionIds(((dueResult.data ?? []) as { question_id: string }[]).map((r) => r.question_id));
      setLoading(false);
    })();
  }, [lang]);

  const subjects = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.subject, (map.get(r.subject) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const chapters = useMemo(() => {
    if (!subject) return [] as { chapter: number; title: string | null; count: number }[];
    const map = new Map<number, { chapter: number; title: string | null; count: number }>();
    rows.filter((r) => r.subject === subject).forEach((r) => {
      const cur = map.get(r.chapter) ?? { chapter: r.chapter, title: r.chapter_title, count: 0 };
      cur.count += 1;
      map.set(r.chapter, cur);
    });
    return [...map.values()].sort((a, b) => a.chapter - b.chapter);
  }, [rows, subject]);

  const dueRows = useMemo(
    () => rows.filter((r) => dueQuestionIds.includes(r.id)),
    [rows, dueQuestionIds],
  );
  const quiz = useMemo(
    () => reviewing ? dueRows : rows.filter((r) => r.subject === subject && r.chapter === chapter),
    [rows, subject, chapter, reviewing, dueRows],
  );
  const current = quiz[index];
  const choices = useMemo(
    () => (Array.isArray(current?.choices) ? (current!.choices as unknown[]).map(String) : []),
    [current],
  );

  const resetQ = () => { setPicked(null); setAnswerIndex(null); setExplanation(null); setDelta(0); };

  const submit = useCallback(async (choice: number) => {
    if (!current || picked !== null || submitting) return;
    setSubmitting(true);
    setPicked(choice);
    const { data, error } = await supabase.rpc("answer_mcq_bank", {
      _question_id: current.id,
      _choice_index: choice,
    });
    setSubmitting(false);
    const res = (data ?? null) as null | {
      correct: boolean; answer_index: number; explanation: string | null; points: number;
    };
    const saveMistake = (correctIdx: number) => {
      void recordMistake({
        source: "mcq_bank",
        refId: current.id,
        question: current.question,
        subject: current.subject,
        chapter: String(current.chapter),
        language: lang,
        choices,
        correctAnswer: choices[correctIdx],
        userAnswer: choices[choice],
        explanation: current.explanation,
      });
    };
    if (error || !res) {
      // fall back to local check so the user still gets feedback
      const ok = choice === current.answer_index;
      setAnswerIndex(current.answer_index);
      setExplanation(current.explanation);
      setScore((s) => ({ right: s.right + (ok ? 1 : 0), wrong: s.wrong + (ok ? 0 : 1) }));
      if (ok) celebrate(); else saveMistake(current.answer_index);
      return;
    }
    setAnswerIndex(res.answer_index);
    setExplanation(res.explanation ?? current.explanation);
    setDelta(res.points);
    setScore((s) => ({ right: s.right + (res.correct ? 1 : 0), wrong: s.wrong + (res.correct ? 0 : 1) }));
    if (res.correct) {
      celebrate();
      if (res.points > 0) showAward("mcq", res.points);
    } else {
      saveMistake(res.answer_index);
      if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
    }
  }, [current, picked, submitting, choices, lang]);

  const next = () => { resetQ(); setIndex((i) => Math.min(i + 1, quiz.length - 1)); };
  const restart = () => { resetQ(); setIndex(0); setScore({ right: 0, wrong: 0 }); };

  const header = (title: string, back: () => void) => (
    <div className="mb-6 flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={back} aria-label={isAr ? "رجوع" : "Back"} className="h-10 w-10 rounded-xl border-border/70 bg-card/70 shadow-sm">
        <Back className="w-5 h-5" />
      </Button>
      <h1 className="truncate text-xl font-black md:text-2xl">{title}</h1>
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center" dir={isAr ? "rtl" : "ltr"}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </main>
    );
  }

  // ---- Subject picker ----
  if (!subject && !reviewing) {
    return (
      <main className="relative min-h-screen overflow-hidden px-4 py-6 pb-28 md:py-10" dir={isAr ? "rtl" : "ltr"}>
        <div aria-hidden="true" className="pointer-events-none absolute -top-28 -end-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
        {header(isAr ? "بنك الأسئلة" : "MCQ Bank", onBack)}
        <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/15 via-card/90 to-cyan-500/10 p-6 shadow-[0_24px_70px_-45px_hsl(var(--primary)/0.65)] md:p-8">
          <div aria-hidden="true" className="absolute -end-10 -top-12 h-40 w-40 rounded-full border-[24px] border-primary/10" />
          <div className="relative max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" />{isAr ? "تدرّب، راجع، وتفوّق" : "Practice, review, excel"}</span>
            <h2 className="text-2xl font-black tracking-tight md:text-4xl">{isAr ? "اختبر فهمك بذكاء" : "Master every question"}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{isAr ? "اختار المادة والفصل، وجاوب خطوة بخطوة. أخطاؤك تنحفظ تلقائياً حتى ترجع تراجعها." : "Choose a subject and chapter, answer at your pace, and revisit missed questions automatically."}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full border border-border/70 bg-background/55 px-3 py-1.5">{rows.length} {isAr ? "سؤال متاح" : "questions"}</span>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-emerald-600 dark:text-emerald-300">+5 {isAr ? "نقاط للإجابة الصحيحة" : "points per correct answer"}</span>
            </div>
          </div>
        </section>
        {dueRows.length > 0 && (
          <button
            type="button"
            onClick={() => { setReviewing(true); setIndex(0); resetQ(); setScore({ right: 0, wrong: 0 }); }}
            className="mb-6 flex w-full items-center justify-between rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-500/15 to-orange-500/5 p-4 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-400/70"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/15"><CalendarClock className="h-5 w-5 text-amber-500" /></span>
              <span>
                <span className="block font-semibold">{isAr ? "أسئلة للمراجعة" : "Questions to review"}</span>
                <span className="block text-xs text-muted-foreground mt-1">
                  {isAr ? "أسئلة أخطأت فيها وأصبحت جاهزة للمراجعة الآن" : "Questions you missed that are ready to review now"}
                </span>
              </span>
            </span>
            <span className="rounded-full bg-amber-500 px-3 py-1 text-sm font-black text-slate-950">{dueRows.length}</span>
          </button>
        )}
        {subjects.length === 0 ? (
          <p className="text-muted-foreground">{isAr ? "لا توجد أسئلة بعد." : "No questions yet."}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {subjects.map(([s, count]) => {
              const style = SUBJECT_STYLES[s] ?? { card: "border-primary/25 bg-primary/10 hover:border-primary/60", icon: "bg-primary/15 text-primary", glow: "bg-primary/15" };
              return (
              <motion.button
                key={s}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSubject(s); setChapter(null); }}
                className={`group relative min-h-40 overflow-hidden rounded-2xl border p-4 text-start shadow-sm backdrop-blur transition-all hover:shadow-lg md:p-5 ${style.card}`}
              >
                <span aria-hidden="true" className={`absolute -end-7 -top-7 h-24 w-24 rounded-full blur-2xl ${style.glow}`} />
                <div className={`relative mb-5 grid h-12 w-12 place-items-center rounded-2xl text-2xl shadow-sm ${style.icon}`}>{SUBJECT_LABELS[s]?.emoji ?? "📚"}</div>
                <div className="relative font-extrabold">{subjectLabel(s, isAr)}</div>
                <div className="relative mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                  {count} {isAr ? "سؤال" : "questions"}
                  </span>
                  <ArrowRight className={`h-4 w-4 opacity-45 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                </div>
              </motion.button>
            )})}
          </div>
        )}
        </div>
      </main>
    );
  }

  // ---- Chapter picker ----
  if (chapter === null && !reviewing) {
    return (
      <main className="relative min-h-screen overflow-hidden px-4 py-6 pb-28 md:py-10" dir={isAr ? "rtl" : "ltr"}>
        <div aria-hidden="true" className="pointer-events-none absolute -top-28 -end-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
        {header(subjectLabel(subject, isAr), () => setSubject(null))}
        <div className="mb-5 rounded-2xl border border-border/70 bg-card/70 p-5">
          <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Layers3 className="h-5 w-5" /></span>
          <h2 className="text-xl font-black">{isAr ? "اختار الفصل" : "Choose a chapter"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{isAr ? "كل فصل مرتب وعدد أسئلته واضح قبل ما تبدأ." : "See each chapter and its question count before you begin."}</p>
        </div>
        <div className="grid gap-3">
          {chapters.map((c) => (
            <motion.button
              key={c.chapter}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { setChapter(c.chapter); setIndex(0); resetQ(); setScore({ right: 0, wrong: 0 }); }}
              className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card/75 p-4 text-start shadow-sm transition-all hover:border-primary/60 hover:shadow-md"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 font-mono text-lg font-black text-primary">{c.chapter}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold">{isAr ? `الفصل ${c.chapter}` : `Chapter ${c.chapter}`}</span>
                {c.title ? <span className="mt-0.5 block truncate text-sm text-muted-foreground">{c.title}</span> : null}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">{c.count} {isAr ? "سؤال" : "Q"}</span>
              <ArrowRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </motion.button>
          ))}
        </div>
        </div>
      </main>
    );
  }

  // ---- Quiz ----
  const finished = index >= quiz.length - 1 && picked !== null;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-5 pb-32 md:py-8" dir={isAr ? "rtl" : "ltr"}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto max-w-2xl">
      {header(
        reviewing
          ? (isAr ? "أسئلة للمراجعة" : "Questions to review")
          : `${subjectLabel(subject!, isAr)} · ${isAr ? `الفصل ${chapter}` : `Chapter ${chapter}`}`,
        () => {
          if (reviewing) setReviewing(false);
          else setChapter(null);
          resetQ();
        },
      )}

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full border border-border/70 bg-card/75 px-3 py-1.5 text-xs font-bold text-muted-foreground">
            {isAr ? `السؤال ${index + 1} من ${quiz.length}` : `Question ${index + 1} of ${quiz.length}`}
          </span>
          <span className="flex items-center gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1.5 text-emerald-600 dark:text-emerald-300"><Check className="h-3.5 w-3.5" />{score.right}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1.5 text-rose-600 dark:text-rose-300"><X className="h-3.5 w-3.5" />{score.wrong}</span>
          </span>
        </div>
        <div className="mb-6 h-2 overflow-hidden rounded-full border border-border/50 bg-secondary/70">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
            animate={{ width: `${((index + 1) / Math.max(quiz.length, 1)) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        {current && (
          <motion.div key={current.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="relative mb-5 overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-card/95 to-card p-5 shadow-[0_20px_60px_-42px_hsl(var(--primary)/0.75)] md:p-7">
              <div aria-hidden="true" className="absolute -end-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-xl" />
              <div className="relative flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><HelpCircle className="h-5 w-5" /></span>
                <div>
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-primary">{isAr ? "اختار الإجابة الصحيحة" : "Choose the correct answer"}</span>
                  <p className="text-base font-bold leading-8 md:text-lg">{current.question}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {choices.map((c, i) => {
                const revealed = picked !== null;
                const isAnswer = revealed && answerIndex === i;
                const isWrongPick = revealed && picked === i && answerIndex !== i;
                return (
                  <motion.button
                    key={i}
                    disabled={revealed || submitting}
                    onClick={() => submit(i)}
                    whileTap={!revealed ? { scale: 0.98 } : undefined}
                    animate={isWrongPick ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                    className={`group flex min-h-16 items-center gap-3 rounded-2xl border p-3.5 text-start shadow-sm transition-all md:p-4
                      ${isAnswer ? "border-emerald-500/70 bg-emerald-500/12 shadow-emerald-500/10"
                        : isWrongPick ? "border-rose-500/70 bg-rose-500/12 shadow-rose-500/10"
                        : "border-border/70 bg-card/75 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 hover:shadow-md"}`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-xs font-black transition-colors ${isAnswer ? "border-emerald-500 bg-emerald-500 text-white" : isWrongPick ? "border-rose-500 bg-rose-500 text-white" : "border-border bg-secondary text-muted-foreground group-hover:border-primary/40 group-hover:text-primary"}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 font-medium leading-relaxed">{c}</span>
                    {submitting && picked === i && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {isAnswer && <Check className="w-5 h-5 text-emerald-500" />}
                    {isWrongPick && <X className="w-5 h-5 text-rose-500" />}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {picked !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-5 rounded-[1.75rem] border p-5 text-center shadow-sm md:p-6 ${
                    answerIndex === picked ? "border-emerald-500/50 bg-emerald-500/10" : "border-rose-500/50 bg-rose-500/10"
                  }`}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 14 }}
                    className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-background/60 shadow-sm"
                  >
                    {answerIndex === picked
                      ? <Trophy className="w-8 h-8 text-emerald-500" />
                      : <Frown className="w-8 h-8 text-rose-500" />}
                  </motion.div>
                  <p className="font-bold text-lg">
                    {answerIndex === picked
                      ? (isAr ? "إجابة صحيحة! 🎉" : "Correct! 🎉")
                      : (isAr ? "إجابة خاطئة 😕" : "Wrong answer 😕")}
                  </p>
                  {delta !== 0 && (
                    <motion.p
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className={`mt-1 font-extrabold text-2xl ${delta > 0 ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {delta > 0 ? `+${delta}` : delta} {isAr ? "نقطة" : "pts"}
                    </motion.p>
                  )}
                  {explanation && <p className="mt-2 text-sm text-muted-foreground">{explanation}</p>}

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {!finished ? (
                      <Button onClick={next} size="lg" className="min-w-44 rounded-xl">
                        {isAr ? "السؤال التالي" : "Next question"}
                        <ArrowRight className={`ms-2 h-4 w-4 ${isAr ? "rotate-180" : ""}`} />
                      </Button>
                    ) : (
                      <>
                        <Button onClick={restart} variant="secondary">
                          <RotateCcw className="w-4 h-4 me-1" />{isAr ? "إعادة" : "Restart"}
                        </Button>
                        <Button onClick={() => { setReviewing(false); setChapter(null); resetQ(); }}>
                          {reviewing ? (isAr ? "العودة للبنك" : "Back to bank") : (isAr ? "فصل آخر" : "Another chapter")}
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      </div>
    </main>
  );
}
