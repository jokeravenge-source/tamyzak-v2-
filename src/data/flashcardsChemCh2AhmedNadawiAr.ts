// Ahmed Al-Nadawi Chemistry Chapter 2 — complete Arabic translation of all 429 source cards.
// Match Arabic cards to the English originals by position and source ID;
// preserve source page, exam label, exact ministerial year and source caveats.
import { ahmedNadawiChemCh2Cards } from "./flashcardsChemCh2AhmedNadawi";
import { chemAhmedCh2Ar001_055 } from "./chemAhmedCh2Ar001_055";
import { chemAhmedCh2Ar056_110 } from "./chemAhmedCh2Ar056_110";
import { chemAhmedCh2Ar111_165 } from "./chemAhmedCh2Ar111_165";
import { chemAhmedCh2Ar166_220 } from "./chemAhmedCh2Ar166_220";
import { chemAhmedCh2Ar221_275 } from "./chemAhmedCh2Ar221_275";
import { chemAhmedCh2Ar276_305 } from "./chemAhmedCh2Ar276_305";
import { chemAhmedCh2Ar306_345 } from "./chemAhmedCh2Ar306_345";
import { chemAhmedCh2Ar346_385 } from "./chemAhmedCh2Ar346_385";
import { chemAhmedCh2Ar386_429 } from "./chemAhmedCh2Ar386_429";

const translatedCards = [
  ...chemAhmedCh2Ar001_055,
  ...chemAhmedCh2Ar056_110,
  ...chemAhmedCh2Ar111_165,
  ...chemAhmedCh2Ar166_220,
  ...chemAhmedCh2Ar221_275,
  ...chemAhmedCh2Ar276_305,
  ...chemAhmedCh2Ar306_345,
  ...chemAhmedCh2Ar346_385,
  ...chemAhmedCh2Ar386_429,
];

if (translatedCards.length !== ahmedNadawiChemCh2Cards.length ||
    translatedCards.some((card, index) => card.id !== ahmedNadawiChemCh2Cards[index].id || card.topic !== ahmedNadawiChemCh2Cards[index].topic)) {
  throw new Error("Ahmed Al-Nadawi CH2 Arabic flashcard deck does not match source card IDs/topics");
}

export const ahmedNadawiChemCh2CardsAr = translatedCards.map((card, index) => ({
  ...ahmedNadawiChemCh2Cards[index],
  q: card.q,
  a: card.a,
}));
