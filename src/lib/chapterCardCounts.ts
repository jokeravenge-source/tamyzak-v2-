import sourceSummaries from "@/data/flashcardDeckSummaries.json";
import { fingerprint, type FlashcardSummary } from "./flashcardSummaryIdentity";
import { isDue, type SrsState } from "./srs";

/** Source metadata is generated with: node --import tsx scripts/generate-flashcard-counts.ts --write */
export function chapterCardSummaries(subject: string, variant: string, language: string, chapter: number): readonly FlashcardSummary[] | null {
  return (sourceSummaries as unknown as Record<string, FlashcardSummary[]>)[`${subject}:${variant}:${language}:${chapter}`] ?? null;
}

export function uniqueSummaryCount(cards: readonly FlashcardSummary[]) {
  return new Set(cards.map(card => `${card[0]}:${card[1]}`)).size;
}

export function chapterCardCount(subject: string, variant: string, language: string, chapter: number): number | null {
  const cards = chapterCardSummaries(subject, variant, language, chapter);
  return cards === null ? null : uniqueSummaryCount(cards);
}

export function chapterReviewProgress(subject: string, chapter: number, cards: readonly FlashcardSummary[], states: ReadonlyMap<string, SrsState>) {
  const keys = new Set(cards.map(card => card[2]));
  const prefix = `${subject}:${chapter}:`;
  let reviewed = 0, due = 0;
  for (const [key, state] of states) {
    // Stored suffixes are already normalized and truncated by srs.cardKey().
    if (state.lastRating === null || !key.startsWith(prefix) || !keys.has(fingerprint(key.slice(prefix.length)))) continue;
    reviewed++;
    if (isDue(state)) due++;
  }
  return { reviewed, due };
}
