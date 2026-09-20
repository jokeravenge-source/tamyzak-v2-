import { useEffect, useState } from "react";
import { ArrowRight, BrainCircuit, CalendarCheck2, Layers3, RefreshCcw, Target } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";
import {
  DAILY_FLASHCARD_TARGET_KEY,
  DAILY_MCQ_TARGET_KEY,
  readWeeklyLearningProfile,
  todayKey,
  type WeeklyLearningProfile,
} from "@/lib/weeklyLearning";

export default function DailyPersonalizedPractice({
  language,
  onOpenFlashcards,
  onOpenMcqs,
}: {
  language: AppLanguage;
  onOpenFlashcards: () => void;
  onOpenMcqs: () => void;
}) {
  const isAr = language === "ar";
  const [profile, setProfile] = useState<WeeklyLearningProfile | null>(() => readWeeklyLearningProfile());
  const [counts, setCounts] = useState({ flashcards: 10, mcqs: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refresh = () => setProfile(readWeeklyLearningProfile());
    window.addEventListener("app:weekly-learning-updated", refresh);
    return () => window.removeEventListener("app:weekly-learning-updated", refresh);
  }, []);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    setLoading(true);
    Promise.all([
      supabase.from("custom_flashcards").select("id", { count: "exact", head: true })
        .eq("subject", profile.subject).eq("chapter", String(profile.chapterNumber)).eq("language", language).eq("approved", true),
      supabase.from("mcq_banks").select("id", { count: "exact", head: true })
        .eq("subject", profile.subject).eq("chapter", profile.chapterNumber).eq("language", language),
    ]).then(([flashcards, mcqs]) => {
      if (!active) return;
      const remoteFlashcards = flashcards.count ?? 0;
      setCounts({ flashcards: remoteFlashcards > 0 ? Math.min(10, remoteFlashcards) : 10, mcqs: Math.min(10, mcqs.count ?? 0) });
      setLoading(false);
    });
    return () => { active = false; };
  }, [profile, language]);

  if (!profile) return null;
  const topic = isAr ? profile.topicAr : profile.topicEn;
  const subject = profile.subject;
  const target = { ...profile, date: todayKey() };
  const openFlashcards = () => {
    sessionStorage.setItem(DAILY_FLASHCARD_TARGET_KEY, JSON.stringify(target));
    onOpenFlashcards();
  };
  const openMcqs = () => {
    sessionStorage.setItem(DAILY_MCQ_TARGET_KEY, JSON.stringify(target));
    onOpenMcqs();
  };

  return (
    <section aria-labelledby="daily-personalized-title" className="mb-7 overflow-hidden rounded-3xl border border-primary/25 bg-card shadow-[0_18px_48px_-34px_hsl(var(--primary))]">
      <div className="flex flex-col gap-4 border-b border-border bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_26px_-16px_hsl(var(--primary))]"><BrainCircuit className="h-5 w-5" /></span>
          <div className="min-w-0">
            <h2 id="daily-personalized-title" className="text-lg font-black text-foreground sm:text-xl">{isAr ? "تدريبك المخصص لليوم" : "Your personalized practice today"}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{isAr ? `مبني على نقطة ضعفك في ${topic}` : `Built around your weak point in ${topic}`}</p>
          </div>
        </div>
        <button type="button" onClick={() => window.dispatchEvent(new Event("app:companion-auto-schedule"))} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <RefreshCcw className="h-3.5 w-3.5" />{isAr ? "تعديل الخطة" : "Adjust plan"}
        </button>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2">
        <button type="button" onClick={openFlashcards} className="group flex min-h-[154px] items-center gap-4 bg-card p-5 text-start transition-colors hover:bg-sky-500/5 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:p-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-500/12 text-sky-600 dark:text-sky-300"><Layers3 className="h-6 w-6" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-black text-foreground">{isAr ? "بطاقات اليوم" : "Today’s flashcards"}</span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">{loading ? (isAr ? "جارٍ تجهيزها…" : "Preparing…") : (isAr ? `${counts.flashcards} بطاقات من الفصل ${profile.chapterNumber}` : `${counts.flashcards} cards from chapter ${profile.chapterNumber}`)}</span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-300">{isAr ? "ابدأ المراجعة" : "Start review"}<ArrowRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${isAr ? "rotate-180 group-hover:-translate-x-0.5" : ""}`} /></span>
          </span>
        </button>

        <button type="button" onClick={openMcqs} disabled={!loading && counts.mcqs === 0} className="group flex min-h-[154px] items-center gap-4 bg-card p-5 text-start transition-colors hover:bg-violet-500/5 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:p-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-500/12 text-violet-600 dark:text-violet-300"><CalendarCheck2 className="h-6 w-6" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-black text-foreground">{isAr ? "أسئلة اليوم" : "Today’s MCQs"}</span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">{loading ? (isAr ? "جارٍ اختيارها…" : "Selecting…") : counts.mcqs > 0 ? (isAr ? `${counts.mcqs} أسئلة من بنك الفصل` : `${counts.mcqs} questions from the chapter bank`) : (isAr ? "لا توجد أسئلة لهذا الفصل حالياً" : "No MCQs for this chapter yet")}</span>
            {counts.mcqs > 0 && <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-700 dark:text-violet-300">{isAr ? "ابدأ الاختبار" : "Start quiz"}<ArrowRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${isAr ? "rotate-180 group-hover:-translate-x-0.5" : ""}`} /></span>}
          </span>
        </button>
      </div>
      <div className="flex items-center gap-2 px-5 py-3 text-xs text-muted-foreground sm:px-6"><Target className="h-3.5 w-3.5 text-primary" /><span className="truncate">{isAr ? `المادة: ${subject} · ${topic}` : `Subject: ${subject} · ${topic}`}</span></div>
    </section>
  );
}
