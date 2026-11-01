import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CircleHelp,
  Clock3,
  Gauge,
  Languages,
  Layers3,
  Link2,
  ListPlus,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import {
  FRENCH_FLASHCARD_DECKS,
  FRENCH_FLASHCARD_TOTAL,
} from "@/data/frenchFlashcardDecks";
import { isDue, loadDeckStates } from "@/lib/srs";

type DeckProgress = { reviewed: number; due: number };

const deckIcons = [Layers3, CircleHelp, Link2, UserRound, ListPlus, Gauge] as const;
const deckStyles = [
  "from-blue-500/20 via-indigo-500/10 to-transparent text-blue-500 border-blue-400/30",
  "from-violet-500/20 via-purple-500/10 to-transparent text-violet-500 border-violet-400/30",
  "from-cyan-500/20 via-sky-500/10 to-transparent text-cyan-500 border-cyan-400/30",
  "from-rose-500/20 via-pink-500/10 to-transparent text-rose-500 border-rose-400/30",
  "from-amber-500/20 via-orange-500/10 to-transparent text-amber-500 border-amber-400/30",
  "from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-500 border-emerald-400/30",
] as const;

const emptyProgress = () => Object.fromEntries(
  FRENCH_FLASHCARD_DECKS.map((deck) => [deck.chapter, { reviewed: 0, due: 0 }]),
) as Record<number, DeckProgress>;

export default function FrenchFlashcardsDashboard({
  language,
  onOpenDeck,
}: {
  language: AppLanguage;
  onOpenDeck: (chapter: number) => void;
}) {
  const isArabic = language === "ar";
  const [progress, setProgress] = useState<Record<number, DeckProgress>>(emptyProgress);

  useEffect(() => {
    let active = true;
    Promise.all(FRENCH_FLASHCARD_DECKS.map(async (deck) => {
      const states = [...(await loadDeckStates("french", String(deck.chapter))).values()];
      return [deck.chapter, {
        reviewed: states.filter((state) => state.lastRating !== null).length,
        due: states.filter((state) => state.lastRating !== null && isDue(state)).length,
      }] as const;
    })).then((entries) => {
      if (active) setProgress(Object.fromEntries(entries));
    }).catch(() => {
      // The deck remains fully usable when progress sync is unavailable.
    });
    return () => { active = false; };
  }, []);

  const totals = useMemo(() => FRENCH_FLASHCARD_DECKS.reduce(
    (result, deck) => ({
      reviewed: result.reviewed + (progress[deck.chapter]?.reviewed ?? 0),
      due: result.due + (progress[deck.chapter]?.due ?? 0),
    }),
    { reviewed: 0, due: 0 },
  ), [progress]);
  const overallPercent = Math.round((totals.reviewed / FRENCH_FLASHCARD_TOTAL) * 100);
  const continueDeck = useMemo(() => {
    const due = FRENCH_FLASHCARD_DECKS.find((deck) => (progress[deck.chapter]?.due ?? 0) > 0);
    if (due) return due;
    const started = [...FRENCH_FLASHCARD_DECKS]
      .reverse()
      .find((deck) => {
        const reviewed = progress[deck.chapter]?.reviewed ?? 0;
        return reviewed > 0 && reviewed < deck.cards.length;
      });
    return started ?? FRENCH_FLASHCARD_DECKS.find((deck) => (progress[deck.chapter]?.reviewed ?? 0) < deck.cards.length)
      ?? FRENCH_FLASHCARD_DECKS[0];
  }, [progress]);

  return (
    <section className="relative z-10 mx-auto mt-10 w-full max-w-6xl md:mt-14" aria-label={isArabic ? "لوحة بطاقات الفرنسية" : "French flashcards dashboard"}>
      <div className="relative overflow-hidden rounded-[2rem] border border-violet-400/25 bg-gradient-to-br from-[#172554] via-[#312e81] to-[#581c87] p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-blue-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
              <Sparkles className="size-3.5 text-amber-300" />
              {isArabic ? "الأستاذ محمد علي الكناني" : "Mohammed Ali Al-Kinani"}
            </div>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
              {isArabic ? "راجع قواعد الفرنسية من لوحة واحدة" : "Master French grammar from one dashboard"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              {isArabic
                ? "ستة مواضيع مرتبة، مع تتبع مراجعتك والبطاقات المستحقة والعودة السريعة إلى آخر تقدمك."
                : "Six organized grammar decks with review progress, due cards, and a quick path back to studying."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenDeck(continueDeck.chapter)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-indigo-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <BookOpenCheck className="size-5" />
            {totals.reviewed > 0
              ? (isArabic ? "متابعة المراجعة" : "Continue reviewing")
              : (isArabic ? "ابدأ المراجعة" : "Start reviewing")}
            <ArrowRight className={`size-4 ${isArabic ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: FRENCH_FLASHCARD_TOTAL, label: isArabic ? "بطاقة" : "Flashcards", Icon: Languages },
            { value: FRENCH_FLASHCARD_DECKS.length, label: isArabic ? "مواضيع" : "Decks", Icon: Layers3 },
            { value: totals.reviewed, label: isArabic ? "تمت مراجعتها" : "Reviewed", Icon: BookOpenCheck },
            { value: totals.due, label: isArabic ? "مستحقة الآن" : "Due now", Icon: Clock3 },
          ].map(({ value, label, Icon }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
              <Icon className="size-4 text-violet-200" />
              <strong className="mt-3 block text-2xl font-black tabular-nums">{value.toLocaleString("en-US")}</strong>
              <span className="text-xs font-semibold text-white/60">{label}</span>
            </div>
          ))}
        </div>

        <div className="relative mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
          <div className="mb-2 flex items-center justify-between gap-4 text-xs font-bold">
            <span>{isArabic ? "التقدم الكلي" : "Overall progress"}</span>
            <span>{totals.reviewed} / {FRENCH_FLASHCARD_TOTAL} · {overallPercent}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 transition-[width] duration-700" style={{ width: `${overallPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FRENCH_FLASHCARD_DECKS.map((deck, index) => {
          const Icon = deckIcons[index];
          const deckProgress = progress[deck.chapter] ?? { reviewed: 0, due: 0 };
          const percent = Math.round((deckProgress.reviewed / deck.cards.length) * 100);
          return (
            <button
              type="button"
              key={deck.chapter}
              onClick={() => onOpenDeck(deck.chapter)}
              className={`group relative min-h-64 overflow-hidden rounded-3xl border bg-gradient-to-br p-6 text-start shadow-lg transition duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${deckStyles[index]}`}
            >
              <div className="absolute inset-0 bg-card/85 -z-10" />
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-current/10 ring-1 ring-current/15">
                  <Icon className="size-6" />
                </span>
                <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-bold text-muted-foreground">
                  {deck.cards.length} {isArabic ? "بطاقة" : "cards"}
                </span>
              </div>
              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">0{deck.chapter}</p>
                <h3 className="mt-2 text-xl font-black text-foreground">{isArabic ? deck.titleAr : deck.titleEn}</h3>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{deck.subtitle}</p>
              </div>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span>{deckProgress.reviewed} {isArabic ? "مراجعة" : "reviewed"}</span>
                  <span>{percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-current transition-[width] duration-500" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 text-xs font-black">
                <span className={deckProgress.due ? "text-amber-600 dark:text-amber-300" : "text-muted-foreground"}>
                  {deckProgress.due
                    ? `${deckProgress.due} ${isArabic ? "مستحقة" : "due"}`
                    : (isArabic ? "جاهزة للدراسة" : "Ready to study")}
                </span>
                <ArrowRight className={`size-4 transition-transform group-hover:translate-x-1 ${isArabic ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
