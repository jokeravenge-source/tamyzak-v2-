import { useEffect, useState } from "react";
import {
  ArrowRight,
  CircleHelp,
  Gauge,
  MessageSquareText,
  Layers3,
  Link2,
  ListPlus,
  UserRound,
} from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { supabase } from "@/integrations/supabase/client";
import {
  FRENCH_FLASHCARD_DECKS,
} from "@/data/frenchFlashcardDecks";
import { isDue, loadDeckStates } from "@/lib/srs";

type DeckProgress = { reviewed: number; due: number };

const deckIcons = [Layers3, CircleHelp, Link2, UserRound, ListPlus, Gauge, MessageSquareText] as const;
const deckStyles = [
  "from-blue-500/20 via-indigo-500/10 to-transparent text-blue-500 border-blue-400/30",
  "from-violet-500/20 via-purple-500/10 to-transparent text-violet-500 border-violet-400/30",
  "from-cyan-500/20 via-sky-500/10 to-transparent text-cyan-500 border-cyan-400/30",
  "from-rose-500/20 via-pink-500/10 to-transparent text-rose-500 border-rose-400/30",
  "from-amber-500/20 via-orange-500/10 to-transparent text-amber-500 border-amber-400/30",
  "from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-500 border-emerald-400/30",
  "from-fuchsia-500/20 via-violet-500/10 to-transparent text-fuchsia-500 border-fuchsia-400/30",
] as const;

const emptyProgress = () => Object.fromEntries(
  FRENCH_FLASHCARD_DECKS.map((deck) => [deck.chapter, { reviewed: 0, due: 0 }]),
) as Record<number, DeckProgress>;

const sourceCardCounts = () => Object.fromEntries(
  FRENCH_FLASHCARD_DECKS.map((deck) => [deck.chapter, deck.cards.length]),
) as Record<number, number>;

export default function FrenchFlashcardsDashboard({
  language,
  onOpenDeck,
}: {
  language: AppLanguage;
  onOpenDeck: (chapter: number) => void;
}) {
  const isArabic = language === "ar";
  const [progress, setProgress] = useState<Record<number, DeckProgress>>(emptyProgress);
  const [cardCounts, setCardCounts] = useState<Record<number, number>>(sourceCardCounts);

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

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("french_flashcard_overrides").select("chapter, hidden"),
      supabase.from("custom_flashcards").select("chapter").eq("subject", "french").eq("language", language).eq("approved", true),
    ]).then(([overrideResult, customResult]) => {
      if (!active || overrideResult.error || customResult.error) return;
      const next = sourceCardCounts();
      for (const item of overrideResult.data ?? []) {
        if (item.hidden && next[item.chapter] != null) next[item.chapter] = Math.max(0, next[item.chapter] - 1);
      }
      for (const item of customResult.data ?? []) {
        const deck = Number(item.chapter);
        if (next[deck] != null) next[deck] += 1;
      }
      setCardCounts(next);
    });
    return () => { active = false; };
  }, [language]);

  return (
    <section className="relative z-10 mx-auto mt-10 w-full max-w-6xl md:mt-14" aria-label={isArabic ? "أقسام بطاقات الفرنسية" : "French flashcard decks"}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FRENCH_FLASHCARD_DECKS.map((deck, index) => {
          const Icon = deckIcons[index];
          const deckProgress = progress[deck.chapter] ?? { reviewed: 0, due: 0 };
          const cardCount = cardCounts[deck.chapter] ?? deck.cards.length;
          const percent = cardCount ? Math.round((deckProgress.reviewed / cardCount) * 100) : 0;
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
                  {cardCount} {isArabic ? "بطاقة" : "cards"}
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
