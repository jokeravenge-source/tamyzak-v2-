import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Target } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { SUBJECTS_ORDER } from "@/data/subjectChapters";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { describeStudyStartTopics } from "@/lib/studyStart";

const copy = {
  ar: {
    section: "خطوتك الجاية", mistakes: "أغلاطك المحفوظة", self: "المواضيع اللي اخترتها بنفسك",
    mistakesHint: "هاي الأسئلة من أجوبتك السابقة، مو من المواضيع اللي اخترتها.",
    due: "مستحقة للمراجعة هسه", saved: "غير متقنة من أجوبتك السابقة",
    noMistakes: "ما عندك أغلاط محفوظة تحتاج إعادة حل هسه.",
    noTopics: "بعدك ما اخترت مواضيع تريد تقوّيها.", unavailable: "ما گدرنا نحمّلها هسه.", loading: "دا نحمّل…",
    redo: "أعد حل أغلاطك", recentBySubject: "من أغلاطك الأخيرة، حسب المادة",
  },
  en: {
    section: "Your next step", mistakes: "Saved mistakes", self: "Topics you picked yourself",
    mistakesHint: "Saved from your earlier answers, separate from the topics you picked.",
    due: "due now", saved: "not yet mastered from earlier answers",
    noMistakes: "There are no saved mistakes to redo right now.",
    noTopics: "You haven’t picked any topics to work on yet.", unavailable: "Could not load this right now.", loading: "Loading…",
    redo: "Redo your mistakes", recentBySubject: "Recent saved mistakes by subject",
  },
} as const;

type MistakeSummary = { unresolved: number; due: number | null; recentBySubject: { subject: string; count: number }[] };
type FocusRow = { subject: string; topic_keys: string[] };
type Read<T> = { userId: string; value: T | null };

function subjectLabel(code: string, language: AppLanguage) {
  if (code === "english_literature") return language === "ar" ? "الأدب الإنكليزي" : "English Literature";
  return SUBJECTS_ORDER.find(item => item.code === code)?.[language];
}


export default function DailyReportReview({ language, onReview }: { language: AppLanguage; onReview?: () => void }) {
  const { userId } = useSubscription();
  const [mistakes, setMistakes] = useState<Read<MistakeSummary> | null>(null);
  const [focus, setFocus] = useState<Read<FocusRow[]> | null>(null);
  const t = copy[language];
  const Arrow = language === "ar" ? ChevronLeft : ChevronRight;
  const number = new Intl.NumberFormat(language === "ar" ? "ar-IQ" : "en");

  useEffect(() => {
    if (!userId) return;
    let current = true;
    const attempt = (onlyDue: boolean) => {
      const query = supabase.from("my_mistakes").select("id", { count: "exact", head: true })
        .eq("user_id", userId).eq("resolved", false);
      return onlyDue ? query.lte("next_review_at", new Date().toISOString()) : query;
    };

    void (async () => {
      try {
        const [all, due, recent] = await Promise.all([
          attempt(false),
          attempt(true),
          supabase.from("my_mistakes").select("subject").eq("user_id", userId).eq("resolved", false)
            .order("updated_at", { ascending: false }).limit(100),
        ]);
        const counts = new Map<string, number>();
        if (!recent.error) for (const row of recent.data ?? []) {
          if (row.subject) counts.set(row.subject, (counts.get(row.subject) ?? 0) + 1);
        }
        const recentBySubject = [...counts].map(([subject, count]) => ({ subject, count }))
          .sort((a, b) => b.count - a.count);
        if (current) setMistakes({ userId, value: !all.error && all.count !== null ? {
          unresolved: all.count, due: !due.error && due.count !== null ? Math.min(all.count, due.count) : null, recentBySubject,
        } : null });
      } catch {
        if (current) setMistakes({ userId, value: null });
      }
    })();

    void (async () => {
      try {
        const { data, error } = await supabase.from("student_study_focus").select("subject, topic_keys").eq("user_id", userId);
        if (current) setFocus({ userId, value: error ? null : data ?? [] });
      } catch {
        if (current) setFocus({ userId, value: null });
      }
    })();

    return () => { current = false; };
  }, [userId]);

  if (!userId) return null;
  const mistakeRead = mistakes?.userId === userId ? mistakes : null;
  const focusRead = focus?.userId === userId ? focus : null;
  const rows = (focusRead?.value ?? []).flatMap(row => {
    const label = subjectLabel(row.subject, language);
    if (!label) return [];
    const titles = new Map(describeStudyStartTopics(row.subject, language).map(topic => [topic.key, topic.title]));
    const topics = row.topic_keys.flatMap(key => titles.get(key) ?? []);
    return topics.length ? [{ subject: row.subject, label, topics }] : [];
  });
  const usableMistakes = mistakeRead?.value;
  const mistakeSubjects = (usableMistakes?.recentBySubject ?? []).flatMap(item => {
    const label = subjectLabel(item.subject, language);
    return label ? [{ ...item, label }] : [];
  }).slice(0, 3);

  return (
    <section aria-labelledby="daily-review-heading" className="rounded-2xl border border-border bg-card p-4 text-card-foreground sm:p-5">
      <h2 id="daily-review-heading" className="text-lg font-black">{t.section}</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-border p-3">
          <h3 className="flex items-center gap-2 text-sm font-black"><RotateCcw aria-hidden="true" className="size-4 shrink-0 text-primary" />{t.mistakes}</h3>
          {!mistakeRead ? <p className="mt-2 text-sm text-muted-foreground">{t.loading}</p>
            : !usableMistakes ? <p className="mt-2 text-sm text-muted-foreground">{t.unavailable}</p>
              : usableMistakes.unresolved === 0 ? <p className="mt-2 text-sm text-muted-foreground">{t.noMistakes}</p>
                : <>
                    <p className="mt-2 text-sm text-muted-foreground">{t.mistakesHint}</p>
                    <p className="mt-1 text-sm"><strong>{number.format(usableMistakes.unresolved)}</strong> {t.saved}
                      {usableMistakes.due !== null && <> · <strong>{number.format(usableMistakes.due)}</strong> {t.due}</>}</p>
                    {mistakeSubjects.length > 0 && <div className="mt-2 text-sm text-muted-foreground">
                      <p className="font-medium">{t.recentBySubject}</p>
                      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        {mistakeSubjects.map(item => <li key={item.subject}>{item.label}: <strong>{number.format(item.count)}</strong></li>)}
                      </ul>
                    </div>}
                    {onReview && <button type="button" onClick={onReview}
                      className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-primary hover:bg-accent">
                      {t.redo}<Arrow aria-hidden="true" className="size-4" />
                    </button>}
                  </>}
        </div>
        <div className="min-w-0 rounded-xl border border-border p-3">
          <h3 className="flex items-center gap-2 text-sm font-black"><Target aria-hidden="true" className="size-4 shrink-0 text-primary" />{t.self}</h3>
          {!focusRead ? <p className="mt-2 text-sm text-muted-foreground">{t.loading}</p>
            : !focusRead.value || (!rows.length && focusRead.value.some(row => row.topic_keys.length)) ? <p className="mt-2 text-sm text-muted-foreground">{t.unavailable}</p>
              : !rows.length ? <p className="mt-2 text-sm text-muted-foreground">{t.noTopics}</p>
                : <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {rows.map(({ subject, label, topics }) => <li key={subject}><strong className="text-foreground">{label}:</strong> {topics.join(language === "ar" ? "، " : ", ")}</li>)}
                  </ul>}
        </div>
      </div>
    </section>
  );
}
