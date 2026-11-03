import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, Layers3, Lock } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import type { ChapterMeta } from "@/data/subjectChapters";
import { supabase } from "@/integrations/supabase/client";
import { chapterCardSummaries, chapterReviewProgress, uniqueSummaryCount } from "@/lib/chapterCardCounts";
import { reviewFingerprint, summarizeCard, textFingerprint, type FlashcardSummary } from "@/lib/flashcardSummaryIdentity";
import { loadDeckStates, type SrsState } from "@/lib/srs";
import "./ChapterFlashcardsGrid.css";

const accents = ["217 95% 60%", "258 85% 64%", "194 85% 44%", "343 85% 64%", "33 90% 48%", "158 72% 40%", "287 75% 60%", "224 80% 62%"];

export default function ChapterFlashcardsGrid({ chapters, subject, variant, language, onOpenChapter }: {
  chapters: ChapterMeta[];
  subject: string;
  variant: string;
  language: AppLanguage;
  onOpenChapter: (chapter: ChapterMeta) => void;
}) {
  const isArabic = language === "ar";
  const [reviews, setReviews] = useState<Record<number, Map<string, SrsState>>>({});
  const [summaries, setSummaries] = useState<Record<number, readonly FlashcardSummary[]>>({});

  useEffect(() => {
    let active = true;
    Promise.all(chapters.filter(chapter => !chapter.locked).map(async chapter => {
      return [chapter.n, await loadDeckStates(subject, String(chapter.n))] as const;
    })).then(entries => { if (active) setReviews(Object.fromEntries(entries)); }).catch(() => {
      // Source cards stay accessible when progress sync is unavailable.
    });
    return () => { active = false; };
  }, [chapters, subject]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const decks: Record<number, readonly FlashcardSummary[]> = {};
      const source = (chapter: number) => chapterCardSummaries(subject, variant, language, chapter) ?? [];
      const sourceOnly = variant === "ahmed-al-nadawi" || variant === "wijdan" || variant === "nadia-al-nuaimi";
      for (let offset = 0; !sourceOnly; offset += 1000) {
        const { data, error } = await supabase.from("custom_flashcards").select("chapter,question,answer")
          .eq("subject", subject).eq("language", language).eq("approved", true)
          .order("id").range(offset, offset + 999);
        if (!active) return;
        if (error) break;
        for (const row of data ?? []) {
          const chapter = Number(row.chapter);
          // Arabic literature uses a separate source in the study screen.
          if (subject === "arabic" && (chapter === 1 || chapter === 7)) continue;
          decks[chapter] = [...(decks[chapter] ?? source(chapter)), summarizeCard(row.question, row.answer)];
        }
        if (!data || data.length < 1000) break;
      }
      if (subject === "chemistry" && variant === "ahmed-al-nadawi") {
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await supabase.from("ahmed_flashcard_overrides").select("chapter,card_id,question,answer,deleted")
            .eq("language", language).order("chapter").order("card_id").range(offset, offset + 999);
          if (!active) return;
          if (error) break;
          for (const row of data ?? []) {
            decks[row.chapter] = (decks[row.chapter] ?? source(row.chapter)).flatMap(card => {
              if (card[3] !== row.card_id) return [card];
              if (row.deleted) return [];
              return [[row.question === null ? card[0] : textFingerprint(row.question), row.answer === null ? card[1] : textFingerprint(row.answer), row.question === null ? card[2] : reviewFingerprint(row.question), card[3]] as FlashcardSummary];
            });
          }
          if (!data || data.length < 1000) break;
        }
      }
      if (active) setSummaries(decks);
    };
    void load().catch(() => { /* Keep source counts when offline. */ });
    return () => { active = false; };
  }, [subject, variant, language]);

  return <section className="chapter-decks relative z-10 mx-auto mt-14 w-full max-w-6xl md:mt-20" dir={isArabic ? "rtl" : "ltr"} aria-label={isArabic ? "فصول البطاقات التعليمية" : "Flashcard chapters"}>
    <div className="chapter-decks__grid">
      {chapters.map((chapter, index) => {
        const cards = summaries[chapter.n] ?? chapterCardSummaries(subject, variant, language, chapter.n);
        const cardCount = cards === null ? null : uniqueSummaryCount(cards);
        const state = chapterReviewProgress(subject, chapter.n, cards ?? [], reviews[chapter.n] ?? new Map());
        const reviewed = cardCount === null ? state.reviewed : Math.min(state.reviewed, cardCount);
        const percent = cardCount ? Math.round(reviewed / cardCount * 100) : 0;
        const due = Math.min(state.due, reviewed);
        const subtitle = chapter.subtitle.replace(/^\d+\s+(?:text flashcards|flashcards|cards|بطاقات|بطاقة)\s*(?:·\s*|$)/, "") || (isArabic ? chapter.title : chapter.arTitle);
        return <button key={chapter.n} type="button" disabled={chapter.locked} onClick={() => onOpenChapter(chapter)}
          className="chapter-deck-card" style={{ "--deck-accent": accents[index % accents.length] } as CSSProperties}>
          <div className="chapter-deck-card__header">
            <span className="chapter-deck-card__icon" aria-hidden="true">{chapter.locked ? <Lock /> : <Layers3 />}</span>
            <span className="chapter-deck-card__count">{chapter.locked ? (isArabic ? "مقفل" : "Locked") : `${cardCount ?? "—"} ${isArabic ? "بطاقة" : "cards"}`}</span>
          </div>
          <div className="chapter-deck-card__content">
            <p className="chapter-deck-card__number">{String(chapter.n).padStart(2, "0")}</p>
            <h3 className="chapter-deck-card__title">{isArabic ? chapter.arTitle : chapter.title}</h3>
            <p className="chapter-deck-card__subtitle" dir="auto">{subtitle}</p>
          </div>
          <div className="chapter-deck-card__progress">
            <div className="chapter-deck-card__progress-labels"><span>{reviewed} {isArabic ? "مراجعة" : "reviewed"}</span><span>{percent}%</span></div>
            <div className="chapter-deck-card__track" aria-hidden="true"><div className="chapter-deck-card__fill" style={{ width: `${percent}%` }} /></div>
          </div>
          <div className="chapter-deck-card__footer">
            <span className={due && !chapter.locked ? "text-amber-600 dark:text-amber-300" : undefined}>{chapter.locked ? (isArabic ? "قريباً" : "Coming soon") : due ? `${due} ${isArabic ? "مستحقة" : "due"}` : cardCount === 0 ? (isArabic ? "لا توجد بطاقات بعد" : "No cards yet") : (isArabic ? "جاهزة للدراسة" : "Ready to study")}</span>
            {chapter.locked ? <Lock className="chapter-deck-card__lock" aria-hidden="true" /> : <ArrowRight className="chapter-deck-card__arrow" aria-hidden="true" />}
          </div>
        </button>;
      })}
    </div>
  </section>;
}
