import type { Flashcard } from "@/data/flashcards";

function normalizedText(text: string): string {
  // Ignore copy/paste whitespace and equivalent Unicode spellings only.
  // Preserve case, punctuation, Arabic diacritics and mathematical symbols.
  return text.normalize("NFC").trim().replace(/\s+/gu, " ");
}

/** Keep the first copy of a question–answer pair without mutating its data. */
export function uniqueFlashcards<T extends Flashcard>(cards: readonly T[]): T[] {
  const seen = new Set<string>();
  return cards.filter((card) => {
    // A tuple avoids collisions when either text contains a separator.
    const key = JSON.stringify([normalizedText(card.q), normalizedText(card.a)]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
