import type { Flashcard } from "@/data/flashcards";

export type FrenchFlashcardOverride = {
  id: string;
  chapter: number;
  card_index: number;
  question: string;
  answer: string;
  hidden: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export function applyFrenchFlashcardOverrides(
  cards: readonly Flashcard[],
  chapter: number,
  overrides: readonly FrenchFlashcardOverride[],
): Flashcard[] {
  const byIndex = new Map(
    overrides
      .filter((item) => item.chapter === chapter)
      .map((item) => [item.card_index, item]),
  );

  return cards.flatMap((card, index) => {
    const override = byIndex.get(index);
    if (override?.hidden) return [];
    return [{
      ...card,
      q: override?.question ?? card.q,
      a: override?.answer ?? card.a,
    }];
  });
}
