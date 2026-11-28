import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Clock3, RotateCcw, X } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";
import { useCharacterPractice } from "@/hooks/useCharacterPractice";
import { recordMistake, resolveMistake } from "@/lib/mistakes";
import { loadQuickStudy, QUICK_STUDY_CHAPTER, QUICK_STUDY_SUBJECT, recommendQuickStudy } from "@/lib/quickStudy";
import { recordTopicPractice } from "@/lib/topicMastery";
import { cn } from "@/lib/utils";
import type { WeeklyLearningProfile } from "@/lib/weeklyLearning";

const copy = {
  ar: {
    chapter: "الفيزياء · الفصل الأول · المتسعات", choose: "شكد عندك وقت؟",
    minutes: "دقايق", fifteen: "دقيقة", one: "مراجعة وسؤال واحد", two: "مراجعة وسؤالين",
    loading: "دا نجهّز التدريب…", unavailable: "تعذّر تحميل الأسئلة. جرّب مرة ثانية.", empty: "ماكو أسئلة كافية للمراجعة السريعة هسه.",
    retry: "جرّب مرة ثانية", start: "ابدأ المراجعة", review: "راجع هالفكرة", sources: "من فلاش كاردات الفصل الأول", quiz: "ابدأ الأسئلة",
    plan: "من خطتك", mistake: "من أخطائك الأخيرة", next: "السؤال الجاي", check: "ثبّت الإجابة", result: "شوف النتيجة",
    right: "صح!", wrong: "تحتاج مراجعة", answer: "الجواب الصحيح",
    summary: "خلصت المراجعة السريعة", missed: "الأسئلة اللي تحتاج ترجع لها", allRight: "حليت كل أسئلة هالجولة صح.",
    reviewAgain: "راجع الفكرة مرة ثانية", back: "العودة للرئيسية",
  },
  en: {
    chapter: "Physics · Chapter 1 · Capacitors", choose: "How much time do you have?",
    minutes: "minutes", fifteen: "minutes", one: "Review and one question", two: "Review and two questions",
    loading: "Preparing your practice…", unavailable: "Could not load the questions. Try again.", empty: "There aren’t enough questions for quick study right now.",
    retry: "Try again", start: "Start review", review: "Review the topic", sources: "From the Chapter 1 flashcards", quiz: "Start questions",
    plan: "From your plan", mistake: "From your recent mistakes", next: "Next question", check: "Check answer", result: "See result",
    right: "Correct!", wrong: "Needs review", answer: "Correct answer",
    summary: "Quick study complete", missed: "Questions to revisit", allRight: "You got every question in this round right.",
    reviewAgain: "Review the topic again", back: "Back to home",
  },
} as const;

const panel = "rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6";
const primary = "min-h-12 w-full gap-2 rounded-xl font-bold";
type Phase = "setup" | "review" | "quiz" | "summary";
type Recommendation = NonNullable<ReturnType<typeof recommendQuickStudy>>;

export default function QuickStudy({ language, userId, plannedTexts, profile, onBack }: {
  language: AppLanguage;
  userId: string | null;
  plannedTexts: string[];
  profile: WeeklyLearningProfile | null;
  onBack: () => void;
}) {
  const t = copy[language];
  const ar = language === "ar";
  const n = (value: number) => new Intl.NumberFormat(ar ? "ar-IQ" : "en").format(value);
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const [minutes, setMinutes] = useState<5 | 15>(15);
  const [phase, setPhase] = useState<Phase>("setup");
  const [round, setRound] = useState<Recommendation | null>(null);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const query = useQuery({
    queryKey: ["quick-study", language, userId],
    queryFn: () => loadQuickStudy(language, userId),
    retry: false,
  });
  const recommendation = query.data && recommendQuickStudy({
    ...query.data, plannedTexts, profile, language, count: minutes === 5 ? 1 : 2,
  });
  const topic = round ?? recommendation;
  const question = round?.questions[index];
  const checked = answers[index] !== undefined;
  const correct = checked && answers[index] === question?.answer_index;
  useCharacterPractice(phase === "quiz" && Boolean(question));

  useEffect(() => {
    if (phase === "setup") return;
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [phase, index]);

  const start = () => {
    if (!recommendation) return;
    setRound(recommendation);
    setPhase("review");
  };

  const startQuiz = () => {
    setAnswers([]);
    setChoice(null);
    setIndex(0);
    setPhase("quiz");
  };

  const check = () => {
    if (!question || choice === null || checked) return;
    const isCorrect = choice === question.answer_index;
    setAnswers(previous => [...previous, choice]);
    void recordTopicPractice({ subject: QUICK_STUDY_SUBJECT, chapter: QUICK_STUDY_CHAPTER,
      question: question.question, context: question.section ?? "", source: "mcq_bank", correct: isCorrect });
    if (isCorrect) {
      const previous = query.data?.mistakes.find(mistake => mistake.ref_id === question.id);
      if (previous) void resolveMistake(previous.id, true);
    } else {
      void recordMistake({ source: "mcq_bank", subject: QUICK_STUDY_SUBJECT, chapter: String(QUICK_STUDY_CHAPTER), language,
        refId: question.id, question: question.question, choices: question.choices, userAnswer: question.choices[choice],
        correctAnswer: question.choices[question.answer_index], explanation: question.explanation });
    }
  };

  const advance = () => {
    if (!checked || !round) return;
    if (index + 1 === round.questions.length) setPhase("summary");
    else {
      setChoice(null);
      setIndex(index + 1);
    }
  };

  const missed = round?.questions.filter((item, i) => answers[i] !== item.answer_index) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#102749] via-[#19447b] to-[#135678] p-5 text-white shadow-[0_18px_38px_-24px_#0d467e] sm:p-7">
        <div className="flex items-center gap-3 text-sm font-semibold text-sky-100">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15"><Clock3 aria-hidden="true" className="size-5" /></span>
          <span>{t.chapter}</span>
        </div>
        {topic && <p className="mt-3 text-2xl font-black leading-snug sm:text-3xl">{topic.title}</p>}
        {phase === "setup" && topic && topic.reason !== "chapter" && <p className="mt-1.5 text-sm text-sky-100">{t[topic.reason]}</p>}
      </section>

      {phase === "setup" && <section className={panel}>
        <fieldset>
          <legend className="mb-3 font-black">{t.choose}</legend>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {([5, 15] as const).map(duration => <button key={duration} type="button" aria-pressed={minutes === duration} onClick={() => setMinutes(duration)}
              className="min-h-24 rounded-2xl border border-border bg-background p-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary aria-pressed:border-primary aria-pressed:bg-primary/10">
              <span className="block text-lg font-black">{n(duration)} {duration === 5 ? t.minutes : t.fifteen}</span>
              <span className="mt-1 block text-xs font-semibold text-muted-foreground sm:text-sm">{duration === 5 ? t.one : t.two}</span>
            </button>)}
          </div>
        </fieldset>
        {query.isPending ? <p role="status" className="mt-4 text-sm text-muted-foreground">{t.loading}</p> : query.isError && !query.data ? (
          <div className="mt-4 space-y-2"><p role="alert" className="text-sm text-muted-foreground">{t.unavailable}</p><Button variant="outline" className={primary} onClick={() => void query.refetch()} disabled={query.isFetching}>{t.retry}</Button></div>
        ) : recommendation ? <Button className={cn(primary, "mt-4")} onClick={start}>{t.start}<Arrow aria-hidden="true" className="size-4" /></Button>
          : <p role="status" className="mt-4 text-sm text-muted-foreground">{t.empty}</p>}
      </section>}

      {phase === "review" && round && <section className={panel}>
        <h2 ref={heading} tabIndex={-1} className="flex items-center gap-2 text-xl font-black outline-none"><BookOpen aria-hidden="true" className="size-5 text-primary" />{t.review}</h2>
        <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-background/70">
          {round.cards.map(card => <div key={card.q} className="p-3.5 sm:p-4"><h3 className="font-bold" dir="auto">{card.q}</h3><p className="mt-1 whitespace-pre-line text-sm leading-7 text-muted-foreground" dir="auto">{card.a}</p></div>)}
        </div>
        <p className="mb-4 mt-2 text-xs text-muted-foreground">{t.sources}</p>
        <Button className={primary} onClick={startQuiz}>{t.quiz}<Arrow aria-hidden="true" className="size-4" /></Button>
      </section>}

      {phase === "quiz" && round && question && <section className={panel}>
        <p className="mb-2 text-xs font-bold text-primary">{ar ? `السؤال ${n(index + 1)} من ${n(round.questions.length)}` : `Question ${index + 1} of ${round.questions.length}`}</p>
        <h2 ref={heading} tabIndex={-1} dir="auto" className="text-lg font-black leading-8 outline-none sm:text-xl">{question.question}</h2>
        <div className="mt-4 grid gap-2">
          {question.choices.map((option, i) => {
            const isAnswer = checked && i === question.answer_index;
            return <button key={i} type="button" aria-pressed={choice === i} disabled={checked} onClick={() => setChoice(i)}
              className={cn("flex min-h-12 items-center gap-3 rounded-xl border px-3.5 py-2 text-start text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isAnswer ? "border-emerald-500/60 bg-emerald-500/10" : checked && choice === i ? "border-destructive/55 bg-destructive/10" : choice === i ? "border-primary bg-primary/10" : "border-border bg-background")}>
              <span className="min-w-0 flex-1" dir="auto">{option}</span>
              {isAnswer ? <Check aria-hidden="true" className="size-4 shrink-0 text-emerald-600" /> : checked && choice === i ? <X aria-hidden="true" className="size-4 shrink-0 text-destructive" /> : null}
            </button>;
          })}
        </div>
        {checked && <div role="status" className="mt-4 rounded-xl bg-secondary/65 p-3 text-sm leading-7">
          <p className="font-black">{correct ? t.right : t.wrong}</p>
          {!correct && <p>{t.answer} <bdi className="font-bold">{question.choices[question.answer_index]}</bdi></p>}
          {question.explanation && <p dir="auto" className="whitespace-pre-line text-muted-foreground">{question.explanation}</p>}
        </div>}
        <Button className={cn(primary, "mt-4")} onClick={checked ? advance : check} disabled={choice === null}>
          {checked ? index + 1 === round.questions.length ? t.result : t.next : t.check}<Arrow aria-hidden="true" className="size-4" />
        </Button>
      </section>}

      {phase === "summary" && round && <section className={panel}>
        <h2 ref={heading} tabIndex={-1} className="text-xl font-black outline-none">{t.summary}</h2>
        <p className="mt-3 text-2xl font-black text-primary" role="status">{ar
          ? `${n(round.questions.length - missed.length)} من ${n(round.questions.length)} صحيحة`
          : `${round.questions.length - missed.length} of ${round.questions.length} correct`}</p>
        {missed.length ? <div className="mt-4"><h3 className="mb-2 text-sm font-bold">{t.missed}</h3>
          <ul className="space-y-2">{missed.map(item => <li key={item.id} className="rounded-xl border border-border bg-background p-3 text-sm leading-6">
            <p dir="auto" className="font-bold">{item.question}</p><p className="text-muted-foreground">{t.answer} <bdi>{item.choices[item.answer_index]}</bdi></p>
          </li>)}</ul></div> : <p className="mt-3 text-sm text-muted-foreground">{t.allRight}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button className="min-h-11 flex-1 gap-2 font-bold" onClick={onBack}>{t.back}<ChevronRight aria-hidden="true" className={cn("size-4", ar && "rotate-180")} /></Button>
          {!!missed.length && <Button variant="outline" className="min-h-11 flex-1 gap-2 font-bold" onClick={() => setPhase("review")}><RotateCcw aria-hidden="true" className="size-4" />{t.reviewAgain}</Button>}
        </div>
      </section>}
    </div>
  );
}
