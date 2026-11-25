import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight, Atom, BookOpen, BookOpenText, Calculator, Check, ChevronLeft, ChevronRight,
  ClipboardList, FlaskConical, Languages, Layers, Leaf, Moon, ScrollText,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { missionsData, missionsOrder } from "@/data/missions";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabel, loadTopicPractice, topicSummary, type PracticeAttempt } from "@/lib/topicMastery";
import { toast } from "sonner";

const ALWAYS_AR = new Set(["islamic", "arabic"]);

const subjectStyle = {
  islamic: { Icon: Moon, tone: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300" },
  arabic: { Icon: ScrollText, tone: "bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-300" },
  english: { Icon: BookOpen, tone: "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300" },
  math: { Icon: Calculator, tone: "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/15 dark:text-indigo-300" },
  physics: { Icon: Atom, tone: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300" },
  chemistry: { Icon: FlaskConical, tone: "bg-teal-100 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300" },
  biology: { Icon: Leaf, tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300" },
  french: { Icon: Languages, tone: "bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300" },
};

const copy = {
  ar: {
    title: "الفهرست", browse: "تصفّح المواد", chapters: "الفصول والوحدات", topics: "مواضيع هذا الفصل",
    description: "شوف مواضيع كل مادة وعلّم على اللي خلّصته.",
    back: "رجوع", progress: "تقدّمك", totalProgress: "تقدّمك بكل المواد", completed: "المواضيع المنجزة",
    navigation: "مسار الفهرست",
    signIn: "سجّل دخولك حتى تحفظ تقدّمك.", loading: "جاري تحميل تقدّمك…",
    practice: "تدريبك حسب الموضوع",
    practiceDetails: "نتائج البطاقات والوزاريات تعتمد على تقييمك لإجاباتك.",
    practiceEmpty: "جاوب على أسئلة البنك أو الوزاريات، أو راجع البطاقات حتى يظهر تقدّمك هنا.",
    misc: "نتائج الأسئلة",
    states: { starting: "بدأت", strong: "قوي", improving: "يتحسّن", practice: "يحتاج تدريب" },
  },
  en: {
    title: "Chapter checklist", browse: "Browse subjects", chapters: "Chapters and units", topics: "Chapter topics",
    description: "Browse the topics in each subject and check off what you’ve finished.",
    back: "Back", progress: "Your progress", totalProgress: "Across all subjects", completed: "Completed topics",
    navigation: "Checklist path",
    signIn: "Sign in to save your progress.", loading: "Loading your progress…",
    practice: "Your practice by topic",
    practiceDetails: "Flashcard and ministerial results reflect your self-assessment.",
    practiceEmpty: "Answer bank or ministerial questions, or review flashcards to see your practice here.",
    misc: "Question results",
    states: { starting: "Getting started", strong: "Strong", improving: "Improving", practice: "Needs practice" },
  },
} as const;

type Counts = { done: number; total: number };
type ProgressRow = { id: string; topic_key: string; subject: string; completed: boolean };

function ratio({ done, total }: Counts) {
  return total ? done / total : 0;
}

function Meter({ counts }: { counts: Counts }) {
  return (
    <span aria-hidden="true" className="block h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <span className="block h-full rounded-full bg-primary" style={{ width: ratio(counts) * 100 + "%" }} />
    </span>
  );
}

const Missions = ({ language, onBack }: { language: AppLanguage; onBack: () => void }) => {
  const ar = language === "ar";
  const t = copy[language];
  const format = useMemo(() => new Intl.NumberFormat(ar ? "ar-IQ" : "en"), [ar]);
  const percent = useMemo(() => new Intl.NumberFormat(ar ? "ar-IQ" : "en", { style: "percent", maximumFractionDigits: 0 }), [ar]);
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [practice, setPractice] = useState<PracticeAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [chapter, setChapter] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);
  const saving = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!active || !user) return;
        setUserId(user.id);
        void loadTopicPractice().then(result => { if (active) setPractice(result); }).catch(() => {});
        const { data } = await supabase.from("mission_progress")
          .select("id, topic_key, subject, completed").eq("user_id", user.id);
        if (active) setRows(data ?? []);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load().catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!navigated.current) return;
    navigated.current = false;
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [subject, chapter]);

  const rowByKey = useMemo(() => new Map(rows.map(row => [row.topic_key, row])), [rows]);
  const countsFor = (topics: readonly { key: string }[]): Counts => ({
    total: topics.length,
    done: topics.filter(topic => rowByKey.get(topic.key)?.completed).length,
  });
  const countsLabel = ({ done, total }: Counts) => ar
    ? `${format.format(done)} من ${format.format(total)} موضوع`
    : `${format.format(done)} of ${format.format(total)} topics`;

  const goTo = (nextSubject: string | null, nextChapter: string | null = null) => {
    navigated.current = true;
    setSubject(nextSubject);
    setChapter(nextChapter);
  };

  const toggle = async (topicKey: string, subj: string) => {
    if (!userId) {
      toast.error(t.signIn);
      return;
    }
    if (loading || saving.current.has(topicKey)) return;
    saving.current.add(topicKey);
    const existing = rowByKey.get(topicKey);
    const next = !existing?.completed;
    try {
      if (existing) {
        setRows(current => current.map(row => row.id === existing.id ? { ...row, completed: next } : row));
        const { error } = await supabase.from("mission_progress")
          .update({ completed: next, updated_at: new Date().toISOString() }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("mission_progress")
          .insert({ user_id: userId, subject: subj, topic_key: topicKey, completed: true })
          .select("id, topic_key, subject, completed").single();
        if (error) throw error;
        if (data) setRows(current => [...current, data]);
      }
    } catch (error) {
      if (existing) setRows(current => current.map(row => row.id === existing.id ? existing : row));
      toast.error(error instanceof Error || (error && typeof error === "object" && "message" in error)
        ? String(error.message) : ar ? "تعذّر حفظ التقدّم." : "Could not save your progress.");
    } finally {
      saving.current.delete(topicKey);
    }
  };

  const selectedSubject = subject ? missionsData[subject] : null;
  const selectedChapter = selectedSubject?.chapters.find(item => item.key === chapter);
  const contentLanguage = subject && ALWAYS_AR.has(subject) ? "ar" : language;
  const topics = selectedChapter?.topics ?? (selectedSubject
    ? selectedSubject.chapters.flatMap(item => item.topics)
    : missionsOrder.flatMap(key => missionsData[key].chapters.flatMap(item => item.topics)));
  const counts = countsFor(topics);
  const progress = ratio(counts);
  const chapterNumber = selectedChapter?.key.match(/\d+$/)?.[0];
  const practiceByCategory = new Map<string, PracticeAttempt[]>();
  for (const attempt of practice) {
    if (attempt.subject !== subject || attempt.chapter !== chapterNumber) continue;
    const group = practiceByCategory.get(attempt.category_key) ?? [];
    group.push(attempt);
    practiceByCategory.set(attempt.category_key, group);
  }
  const Forward = ar ? ChevronLeft : ChevronRight;
  const Back = ar ? ChevronRight : ChevronLeft;
  const headingTitle = (selectedChapter ?? selectedSubject)?.[contentLanguage] ?? t.title;
  const tile = "min-w-0 rounded-2xl border border-border bg-card p-3.5 text-start shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/[.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-4";
  const iconTile = "grid size-10 shrink-0 place-items-center rounded-xl sm:size-11";

  return (
    <main dir={ar ? "rtl" : "ltr"} className="mx-auto w-full max-w-6xl px-3.5 pb-8 pt-4 sm:px-6 sm:pt-6">
      <div className="mb-3 flex min-h-11 items-center gap-2">
        <button type="button" aria-label={t.back} onClick={() => {
          if (chapter) goTo(subject);
          else if (subject) goTo(null);
          else onBack();
        }} className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Back aria-hidden="true" className="size-5" />
        </button>
        {selectedSubject && (
          <nav aria-label={t.navigation} className="flex min-w-0 items-center gap-1 text-sm font-semibold">
            <button type="button" onClick={() => goTo(null)} className="min-h-11 shrink-0 rounded-lg px-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{t.title}</button>
            {selectedChapter && (
              <>
                <Forward aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <button type="button" onClick={() => goTo(subject)} className="min-h-11 min-w-0 truncate rounded-lg px-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <bdi>{selectedSubject[contentLanguage]}</bdi>
                </button>
              </>
            )}
          </nav>
        )}
      </div>

      <header className="isolate mb-6 flex flex-col gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#111f3d] via-[#173563] to-[#21599c] px-4 py-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-7 sm:py-7">
        <div className="min-w-0">
          <BookOpenText aria-hidden="true" className="mb-3 size-7 text-sky-200 sm:size-8" strokeWidth={1.65} />
          <h1 ref={heading} tabIndex={-1} dir="auto" className="text-start text-3xl font-black leading-tight tracking-tight outline-none [overflow-wrap:anywhere] sm:text-4xl">{headingTitle}</h1>
          {!selectedSubject && <p className="mt-2 max-w-lg text-sm leading-6 text-sky-50/90 sm:text-base">{t.description}</p>}
        </div>

        {(userId || loading) ? (
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-2.5 sm:min-w-52 sm:p-3">
            <div className="grid size-[3.65rem] shrink-0 place-items-center rounded-full p-1 sm:size-[4.25rem]"
              style={{ background: `conic-gradient(from ${ar ? -progress * 360 : 0}deg, #7dd3fc ${progress * 100}%, rgb(255 255 255 / .18) 0)` }}
              aria-hidden="true">
              <span className="grid size-full place-items-center rounded-full bg-[#1b3965] text-sm font-black tabular-nums sm:text-base"><bdi>{loading ? "–" : percent.format(progress)}</bdi></span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold">{selectedSubject ? t.progress : t.totalProgress}</p>
              <p className="mt-0.5 text-xs leading-5 text-sky-50/90">
                {loading ? t.loading : <><span className="sr-only">{percent.format(progress)} · </span>{countsLabel(counts)}</>}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-sky-50/90">{t.signIn}</p>
        )}
      </header>

      {!selectedSubject && (
        <section aria-labelledby="fahrast-subjects" className="space-y-3">
          <h2 id="fahrast-subjects" className="text-lg font-black tracking-tight sm:text-xl">{t.browse}</h2>
          <ul className="grid gap-2.5 min-[380px]:grid-cols-2 sm:gap-3 xl:grid-cols-4">
            {missionsOrder.map(key => {
              const item = missionsData[key];
              const { Icon, tone } = subjectStyle[key as keyof typeof subjectStyle];
              const stats = countsFor(item.chapters.flatMap(part => part.topics));
              const count = format.format(item.chapters.length);
              return (
                <li key={key} className="min-w-0">
                  <button type="button" onClick={() => goTo(key)} className={`${tile} flex h-full w-full flex-col gap-3`}>
                    <span className="flex w-full min-w-0 items-center gap-2.5 min-[380px]:max-sm:flex-wrap">
                      <span className={`${iconTile} ${tone}`}><Icon aria-hidden="true" className="size-5" strokeWidth={1.8} /></span>
                      <span className="min-w-0 flex-1 min-[380px]:max-sm:order-1 min-[380px]:max-sm:basis-full">
                        <span className="block text-base font-bold leading-snug [overflow-wrap:anywhere]"><bdi>{item[ALWAYS_AR.has(key) ? "ar" : language]}</bdi></span>
                        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{ar ? `${count} أقسام` : `${count} sections`}</span>
                      </span>
                      <Forward aria-hidden="true" className="ms-auto size-4 shrink-0 text-muted-foreground" />
                    </span>
                    {userId && !loading && <span className="mt-auto block w-full border-t border-border/70 pt-2.5">
                      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
                        <span><span className="sr-only">{t.completed} · </span>{countsLabel(stats)}</span>
                        <bdi className="font-bold tabular-nums text-primary">{percent.format(ratio(stats))}</bdi>
                      </span>
                      <Meter counts={stats} />
                    </span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {selectedSubject && !selectedChapter && (
        <section aria-labelledby="fahrast-chapters" className="space-y-3">
          <h2 id="fahrast-chapters" className="text-lg font-black tracking-tight sm:text-xl">{t.chapters}</h2>
          <ul className="grid gap-2.5 sm:gap-3 md:grid-cols-2">
            {selectedSubject.chapters.map(item => {
              const stats = countsFor(item.topics);
              return (
                <li key={item.key} className="min-w-0">
                  <button type="button" onClick={() => goTo(selectedSubject.subject, item.key)} className={`${tile} flex h-full w-full items-center gap-3`}>
                    <span className={`${iconTile} bg-primary/10 text-primary`}><Layers aria-hidden="true" className="size-5" strokeWidth={1.8} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold leading-snug [overflow-wrap:anywhere]"><bdi>{item[contentLanguage]}</bdi></span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {userId && !loading ? countsLabel(stats) : ar ? `${format.format(stats.total)} موضوع` : `${format.format(stats.total)} topics`}
                      </span>
                      {userId && !loading && <span className="mt-2 block max-w-56"><Meter counts={stats} /></span>}
                    </span>
                    <Forward aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {selectedSubject && selectedChapter && (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
          <section aria-labelledby="fahrast-topics" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <header className="flex flex-wrap items-center gap-2 px-4 py-3.5 sm:px-5">
              <ClipboardList aria-hidden="true" className="size-5 shrink-0 text-primary" />
              <h2 id="fahrast-topics" className="min-w-0 flex-1 text-lg font-black leading-snug">{t.topics}</h2>
            </header>
            <ul className="divide-y divide-border border-t border-border">
              {selectedChapter.topics.map(topic => {
                const done = rowByKey.get(topic.key)?.completed ?? false;
                return (
                  <li key={topic.key}>
                    <button type="button" aria-pressed={done} disabled={loading} onClick={() => void toggle(topic.key, selectedSubject.subject)}
                      className={`flex min-h-[3.25rem] w-full items-center gap-3 px-4 py-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5 ${done ? "bg-primary/[.05] hover:bg-primary/10" : "hover:bg-muted/60"}`}>
                      <span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded-md border ${done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50 bg-background"}`}>
                        {done && <Check className="size-3.5" strokeWidth={2.5} />}
                      </span>
                      <bdi className="min-w-0 text-sm font-semibold leading-relaxed [overflow-wrap:anywhere] sm:text-base">{topic[contentLanguage]}</bdi>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
          <aside aria-labelledby="fahrast-practice" className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <h2 id="fahrast-practice" className="flex items-center gap-2 text-base font-black">
              <ArrowUpRight aria-hidden="true" className="size-5 shrink-0 text-primary" />{t.practice}
            </h2>
            {practiceByCategory.size === 0 ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.practiceEmpty}</p>
            ) : (
              <>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{t.practiceDetails}</p>
                <ul aria-label={t.misc} className="mt-3 divide-y divide-border">
                  {[...practiceByCategory].map(([key, attempts]) => {
                    const summary = topicSummary(attempts);
                    return (
                      <li key={key} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-start justify-between gap-1.5">
                          <bdi className="min-w-0 text-sm font-semibold [overflow-wrap:anywhere]">{categoryLabel(key, language)}</bdi>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{t.states[summary.state]}</span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{ar
                          ? `${format.format(summary.count)} أسئلة مختلفة · ${format.format(summary.objectiveCount)} مصحّحة تلقائياً`
                          : `${format.format(summary.count)} distinct questions · ${format.format(summary.objectiveCount)} automatically graded`}</p>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
};

export default Missions;
