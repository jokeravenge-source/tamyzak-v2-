import type { Flashcard } from "./flashcards";
import { flashcardsFrenchAdverbsAr } from "./flashcardsFrenchAdverbsAr";
import { flashcardsFrenchFeminineAr } from "./flashcardsFrenchFeminineAr";
import { flashcardsFrenchInterrogationAr } from "./flashcardsFrenchInterrogationAr";
import { flashcardsFrenchNegationAr } from "./flashcardsFrenchNegationAr";
import { flashcardsFrenchPluralAr } from "./flashcardsFrenchPluralAr";
import { flashcardsFrenchRelativePronounsAr } from "./flashcardsFrenchRelativePronounsAr";
import { flashcardsFrenchReadingComprehension } from "./flashcardsFrenchReadingComprehension";

export type FrenchFlashcardDeck = {
  chapter: number;
  titleAr: string;
  titleEn: string;
  subtitle: string;
  cards: readonly Flashcard[];
};

export const FRENCH_FLASHCARD_DECKS: readonly FrenchFlashcardDeck[] = [
  { chapter: 1, titleAr: "النفي", titleEn: "Negation", subtitle: "ne ... pas / jamais / plus", cards: flashcardsFrenchNegationAr },
  { chapter: 2, titleAr: "الاستفهام", titleEn: "Interrogation", subtitle: "Est-ce que / Inversion", cards: flashcardsFrenchInterrogationAr },
  { chapter: 3, titleAr: "ضمائر الوصل", titleEn: "Relative Pronouns", subtitle: "Qui / Que / Où / Dont", cards: flashcardsFrenchRelativePronounsAr },
  { chapter: 4, titleAr: "التأنيث", titleEn: "Feminization", subtitle: "Règles & exceptions", cards: flashcardsFrenchFeminineAr },
  { chapter: 5, titleAr: "الجمع", titleEn: "Plural", subtitle: "Pluriel des noms & adjectifs", cards: flashcardsFrenchPluralAr },
  { chapter: 6, titleAr: "اشتقاق الظروف", titleEn: "Adverbs", subtitle: "-ment / -emment / -amment", cards: flashcardsFrenchAdverbsAr },
  { chapter: 7, titleAr: "القطع الاستيعابية", titleEn: "Reading Comprehension", subtitle: "5 textes · 37 questions", cards: flashcardsFrenchReadingComprehension },
] as const;

export const FRENCH_FLASHCARD_TOTAL = FRENCH_FLASHCARD_DECKS.reduce(
  (total, deck) => total + deck.cards.length,
  0,
);

export function getFrenchFlashcardDeck(chapter: string | number) {
  return FRENCH_FLASHCARD_DECKS.find((deck) => deck.chapter === Number(chapter));
}
