import { SchemeVideo } from "@/components/physics/SchemeVideo";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Images, Layers3, ListChecks, RotateCcw } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { PHYSICS_SCHEMES, type PhysicsSchemeLesson } from "@/data/physicsSchemes";
import { DAILY_FLASHCARD_TARGET_KEY, DAILY_MCQ_TARGET_KEY, getISOWeek, type WeeklyLearningProfile } from "@/lib/weeklyLearning";

const copy = {
  ar: { badge: "الفيزياء", title: "مخططات", description: "افهم الفيزياء جزءاً بعد جزء، بمخططات وتوضيحات متحركة ونصوص من الملزمة.", chapter: "الفصل", part: "الجزء", of: "من", previous: "السابق", next: "التالي", finish: "إكمال المخطط", completed: "أكملت المخطط", completedText: "أحسنت! ثبّت المعلومات الآن ببطاقات وأسئلة مرتبطة بالدرس.", restart: "مراجعة من البداية", chooseLesson: "اختر المخطط", back: "رجوع", flashcards: "راجع البطاقات المرتبطة", mcqs: "حل الأسئلة المرتبطة" },
  en: { badge: "Physics", title: "Schemes", description: "Understand physics one part at a time with diagrams, short visual explanations, and booklet text.", chapter: "Chapter", part: "Part", of: "of", previous: "Previous", next: "Next", finish: "Complete scheme", completed: "Scheme completed", completedText: "Great work! Reinforce it now with related flashcards and MCQs.", restart: "Review from the start", chooseLesson: "Choose a scheme", back: "Back", flashcards: "Review related flashcards", mcqs: "Practice related MCQs" },
} as const;

const progressKey = (id: string) => `physics-scheme-progress:${id}`;

const PhysicsSchemes = ({ language, onBack }: { language: AppLanguage; onBack: () => void }) => {
  const t = copy[language];
  const isArabic = language === "ar";
  const [lessonId, setLessonId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const requested = new URLSearchParams(window.location.search).get("scheme");
    return PHYSICS_SCHEMES.some(item => item.id === requested) ? requested : null;
  });
  const [partIndex, setPartIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { setRevealed(false); }, [lessonId, partIndex]);
  const lesson = useMemo(() => PHYSICS_SCHEMES.find((item) => item.id === lessonId) ?? null, [lessonId]);

  useEffect(() => {
    if (!lesson) return;
    let saved = 0;
    try { saved = Number(localStorage.getItem(progressKey(lesson.id)) || 0); } catch { /* ignore */ }
    setPartIndex(Number.isFinite(saved) ? Math.max(0, Math.min(Math.floor(saved), lesson.parts.length - 1)) : 0);
    setCompleted(false);
  }, [lesson]);

  const openLesson = (item: PhysicsSchemeLesson) => {
    setLessonId(item.id); setCompleted(false);
    const url = new URL(window.location.href); url.searchParams.set("scheme", item.id);
    window.history.replaceState({}, "", url.pathname + url.search);
  };
  const moveTo = (index: number) => {
    if (!lesson) return;
    const safe = Math.max(0, Math.min(index, lesson.parts.length - 1));
    setPartIndex(safe);
    try { localStorage.setItem(progressKey(lesson.id), String(safe)); } catch { /* ignore */ }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const finish = () => {
    if (!lesson) return;
    setCompleted(true);
    try { localStorage.setItem(progressKey(lesson.id), "0"); } catch { /* ignore */ }
  };
  const openPractice = (kind: "flashcards" | "mcq") => {
    if (!lesson) return;
    const target: WeeklyLearningProfile = {
      isoWeek: getISOWeek(), subject: "physics", chapterKey: `phys-${lesson.chapter}`, chapterNumber: lesson.chapter,
      topicKey: lesson.id, topicEn: lesson.title.en, topicAr: lesson.title.ar, weaknessText: lesson.description[language], updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(kind === "flashcards" ? DAILY_FLASHCARD_TARGET_KEY : DAILY_MCQ_TARGET_KEY, JSON.stringify(target));
    window.dispatchEvent(new CustomEvent("app:open-personalized-practice", { detail: { kind, subject: "physics", chapterNumber: lesson.chapter, origin: "physicsSchemes" } }));
  };
  const back = () => {
    if (!lesson) { onBack(); return; }
    setLessonId(null); setCompleted(false);
    const url = new URL(window.location.href); url.searchParams.delete("scheme");
    window.history.replaceState({}, "", url.pathname + url.search);
  };
  const part = lesson?.parts[partIndex];
  const progress = lesson ? ((partIndex + 1) / lesson.parts.length) * 100 : 0;

  return (
    <main dir={isArabic ? "rtl" : "ltr"} className="relative min-h-screen overflow-hidden bg-background px-4 pb-24 pt-6">
      <div className="pointer-events-none absolute -left-32 -top-32 size-80 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-80 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <button onClick={back} className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card/90 px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
          <ArrowLeft className={`size-4 ${isArabic ? "rotate-180" : ""}`} />{t.back}
        </button>

        <header className="rounded-3xl border border-sky-500/20 bg-card/90 p-6 text-center shadow-sm backdrop-blur-xl sm:p-8">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-500/20"><Images className="size-6" /></div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-700 dark:text-sky-300">{t.badge}</p>
          <h1 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">{t.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">{t.description}</p>
        </header>

        {!lesson ? (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-black text-foreground">{t.chooseLesson}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {PHYSICS_SCHEMES.map((item) => (
                <button key={item.id} onClick={() => openLesson(item)} className="group rounded-2xl border border-border bg-card/85 p-5 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-500/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-300">{t.chapter} {item.chapter}</span>
                  <strong className="mt-2 block text-lg text-foreground">{item.title[language]}</strong>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.description[language]}</span>
                  <span className="mt-4 block text-xs font-semibold text-muted-foreground">{item.parts.length} {t.part}</span>
                </button>
              ))}
            </div>
          </section>
        ) : completed ? (
          <section className="mt-6 rounded-3xl border border-sky-500/30 bg-card/90 p-8 text-center shadow-sm sm:p-12">
            <CheckCircle2 className="mx-auto size-14 text-sky-500" />
            <h2 className="mt-4 text-2xl font-black text-foreground">{t.completed}</h2>
            <p className="mt-2 text-muted-foreground">{t.completedText}</p>
            <div className="mx-auto mt-6 grid max-w-lg gap-3 sm:grid-cols-2">
              <button onClick={() => openPractice("flashcards")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 font-bold text-white transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"><Layers3 className="size-4" />{t.flashcards}</button>
              <button onClick={() => openPractice("mcq")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-sky-500/35 bg-sky-500/10 px-4 font-bold text-sky-800 transition-colors hover:bg-sky-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-sky-200"><ListChecks className="size-4" />{t.mcqs}</button>
            </div>
            <button onClick={() => { setCompleted(false); moveTo(0); }} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-600 px-5 font-bold text-white transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
              <RotateCcw className="size-4" />{t.restart}
            </button>
          </section>
        ) : part ? (
          <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card/95 shadow-md">
            <div className="p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-muted-foreground"><span>{t.part} {partIndex + 1} {t.of} {lesson.parts.length}</span><span className="tabular-nums">{Math.round(progress)}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-sky-500 transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
            </div>
            {part.group && <div className="mx-4 mb-4 rounded-xl bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-800 dark:text-sky-200 sm:mx-6">{part.group[language]} · {partIndex + 1} / {lesson.parts.length}</div>}
            <div className="mx-4 sm:mx-6">
              <h2 className="mb-4 text-xl font-black text-foreground sm:text-2xl">{part.title[language]}</h2>
              {part.video ? <SchemeVideo key={part.id} part={part} language={language} describedBy={`scheme-source-${part.id}`} />
                : <div className="overflow-hidden rounded-2xl border border-sky-100 bg-[#07182e]"><img src={part.image} alt={part.imageAlt[language]} className="max-h-[28rem] w-full object-contain" /></div>}
            </div>
            <article className="p-5 sm:p-7">
              {part.source && <section id={`scheme-source-${part.id}`} className="rounded-2xl border border-border bg-secondary/35 p-4 sm:p-5" aria-label={isArabic ? "نص الملزمة" : "Booklet text"}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-muted-foreground"><h3 className="text-sm text-foreground">{isArabic ? "نص الملزمة" : "Booklet text"}</h3><span>{isArabic ? "صفحة" : "Page"} {part.source.pages.join("، ")}</span></div>
                <p dir={part.source.language === "en" ? "ltr" : "rtl"} className="whitespace-pre-line break-words text-start text-base leading-8 text-foreground">{part.source.text}</p>
                <p className="mt-4 border-t border-border pt-3 text-xs leading-6 text-muted-foreground">{part.source.name}</p>
              </section>}
              {part.formulas && <div className="mt-5 grid gap-2" aria-label={isArabic ? "القوانين" : "Equations"}>{part.formulas.map(formula => <p key={formula} dir="ltr" className="overflow-x-auto rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-center font-mono text-base font-bold leading-7 text-foreground sm:text-lg">{formula}</p>)}</div>}
              {part.source && <h3 className="mt-6 text-lg font-black text-foreground">{isArabic ? "الفكرة ببساطة" : "Understand it"}</h3>}
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-foreground/90">{part.text[language]}</p>
              {part.memory && <aside className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"><p className="text-xs font-black text-amber-800 dark:text-amber-200">{isArabic ? "مفتاح للحفظ" : "Memory cue"}</p><p className="mt-2 font-bold leading-7 text-foreground">{part.memory[language]}</p></aside>}
              {part.recall && <section className="mt-5 rounded-2xl border border-border p-4"><h3 className="text-sm font-black text-foreground">{isArabic ? "جرّب تتذكر قبل ما تقلب الجواب" : "Recall before revealing"}</h3><p className="mt-3 leading-7 text-foreground">{part.recall.question[language]}</p><button aria-expanded={revealed} onClick={() => setRevealed(v => !v)} className="mt-3 min-h-11 rounded-xl bg-sky-600 px-4 font-bold text-white">{revealed ? isArabic ? "إخفاء الجواب" : "Hide answer" : isArabic ? "إظهار الجواب" : "Reveal answer"}</button>{revealed && <p className="mt-4 rounded-xl bg-secondary p-3 leading-7 text-foreground">{part.recall.answer[language]}</p>}</section>}
              {part.video && <details className="mt-6 rounded-xl border border-border p-4"><summary className="cursor-pointer font-bold text-foreground">{isArabic ? "انتقل لجزئية ثانية" : "Jump to another part"}</summary><ol className="mt-3 grid gap-2 sm:grid-cols-2">{lesson.parts.map((item, index) => <li key={item.id}><button aria-current={partIndex === index ? "step" : undefined} onClick={() => moveTo(index)} className="min-h-11 w-full rounded-lg bg-secondary px-3 py-2 text-start text-sm font-semibold text-foreground">{index + 1}. {item.title[language]}</button></li>)}</ol></details>}
            </article>
            <div className="grid grid-cols-2 gap-3 border-t border-border p-4 sm:p-6">
              <button onClick={() => moveTo(partIndex - 1)} disabled={partIndex === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 font-bold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className={`size-4 ${isArabic ? "rotate-180" : ""}`} />{t.previous}</button>
              <button onClick={() => partIndex === lesson.parts.length - 1 ? finish() : moveTo(partIndex + 1)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 font-bold text-white transition-colors hover:bg-sky-700">{partIndex === lesson.parts.length - 1 ? t.finish : t.next}{partIndex < lesson.parts.length - 1 && <ChevronRight className={`size-4 ${isArabic ? "rotate-180" : ""}`} />}</button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
};

export default PhysicsSchemes;
