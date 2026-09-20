import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Images, Layers3, ListChecks, RotateCcw } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { BIOLOGY_SCHEMES, type BiologySchemeLesson } from "@/data/biologySchemes";
import { DAILY_FLASHCARD_TARGET_KEY, DAILY_MCQ_TARGET_KEY, getISOWeek, type WeeklyLearningProfile } from "@/lib/weeklyLearning";

const copy = {
  ar: {
    badge: "الأحياء",
    title: "مخططات",
    description: "تعلم النص خطوة بخطوة من خلال صورة وشرح لكل جزء.",
    emptyTitle: "سيتم إضافة أول مخطط قريباً",
    emptyText: "ستظهر الدروس هنا بعد تقسيم النص وإضافة صورة توضيحية لكل جزء.",
    chapter: "الفصل",
    part: "الجزء",
    of: "من",
    previous: "السابق",
    next: "التالي",
    finish: "إكمال المخطط",
    completed: "أكملت النص كاملاً",
    completedText: "أحسنت! انتقلت عبر جميع أجزاء المخطط.",
    restart: "مراجعة من البداية",
    chooseLesson: "اختر المخطط",
    flashcards: "راجع البطاقات المرتبطة",
    mcqs: "حل الأسئلة المرتبطة",
  },
  en: {
    badge: "Biology",
    title: "Schemes",
    description: "Learn the full text step by step with an image and explanation for every part.",
    emptyTitle: "The first scheme is coming soon",
    emptyText: "Lessons will appear here after the text is divided and an explanatory image is added to each part.",
    chapter: "Chapter",
    part: "Part",
    of: "of",
    previous: "Previous",
    next: "Next",
    finish: "Complete scheme",
    completed: "Full text completed",
    completedText: "Great work! You moved through every part of the scheme.",
    restart: "Review from the start",
    chooseLesson: "Choose a scheme",
    flashcards: "Review related flashcards",
    mcqs: "Practice related MCQs",
  },
} as const;

const progressKey = (lessonId: string) => `biology-scheme-progress:${lessonId}`;

const BiologySchemes = ({ language, onBack }: { language: AppLanguage; onBack: () => void }) => {
  const t = copy[language];
  const isArabic = language === "ar";
  const [lessonId, setLessonId] = useState<string | null>(null);
  const lesson = useMemo(
    () => BIOLOGY_SCHEMES.find((item) => item.id === lessonId) ?? null,
    [lessonId],
  );
  const [partIndex, setPartIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    let saved = 0;
    try {
      saved = Number(localStorage.getItem(progressKey(lesson.id)) || 0);
    } catch { /* ignore */ }
    setPartIndex(Math.max(0, Math.min(saved, lesson.parts.length - 1)));
    setCompleted(false);
  }, [lesson]);

  const openLesson = (item: BiologySchemeLesson) => {
    setLessonId(item.id);
    setCompleted(false);
  };

  const moveTo = (nextIndex: number) => {
    if (!lesson) return;
    const safeIndex = Math.max(0, Math.min(nextIndex, lesson.parts.length - 1));
    setPartIndex(safeIndex);
    try { localStorage.setItem(progressKey(lesson.id), String(safeIndex)); } catch { /* ignore */ }
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
      isoWeek: getISOWeek(), subject: "biology", chapterKey: `bio-${lesson.chapter}`, chapterNumber: lesson.chapter,
      topicKey: lesson.id, topicEn: lesson.title.en, topicAr: lesson.title.ar, weaknessText: lesson.description?.[language] ?? lesson.title[language], updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(kind === "flashcards" ? DAILY_FLASHCARD_TARGET_KEY : DAILY_MCQ_TARGET_KEY, JSON.stringify(target));
    window.dispatchEvent(new CustomEvent("app:open-personalized-practice", { detail: { kind, subject: "biology", chapterNumber: lesson.chapter, origin: "biologySchemes" } }));
  };

  const back = () => {
    if (lesson) {
      setLessonId(null);
      setCompleted(false);
      return;
    }
    onBack();
  };

  const part = lesson?.parts[partIndex];
  const progress = lesson?.parts.length ? ((partIndex + 1) / lesson.parts.length) * 100 : 0;

  return (
    <main dir={isArabic ? "rtl" : "ltr"} className="relative min-h-screen overflow-hidden bg-background px-4 pb-24 pt-6">
      <div className="pointer-events-none absolute -left-32 -top-32 size-80 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-80 rounded-full bg-lime-500/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-3xl">
        <button
          onClick={back}
          className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card/90 px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className={`size-4 ${isArabic ? "rotate-180" : ""}`} />
          {isArabic ? "رجوع" : "Back"}
        </button>

        <header className="rounded-3xl border border-emerald-500/20 bg-card/85 p-6 text-center shadow-sm backdrop-blur-xl sm:p-8">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            <Images className="size-6" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">{t.badge}</p>
          <h1 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">{t.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">{t.description}</p>
        </header>

        {!BIOLOGY_SCHEMES.length ? (
          <section className="mt-6 rounded-3xl border border-dashed border-emerald-500/30 bg-card/70 p-10 text-center shadow-sm">
            <Images className="mx-auto size-10 text-emerald-600/70" />
            <h2 className="mt-4 text-xl font-black text-foreground">{t.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">{t.emptyText}</p>
          </section>
        ) : !lesson ? (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-black text-foreground">{t.chooseLesson}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {BIOLOGY_SCHEMES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openLesson(item)}
                  className="rounded-2xl border border-border bg-card/80 p-5 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md"
                >
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t.chapter} {item.chapter}</span>
                  <strong className="mt-2 block text-lg text-foreground">{item.title[language]}</strong>
                  {item.description && <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.description[language]}</span>}
                  <span className="mt-4 block text-xs font-semibold text-muted-foreground">{item.parts.length} {t.part}</span>
                </button>
              ))}
            </div>
          </section>
        ) : completed ? (
          <section className="mt-6 rounded-3xl border border-emerald-500/30 bg-card/85 p-8 text-center shadow-sm sm:p-12">
            <CheckCircle2 className="mx-auto size-14 text-emerald-500" />
            <h2 className="mt-4 text-2xl font-black text-foreground">{t.completed}</h2>
            <p className="mt-2 text-muted-foreground">{t.completedText}</p>
            <div className="mx-auto mt-6 grid max-w-lg gap-3 sm:grid-cols-2">
              <button onClick={() => openPractice("flashcards")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"><Layers3 className="size-4" />{t.flashcards}</button>
              <button onClick={() => openPractice("mcq")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 font-bold text-emerald-800 transition-colors hover:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-200"><ListChecks className="size-4" />{t.mcqs}</button>
            </div>
            <button
              onClick={() => { setCompleted(false); moveTo(0); }}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 font-bold text-white transition-colors hover:bg-emerald-700"
            >
              <RotateCcw className="size-4" />
              {t.restart}
            </button>
          </section>
        ) : part ? (
          <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card/90 shadow-md">
            <div className="p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-muted-foreground">
                <span>{t.part} {partIndex + 1} {t.of} {lesson.parts.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-white sm:mx-6">
              <img src={part.image} alt={part.imageAlt[language]} className="max-h-[28rem] w-full object-contain" />
            </div>

            <article className="p-5 sm:p-7">
              <h2 className="text-xl font-black text-foreground sm:text-2xl">{part.title[language]}</h2>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-foreground/90">{part.text[language]}</p>
            </article>

            <div className="grid grid-cols-2 gap-3 border-t border-border p-4 sm:p-6">
              <button
                onClick={() => moveTo(partIndex - 1)}
                disabled={partIndex === 0}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 font-bold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className={`size-4 ${isArabic ? "rotate-180" : ""}`} />
                {t.previous}
              </button>
              <button
                onClick={() => partIndex === lesson.parts.length - 1 ? finish() : moveTo(partIndex + 1)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-bold text-white transition-colors hover:bg-emerald-700"
              >
                {partIndex === lesson.parts.length - 1 ? t.finish : t.next}
                {partIndex < lesson.parts.length - 1 && <ChevronRight className={`size-4 ${isArabic ? "rotate-180" : ""}`} />}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
};

export default BiologySchemes;
