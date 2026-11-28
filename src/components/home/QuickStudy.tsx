import { useEffect, useId, useRef, useState } from "react";
import { skipToken, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Clock3, Eye, RotateCcw, X } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { TextStudyContent } from "@/components/TextStudyContent";
import { Button } from "@/components/ui/button";
import { useCharacterPractice } from "@/hooks/useCharacterPractice";
import { recordMistake, resolveMistake } from "@/lib/mistakes";
import { loadQuickStudy, quickStudyAnswer, QUICK_STUDY_COUNTS, recommendQuickStudy, type ReviewCard } from "@/lib/quickStudy";
import { getQuickStudyChapters, getQuickStudyProgressScope, QUICK_STUDY_SUBJECTS, type QuickStudySelection } from "@/lib/quickStudySources";
import { recordTopicPractice } from "@/lib/topicMastery";
import { cn } from "@/lib/utils";
import type { WeeklyLearningProfile } from "@/lib/weeklyLearning";

const copy = {
  ar: {
    intro: "اختار المادة والفصل اللي تريد تراجعه هسه",
    subject: "المادة", subjectPlaceholder: "اختار المادة", chapter: "الفصل أو الوحدة", chapterPlaceholder: "اختار الفصل أو الوحدة",
    choose: "شكد عندك وقت؟", minutes: "دقايق", fifteen: "دقيقة", cardsUnit: "فلاش كارد", mcqUnit: "سؤال MCQ",
    loading: "دا نجهّز مراجعة الفصل…", unavailable: "تعذّر تحميل مراجعة الفصل. جرّب مرة ثانية.",
    empty: "ماكو تدريب متوفر لهالفصل حاليًا.",
    retry: "جرّب مرة ثانية", start: "ابدأ المراجعة", review: "راجع قبل ما تجاوب", quiz: "ابدأ الأسئلة",
    plan: "من خطتك", mistake: "من أخطائك الأخيرة", next: "السؤال الجاي", check: "ثبّت الإجابة", result: "شوف النتيجة",
    right: "صح!", wrong: "تحتاج مراجعة", answer: "الجواب الصحيح",
    reveal: "اكشف الجواب", hide: "اخفِ الجواب", previousCard: "البطاقة السابقة", nextCard: "البطاقة الجاية",
    summary: "خلصت المراجعة السريعة", missed: "الأسئلة اللي تحتاج ترجع لها",
    practice: "اختيار من متعدد · تدريب الفصل", cardPractice: "اختيار من متعدد · من بطاقات الفصل",
    reviewAgain: "أعيد المراجعة", change: "اختيار فصل", back: "العودة للرئيسية",
    flashcard: "فلاش كارد", ministerial: "من بنك الوزاريات", exercise: "تمرين مراجعة", mcq: "بنك الاختيار من متعدد",
  },
  en: {
    intro: "Choose what to review right now",
    subject: "Subject", subjectPlaceholder: "Choose a subject", chapter: "Chapter or unit", chapterPlaceholder: "Choose a chapter or unit",
    choose: "How much time do you have?", minutes: "minutes", fifteen: "minutes", cardsUnit: "flashcards", mcqUnit: "MCQs",
    loading: "Preparing this chapter’s review…", unavailable: "Could not load this chapter’s review. Try again.",
    empty: "Quick practice is currently unavailable for this chapter.",
    retry: "Try again", start: "Start review", review: "Review before answering", quiz: "Start questions",
    plan: "From your plan", mistake: "From your recent mistakes", next: "Next question", check: "Check answer", result: "See result",
    right: "Correct!", wrong: "Needs review", answer: "Correct answer",
    reveal: "Reveal answer", hide: "Hide answer", previousCard: "Previous card", nextCard: "Next card",
    summary: "Quick study complete", missed: "Questions to revisit",
    practice: "Multiple choice · Chapter practice", cardPractice: "Multiple choice · From chapter cards",
    reviewAgain: "Review again", change: "Choose a chapter", back: "Back to home",
    flashcard: "Flashcard", ministerial: "From the ministerial bank", exercise: "Review exercise", mcq: "Multiple-choice bank",
  },
} as const;

const panel = "rounded-3xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-6";
const primary = "min-h-12 w-full gap-2 rounded-xl text-base font-bold";
const progressBar = "block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-muted [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary";
const selectControl = "w-full appearance-none rounded-xl border border-border bg-background py-3 ps-3 pe-9 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-55";
type Phase = "setup" | "review" | "quiz" | "summary";
type Recommendation = NonNullable<ReturnType<typeof recommendQuickStudy>>;

function CardAnswer({ card }: { card: ReviewCard }) {
  return card.answerBlocks?.length
    ? <TextStudyContent blocks={card.answerBlocks} />
    : <p className="whitespace-pre-line break-words text-sm leading-7" dir="auto">{card.a}</p>;
}

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
  const [subject, setSubject] = useState<QuickStudySelection["subject"] | "">("");
  const [chapter, setChapter] = useState("");
  const [minutes, setMinutes] = useState<5 | 15>(15);
  const [phase, setPhase] = useState<Phase>("setup");
  const [round, setRound] = useState<Recommendation | null>(null);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const subjectSelect = useRef<HTMLSelectElement>(null);
  const subjectId = useId();
  const chapterId = useId();
  const chapters = getQuickStudyChapters(subject);
  const subjectTitle = QUICK_STUDY_SUBJECTS.find(item => item.id === subject)?.[language];
  const chapterTitle = chapters.find(item => item.key === chapter)?.[language];
  const selection = subject && chapterTitle ? { subject, chapter } : null;
  const showChapterNumbers = subject === "physics" || subject === "chemistry" || subject === "biology" || subject === "math";
  const query = useQuery({
    queryKey: ["quick-study", subject, chapter, language, userId],
    queryFn: selection ? ({ signal }) => loadQuickStudy(selection, language, userId, signal) : skipToken,
    staleTime: 3 * 60 * 1000,
    retry: false,
  });
  const recommendation = phase === "setup" && query.data && selection && recommendQuickStudy({
    selection, data: query.data, plannedTexts, profile, language, count: QUICK_STUDY_COUNTS[minutes],
  });
  const topic = round ?? recommendation;
  const card = round?.cards[index];
  const question = round?.questions[index];
  const checked = answers[index] !== undefined;
  const correct = answers[index];
  useCharacterPractice(phase === "quiz" && Boolean(question));

  useEffect(() => {
    if (phase === "setup") return;
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [phase, index]);

  const start = () => {
    if (!recommendation) return;
    setRound(recommendation);
    setRevealed(false);
    setIndex(0);
    setPhase("review");
  };

  const startQuiz = () => {
    setAnswers([]);
    setChoice(null);
    setRevealed(false);
    setIndex(0);
    setPhase("quiz");
  };

  const grade = (isCorrect: boolean) => {
    if (!question || !round || checked) return;
    setAnswers(previous => [...previous, isCorrect]);
    if (!userId) return;
    const scope = getQuickStudyProgressScope(round.selection);
    const answer = quickStudyAnswer(question);
    void recordTopicPractice({ ...scope, question: question.question, context: question.section ?? "", source: "mcq_bank", correct: isCorrect });
    if (isCorrect) {
      const previous = round.mistakes.find(mistake => mistake.ref_id === question.id);
      if (previous) void resolveMistake(previous.id, true);
    } else {
      void recordMistake({ ...scope, source: "mcq_bank", language,
        refId: question.id, question: question.question, choices: question.choices,
        userAnswer: choice !== null ? question.choices[choice] : undefined,
        correctAnswer: answer, explanation: question.explanation });
    }
  };

  const moveCard = (step: -1 | 1) => {
    if (!round) return;
    setRevealed(false);
    setIndex(current => Math.max(0, Math.min(current + step, round.cards.length - 1)));
  };

  const advance = () => {
    if (!checked || !round) return;
    if (index + 1 === round.questions.length) setPhase("summary");
    else {
      setChoice(null);
      setIndex(index + 1);
    }
  };

  const changeChapter = () => {
    setRound(null);
    setPhase("setup");
    requestAnimationFrame(() => subjectSelect.current?.focus());
  };

  const missed = round?.questions.filter((_, i) => answers[i] === false) ?? [];

  return (
    <div dir={ar ? "rtl" : "ltr"} className="mx-auto max-w-2xl space-y-4">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#102749] via-[#19447b] to-[#135678] p-5 text-white shadow-[0_18px_38px_-24px_#0d467e] sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15"><Clock3 aria-hidden="true" className="size-5" /></span>
          {subjectTitle && chapterTitle ? <div>
            <p className="text-xs font-bold text-sky-100 sm:text-sm">{subjectTitle}</p>
            <p className="mt-0.5 text-xl font-black leading-snug sm:text-2xl">{chapterTitle}</p>
          </div> : <p className="text-lg font-black leading-snug sm:text-xl">{t.intro}</p>}
        </div>
        {topic?.title && <p className="mt-3 text-sm font-bold text-sky-100">{topic.title}</p>}
        {phase === "setup" && topic && topic.reason !== "chapter" && <p className="mt-1.5 text-sm text-sky-100">{t[topic.reason]}</p>}
      </section>

      {phase === "setup" && <section className={panel}>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 text-sm font-black">
            <label htmlFor={subjectId} className="block">{t.subject}</label>
            <span className="relative block">
              <select id={subjectId} ref={subjectSelect} value={subject} className={selectControl} onChange={event => {
                const picked = QUICK_STUDY_SUBJECTS.find(item => item.id === event.target.value);
                setSubject(picked?.id ?? "");
                setChapter("");
              }}>
                <option value="">{t.subjectPlaceholder}</option>
                {QUICK_STUDY_SUBJECTS.map(item => <option key={item.id} value={item.id}>{item[language]}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </span>
          </div>
          <div className="space-y-1.5 text-sm font-black">
            <label htmlFor={chapterId} className="block">{t.chapter}</label>
            <span className="relative block">
              <select id={chapterId} value={chapter} className={selectControl} disabled={!subject} onChange={event => setChapter(event.target.value)}>
                <option value="">{t.chapterPlaceholder}</option>
                {chapters.map(item => <option key={item.key} value={item.key}>
                  {showChapterNumbers && /^\d+$/.test(item.key) ? `${n(Number(item.key))} · ` : ""}{item[language]}
                </option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </span>
          </div>
        </div>
        <fieldset>
          <legend className="mb-2.5 text-sm font-black">{t.choose}</legend>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {([5, 15] as const).map(duration => <button key={duration} type="button" aria-pressed={minutes === duration} onClick={() => setMinutes(duration)}
              className="min-h-20 rounded-2xl border border-border bg-background p-3 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary aria-pressed:border-primary aria-pressed:bg-primary/10">
              <span className="block text-lg font-black">{n(duration)} {duration === 5 ? t.minutes : t.fifteen}</span>
              <span className="mt-1 block text-xs font-semibold text-muted-foreground sm:text-sm">
                {n(QUICK_STUDY_COUNTS[duration])} {t.cardsUnit} · {n(QUICK_STUDY_COUNTS[duration])} {t.mcqUnit}
              </span>
            </button>)}
          </div>
        </fieldset>
        {selection && (query.isPending ? <p role="status" className="mt-4 text-sm text-muted-foreground">{t.loading}</p> :
          !recommendation && (query.isError || query.data?.unavailable) ? (
            <div className="mt-4 space-y-2"><p role="alert" className="text-sm text-muted-foreground">{t.unavailable}</p>
              <Button variant="outline" className={primary} onClick={() => void query.refetch()} disabled={query.isFetching}>{t.retry}</Button>
            </div>
          ) : !recommendation && <p role="status" className="mt-4 text-sm text-muted-foreground">{t.empty}</p>)}
        {recommendation && (recommendation.cards.length < QUICK_STUDY_COUNTS[minutes] || recommendation.questions.length < QUICK_STUDY_COUNTS[minutes]) &&
          <p role="status" className="mt-4 text-sm text-muted-foreground">
            {ar ? "المتوفر حاليًا " : "Currently available "}{n(recommendation.cards.length)} {t.cardsUnit} · {n(recommendation.questions.length)} {t.mcqUnit}
          </p>}
        <Button className={cn(primary, "mt-4")} onClick={start} disabled={!recommendation}>{t.start}<Arrow aria-hidden="true" className="size-4" /></Button>
      </section>}

      {phase === "review" && round && card && <section className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h2 className="flex items-center gap-2 text-xl font-black"><BookOpen aria-hidden="true" className="size-5 text-primary" />{t.review}</h2>
          <p className="text-xs font-bold text-primary">{ar
            ? `البطاقة ${n(index + 1)} من ${n(round.cards.length)}`
            : `Card ${n(index + 1)} of ${n(round.cards.length)}`}</p>
        </div>
        <progress aria-label={t.cardsUnit} value={index + 1} max={round.cards.length} className={cn(progressBar, "mt-3")} />
        <article className="my-4 rounded-2xl border border-border bg-background/70 p-3.5 sm:p-4">
          <p className="mb-1.5 text-xs font-bold text-primary">{t[card.source]}</p>
          <h3 ref={heading} tabIndex={-1} className="whitespace-pre-line break-words font-bold outline-none" dir="auto">{card.q}</h3>
          {revealed && <div className="mt-3 border-t border-border pt-3 text-muted-foreground"><CardAnswer card={card} /></div>}
          <Button type="button" variant="outline" className="mt-4 min-h-11 gap-2 font-bold" aria-expanded={revealed} onClick={() => setRevealed(value => !value)}>
            <Eye aria-hidden="true" className="size-4" />{revealed ? t.hide : t.reveal}
          </Button>
        </article>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <Button variant="outline" className="min-h-11 gap-2 font-bold" disabled={index === 0} onClick={() => moveCard(-1)}>
            <Arrow aria-hidden="true" className="size-4 rotate-180" />{t.previousCard}
          </Button>
          <Button variant="outline" className="min-h-11 gap-2 font-bold" disabled={index + 1 === round.cards.length} onClick={() => moveCard(1)}>
            {t.nextCard}<Arrow aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <Button className={primary} onClick={startQuiz}>{t.quiz}<Arrow aria-hidden="true" className="size-4" /></Button>
      </section>}

      {phase === "quiz" && round && question && <section className={panel}>
        <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs font-bold text-primary">
          <p>{ar ? `السؤال ${n(index + 1)} من ${n(round.questions.length)}` : `Question ${index + 1} of ${round.questions.length}`}</p>
          <p>{question.source === "bank" ? t.mcq : t[question.source]}</p>
        </div>
        <progress aria-label={t.mcqUnit} value={index + 1} max={round.questions.length} className={cn(progressBar, "mb-3")} />
        <h2 ref={heading} tabIndex={-1} dir="auto" className="whitespace-pre-line break-words text-lg font-black leading-8 outline-none sm:text-xl">{question.question}</h2>

        <div className="mt-4 grid gap-2">
          {question.choices.map((option, i) => {
            const isAnswer = checked && i === question.answer_index;
            return <button key={i} type="button" aria-pressed={choice === i} disabled={checked} onClick={() => setChoice(i)}
              className={cn("flex min-h-12 items-center gap-3 rounded-xl border px-3.5 py-2 text-start text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isAnswer ? "border-emerald-500/60 bg-emerald-500/10" : checked && choice === i ? "border-destructive/55 bg-destructive/10" : choice === i ? "border-primary bg-primary/10" : "border-border bg-background")}>
              <span className="min-w-0 flex-1 break-words" dir="auto">{option}</span>
              {isAnswer ? <Check aria-hidden="true" className="size-4 shrink-0 text-emerald-600" /> : checked && choice === i ? <X aria-hidden="true" className="size-4 shrink-0 text-destructive" /> : null}
            </button>;
          })}
        </div>
        {checked && <div role="status" className="mt-4 rounded-xl bg-secondary/65 p-3 text-sm leading-7">
          <p className="font-black">{correct ? t.right : t.wrong}</p>
          {!correct && <p>{t.answer} <bdi className="font-bold">{quickStudyAnswer(question)}</bdi></p>}
          {question.explanation && <p dir="auto" className="whitespace-pre-line break-words text-muted-foreground">{question.explanation}</p>}
        </div>}
        {!checked && <Button className={cn(primary, "mt-4")} onClick={() => grade(choice === question.answer_index)} disabled={choice === null}>{t.check}</Button>}
        {checked && <Button className={cn(primary, "mt-4")} onClick={advance}>
          {index + 1 === round.questions.length ? t.result : t.next}<Arrow aria-hidden="true" className="size-4" />
        </Button>}
      </section>}

      {phase === "summary" && round && <section className={panel}>
        <h2 ref={heading} tabIndex={-1} className="text-xl font-black outline-none">{t.summary}</h2>
        <p className="mt-3 text-2xl font-black text-primary" role="status">{ar
          ? `${n(round.questions.length - missed.length)} من ${n(round.questions.length)} صحيحة`
          : `${round.questions.length - missed.length} of ${round.questions.length} correct`}</p>
        {!!missed.length && <div className="mt-4"><h3 className="mb-2 text-sm font-bold">{t.missed}</h3>
          <ul className="space-y-2">{missed.map(item => <li key={item.id} className="rounded-xl border border-border bg-background p-3 text-sm leading-6">
            <p dir="auto" className="whitespace-pre-line break-words font-bold">{item.question}</p>
            <p className="mt-1 text-muted-foreground">{t.answer}</p>
            <p dir="auto" className="break-words">{quickStudyAnswer(item)}</p>
          </li>)}</ul></div>}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button className="min-h-11 flex-1 font-bold" onClick={changeChapter}>{t.change}<Arrow aria-hidden="true" className="size-4" /></Button>
          {!!missed.length && <Button variant="outline" className="min-h-11 flex-1 font-bold" onClick={() => { setIndex(0); setRevealed(false); setPhase("review"); }}><RotateCcw aria-hidden="true" className="size-4" />{t.reviewAgain}</Button>}
        </div>
        <Button variant="ghost" className="mt-2 w-full font-bold text-muted-foreground" onClick={onBack}>{t.back}</Button>
      </section>}
    </div>
  );
}
