import { useEffect, useState } from "react";
import type { AppLanguage } from "@/components/LanguageGate";
import { missionsData } from "@/data/missions";
import { categoryLabel, chapterQuestionResults, loadTopicPractice, questionKey, topChaptersByPractice, type PracticeAttempt } from "@/lib/topicMastery";
import { topicBaseline, type TopicPracticeTarget } from "@/lib/topicPracticeQuiz";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ChapterProgressCircles({ language, userId, onPracticeTopic }: { language: AppLanguage; userId?: string; onPracticeTopic?: (target: TopicPracticeTarget) => void }) {
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<{ subject: string; chapter: string } | null>(null);
  const [olderQuestions, setOlderQuestions] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (userId) {
        const { data, error } = await supabase.functions.invoke("admin-manage-users", {
          body: { action: "topic_practice", user_id: userId },
        });
        if (active) {
          setAttempts(error || data?.error ? [] : (data?.attempts ?? []) as PracticeAttempt[]);
          setFailed(Boolean(error || data?.error));
          setLoading(false);
        }
      } else {
        const rows = await loadTopicPractice();
        if (active) { setAttempts(rows); setLoading(false); }
      }
    };
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("app:progress-updated", onFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("app:progress-updated", onFocus);
    };
  }, [userId]);

  useEffect(() => {
    if (!selected) return;
    const missing = attempts.some((row) => row.subject === selected.subject && row.chapter === selected.chapter
      && row.source === "mcq_bank" && !row.question_text && !olderQuestions[`${row.subject}:${row.chapter}:${row.question_key}`]);
    if (!missing) return;
    let active = true;
    void (async () => {
      const { data } = await supabase.from("mcq_banks")
        .select("subject,chapter,question")
        .eq("subject", selected.subject)
        .eq("chapter", Number(selected.chapter))
        .limit(2000);
      if (!active) return;
      setOlderQuestions((previous) => {
        const next = { ...previous };
        for (const row of data ?? []) next[`${row.subject}:${row.chapter}:${questionKey(row.question)}`] = row.question;
        return next;
      });
    })();
    return () => { active = false; };
  }, [selected, attempts]);

  const chapters = topChaptersByPractice(attempts);
  const isAr = language === "ar";
  const selectedChapter = selected && chapters.find((item) => item.subject === selected.subject && item.chapter === selected.chapter);
  const results = selected ? chapterQuestionResults(attempts.filter((row) => row.subject === selected.subject && row.chapter === selected.chapter)) : [];
  const categories = selected ? [...new Set(attempts.filter((row) => row.subject === selected.subject && row.chapter === selected.chapter).map((row) => row.category_key))]
    .map((categoryKey) => ({ categoryKey, baseline: topicBaseline(attempts, { subject: selected.subject, chapter: Number(selected.chapter), categoryKey }) }))
    .sort((a, b) => (a.baseline.percent ?? 101) - (b.baseline.percent ?? 101)) : [];
  const graded = results.filter((row) => row.source === "mcq_bank");
  const selfRated = results.filter((row) => row.source !== "mcq_bank");
  return (
    <>
    <section className="mt-5 rounded-3xl border border-border/70 bg-card/80 p-4 shadow-sm sm:p-6" aria-label={isAr ? "تقدم فصولك الأكثر دراسة" : "Your most studied chapters"}>
      <h2 className="text-lg font-bold text-foreground">{userId
        ? (isAr ? "فصول الطالب الأكثر دراسة" : "Student's most studied chapters")
        : (isAr ? "فصولك الأكثر دراسة" : "Your most studied chapters")}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {isAr ? "الدائرة تعرض دقة أسئلة الاختيار المصححة تلقائياً فقط (بعد ٣ أسئلة). تقييم البطاقات والوزاريات يظهر منفصلاً."
          : "The circle shows automatically graded MCQ accuracy after 3 questions. Self-rated practice is separate."}
      </p>
      {chapters.length ? (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {chapters.map((item) => {
            const subject = missionsData[item.subject];
            const chapter = subject?.chapters.find((entry) => Number(entry.key.match(/\d+$/)?.[0]) === Number(item.chapter));
            const subjectName = subject?.[language] ?? item.subject;
            const chapterName = chapter?.[language] ?? (isAr ? `الفصل ${item.chapter}` : `Chapter ${item.chapter}`);
            const radius = 38;
            const circumference = 2 * Math.PI * radius;
            return (
              <button type="button" key={`${item.subject}:${item.chapter}`}
                onClick={() => setSelected({ subject: item.subject, chapter: item.chapter })}
                className="flex items-center gap-4 rounded-2xl border border-border bg-background/80 p-3 text-start transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-col sm:text-center"
                aria-label={isAr ? `عرض إجابات ${subjectName} ${chapterName}` : `Review answers for ${subjectName} ${chapterName}`}
                dir={isAr ? "rtl" : "ltr"}>
                <div className="relative size-24 shrink-0" role="img" aria-label={`${subjectName} · ${chapterName}: ${item.percent === null ? (isAr ? "لا توجد بيانات كافية" : "Not enough graded answers") : `${item.percent}%`}`}>
                  <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="9" />
                    {item.percent !== null && <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={circumference} strokeDashoffset={circumference * (1 - item.percent / 100)} />}
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-xl font-bold tabular-nums text-foreground" dir="ltr">{item.percent === null ? "—" : `${item.percent}%`}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{subjectName} · {chapterName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isAr ? `${item.questions} أسئلة مختلفة · ${item.attempts} محاولات` : `${item.questions} distinct questions · ${item.attempts} attempts`}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{isAr ? `${item.gradedCount} أسئلة مصححة تلقائياً` : `${item.gradedCount} graded MCQs`}</p>
                  {item.selfPercent !== null && <p className="mt-1 text-[11px] text-muted-foreground">{isAr ? `تقييمك الذاتي: ${item.selfPercent}% من ${item.selfRatedCount}` : `Self ratings: ${item.selfPercent}% of ${item.selfRatedCount}`}</p>}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {loading ? (isAr ? "جارٍ تحميل التقدم…" : "Loading progress…")
            : failed ? (isAr ? "تعذّر تحميل تقدم الفصول." : "Could not load chapter progress.")
            : (isAr ? "جاوب على أسئلة البنك أو الوزاريات أو راجع البطاقات حتى يظهر تقدمك هنا."
              : "Practice MCQs, ministerial questions, or flashcards to see your chapters here.")}
        </p>
      )}
    </section>
    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{isAr ? "مراجعة إجابات الفصل" : "Chapter answer review"}</DialogTitle>
        </DialogHeader>
        {selectedChapter && (
          <div className="space-y-4">
            <p className="text-sm font-semibold">
              {missionsData[selectedChapter.subject]?.[language] ?? selectedChapter.subject} · {isAr ? `الفصل ${selectedChapter.chapter}` : `Chapter ${selectedChapter.chapter}`}
            </p>
            <p className="text-sm text-muted-foreground">{isAr
              ? `${graded.filter((row) => row.correct).length} صحيحة من ${graded.length} أسئلة مصححة تلقائياً · ${selfRated.filter((row) => row.correct).length} جيدة من ${selfRated.length} تقييمات ذاتية`
              : `${graded.filter((row) => row.correct).length} right of ${graded.length} graded MCQs · ${selfRated.filter((row) => row.correct).length} good of ${selfRated.length} self ratings`}</p>
            {!userId && onPracticeTopic && <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <h3 className="mb-2 font-semibold">{isAr ? "تدرّب على موضوع محدد" : "Practice a specific topic"}</h3>
              <div className="space-y-2">
                {categories.map(({ categoryKey, baseline }) => <div key={categoryKey} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background p-2">
                  <div>
                    <p className="text-sm font-medium">{categoryLabel(categoryKey, language)}</p>
                    <p className="text-xs text-muted-foreground">{baseline.percent === null
                      ? (isAr ? "لا توجد أسئلة مصححة بعد" : "No graded questions yet")
                      : (isAr ? `${baseline.percent}% من ${baseline.count} أسئلة مصححة` : `${baseline.percent}% from ${baseline.count} graded questions`)}</p>
                  </div>
                  <Button size="sm" onClick={() => { setSelected(null); onPracticeTopic({ subject: selectedChapter.subject, chapter: Number(selectedChapter.chapter), categoryKey }); }}>
                    {isAr ? "تدرّب على الموضوع" : "Practice this topic"}
                  </Button>
                </div>)}
              </div>
            </div>}
            {results.map((row) => {
              const prompt = row.question_text || olderQuestions[`${row.subject}:${row.chapter}:${row.question_key}`];
              const source = row.source === "mcq_bank"
                ? (isAr ? "اختيار من متعدد" : "MCQ bank")
                : row.source === "flashcards" ? (isAr ? "بطاقات" : "Flashcards") : (isAr ? "وزاريات" : "Ministerial bank");
              return (
                <div key={`${row.source}:${row.question_key}`} className="rounded-xl border border-border bg-card p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={row.correct ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-bold text-rose-600 dark:text-rose-400"}>
                      {row.correct ? (isAr ? "✓ صحيح" : "✓ Right") : (isAr ? "✕ خطأ" : "✕ Wrong")}
                    </span>
                    <span className="text-muted-foreground">{source}</span>
                    {row.source !== "mcq_bank" && <span className="text-muted-foreground">· {isAr ? "تقييم ذاتي" : "Self rated"}</span>}
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm text-foreground">
                    {prompt || (isAr ? "نص السؤال غير متاح لهذه المحاولة القديمة." : "Question text unavailable for this older attempt.")}
                  </p>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              {isAr ? "تُعرض آخر إجابة لكل سؤال مختلف ضمن أحدث ٢٠ سؤالاً. نسبة الدائرة تعتمد فقط على الاختيارات المصححة تلقائياً بعد ٣ أسئلة."
                : "Shows the latest answer per question among the 20 most recent. The circle uses graded MCQs only, after 3 questions."}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
