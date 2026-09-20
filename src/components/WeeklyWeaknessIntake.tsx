import { useMemo, useState } from "react";
import { ArrowRight, BookOpenCheck, Check, Search, Target } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { missionsData, missionsOrder } from "@/data/missions";
import {
  chapterNumber,
  getISOWeek,
  rankFahrastTopics,
  type WeeklyLearningProfile,
} from "@/lib/weeklyLearning";

const copy = {
  ar: {
    title: "حدد نقطة ضعفك لهذا الأسبوع",
    body: "اكتب الشيء الذي يصعّب عليك، وسنربطه بموضوع حقيقي من الفهرست قبل بناء خطتك.",
    subject: "المادة",
    chapter: "الفصل",
    topicSearch: "اكتب اسم الموضوع أو الدرس",
    weakness: "اشرح نقطة ضعفك",
    weaknessPlaceholder: "مثلاً: أفهم التعريف لكن أختلط باتجاه التيارات الدوامة وقانون لنز.",
    match: "اختر المطابقة الصحيحة من الفهرست",
    continue: "ثبّت الموضوع وابدأ التخطيط",
    required: "أكمل المادة والفصل ونقطة الضعف، ثم اختر موضوعاً من الفهرست.",
  },
  en: {
    title: "Set this week’s weak point",
    body: "Describe what feels difficult. We’ll match it to a real Al‑Fahras topic before building your plan.",
    subject: "Subject",
    chapter: "Chapter",
    topicSearch: "Type the lesson or topic name",
    weakness: "Describe your weakness",
    weaknessPlaceholder: "For example: I know the definition, but I confuse current direction and Lenz’s law.",
    match: "Confirm the correct Al‑Fahras match",
    continue: "Confirm topic and start planning",
    required: "Complete the subject, chapter and weakness, then select an Al‑Fahras topic.",
  },
} as const;

export default function WeeklyWeaknessIntake({
  language,
  onComplete,
}: {
  language: AppLanguage;
  onComplete: (profile: WeeklyLearningProfile) => void;
}) {
  const t = copy[language];
  const [subject, setSubject] = useState("");
  const [chapterKey, setChapterKey] = useState("");
  const [topicQuery, setTopicQuery] = useState("");
  const [weaknessText, setWeaknessText] = useState("");
  const [topicKey, setTopicKey] = useState("");
  const [showError, setShowError] = useState(false);
  const subjectData = missionsData[subject];
  const chapter = subjectData?.chapters.find((item) => item.key === chapterKey);
  const rankedTopics = useMemo(
    () => rankFahrastTopics(topicQuery, chapter?.topics ?? []).slice(0, 6),
    [chapter, topicQuery],
  );

  const submit = () => {
    const topic = chapter?.topics.find((item) => item.key === topicKey);
    if (!subject || !chapter || !topic || weaknessText.trim().length < 8) {
      setShowError(true);
      return;
    }
    onComplete({
      isoWeek: getISOWeek(),
      subject,
      chapterKey: chapter.key,
      chapterNumber: chapterNumber(subject, chapter.key),
      topicKey: topic.key,
      topicEn: topic.en,
      topicAr: topic.ar,
      weaknessText: weaknessText.trim(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="relative z-10 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-md">
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_28px_-16px_hsl(var(--primary))]">
          <Target className="h-5 w-5" />
        </span>
        <h2 className="text-balance text-xl font-black text-foreground">{t.title}</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{t.body}</p>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-foreground">{t.subject}</span>
            <select
              value={subject}
              onChange={(event) => { setSubject(event.target.value); setChapterKey(""); setTopicKey(""); }}
              className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            >
              <option value="">—</option>
              {missionsOrder.filter((key) => missionsData[key]).map((key) => (
                <option key={key} value={key}>{language === "ar" ? missionsData[key].ar : missionsData[key].en}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-foreground">{t.chapter}</span>
            <select
              value={chapterKey}
              disabled={!subjectData}
              onChange={(event) => { setChapterKey(event.target.value); setTopicKey(""); }}
              className="min-h-12 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-primary focus:ring-2 focus:ring-primary/25"
            >
              <option value="">—</option>
              {subjectData?.chapters.map((item) => <option key={item.key} value={item.key}>{language === "ar" ? item.ar : item.en}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-foreground">{t.topicSearch}</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={topicQuery}
                disabled={!chapter}
                onChange={(event) => { setTopicQuery(event.target.value); setTopicKey(""); }}
                className="min-h-12 w-full rounded-xl border border-border bg-card pe-3 ps-10 text-sm text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-primary focus:ring-2 focus:ring-primary/25"
              />
            </span>
          </label>

          {chapter && (
            <fieldset>
              <legend className="mb-2 text-sm font-bold text-foreground">{t.match}</legend>
              <div className="grid gap-2">
                {rankedTopics.map((topic) => {
                  const selected = topic.key === topicKey;
                  return (
                    <button
                      key={topic.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setTopicKey(topic.key)}
                      className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-start text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "border-primary bg-primary/12 text-foreground" : "border-border bg-card text-foreground hover:border-primary/45"}`}
                    >
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {selected ? <Check className="h-4 w-4" /> : <BookOpenCheck className="h-4 w-4" />}
                      </span>
                      {language === "ar" ? topic.ar : topic.en}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-foreground">{t.weakness}</span>
            <textarea
              value={weaknessText}
              onChange={(event) => setWeaknessText(event.target.value)}
              placeholder={t.weaknessPlaceholder}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-card px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
          </label>
        </div>

        {showError && <p role="alert" className="mt-4 text-sm font-semibold text-destructive">{t.required}</p>}
        <button
          type="button"
          onClick={submit}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-black text-primary-foreground shadow-[0_12px_28px_-18px_hsl(var(--primary))] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {t.continue}<ArrowRight className={`h-4 w-4 ${language === "ar" ? "rotate-180" : ""}`} />
        </button>
      </div>
    </div>
  );
}
