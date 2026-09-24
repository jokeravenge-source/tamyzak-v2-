import { useEffect, useState } from "react";
import type { AppLanguage } from "@/components/LanguageGate";
import { missionsData } from "@/data/missions";
import { loadTopicPractice, topChaptersByPractice, type PracticeAttempt } from "@/lib/topicMastery";

export default function ChapterProgressCircles({ language }: { language: AppLanguage }) {
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const rows = await loadTopicPractice();
      if (active) { setAttempts(rows); setLoading(false); }
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
  }, []);

  const chapters = topChaptersByPractice(attempts);
  const isAr = language === "ar";
  return (
    <section className="mt-5 rounded-3xl border border-border/70 bg-card/80 p-4 shadow-sm sm:p-6" aria-label={isAr ? "تقدم فصولك الأكثر دراسة" : "Your most studied chapters"}>
      <h2 className="text-lg font-bold text-foreground">{isAr ? "فصولك الأكثر دراسة" : "Your most studied chapters"}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {isAr ? "نسبة الإجابات الصحيحة في آخر الأسئلة المختلفة التي تدربت عليها، وليست نسبة إكمال الفصل."
          : "Correct answers on your recent distinct practice questions, not chapter completion."}
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
              <div key={`${item.subject}:${item.chapter}`} className="flex items-center gap-4 rounded-2xl border border-border bg-background/80 p-3 sm:flex-col sm:text-center" dir={isAr ? "rtl" : "ltr"}>
                <div className="relative size-24 shrink-0" role="img" aria-label={`${subjectName} · ${chapterName}: ${item.percent}%`}>
                  <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="9" />
                    <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={circumference} strokeDashoffset={circumference * (1 - item.percent / 100)} />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-xl font-bold tabular-nums text-foreground" dir="ltr">{item.percent}%</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{subjectName} · {chapterName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isAr ? `${item.questions} أسئلة مختلفة · ${item.attempts} محاولات` : `${item.questions} distinct questions · ${item.attempts} attempts`}
                  </p>
                  {item.selfAssessed && <p className="mt-1 text-[11px] text-muted-foreground">{isAr ? "يشمل التقييم الذاتي" : "Includes self ratings"}</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {loading ? (isAr ? "جارٍ تحميل تقدمك…" : "Loading your progress…")
            : (isAr ? "جاوب على أسئلة البنك أو الوزاريات أو راجع البطاقات حتى يظهر تقدمك هنا."
              : "Practice MCQs, ministerial questions, or flashcards to see your chapters here.")}
        </p>
      )}
    </section>
  );
}
