export type AhmedFlashcardOverride = {
  chapter: number;
  language: string;
  card_id: string;
  question: string | null;
  answer: string | null;
  deleted: boolean;
};

export function ahmedCardId(card: { id?: string }, chapter: number, index: number) {
  return card.id ?? `CH${chapter}-${String(index + 1).padStart(3, "0")}`;
}

export function applyAhmedFlashcardOverrides<T extends { id?: string; q: string; a: string; answerBlocks?: unknown }>(
  cards: readonly T[], chapter: number, language: string, overrides: readonly AhmedFlashcardOverride[],
): T[] {
  const byId = new Map(overrides.filter((row) => row.chapter === chapter && row.language === language).map((row) => [row.card_id, row]));
  return cards.flatMap((card, index) => {
    const row = byId.get(ahmedCardId(card, chapter, index));
    if (!row) return [card];
    if (row.deleted) return [];
    return [{ ...card, q: row.question ?? card.q, a: row.answer ?? card.a, ...(row.answer !== null ? { answerBlocks: undefined } : {}) }];
  });
}