// The uploaded electrochemistry deck is placed in CH6 at the user's request.
// Its contents are identical to the supplied CH4 source; reuse those reviewed cards.
// Keep the original PDF/exercise references and give CH6 its own card IDs.
import {
  ahmedNadawiChemCh4Cards,
  ahmedNadawiChemCh4Source,
  ahmedNadawiChemCh4Topics,
  type AhmedNadawiChemCh4Card,
} from "./flashcardsChemCh4AhmedNadawi";

export type AhmedNadawiChemCh6Card = AhmedNadawiChemCh4Card;

export const ahmedNadawiChemCh6Source = {
  ...ahmedNadawiChemCh4Source,
  file: "Chapter_6_Electrochemistry_Complete_Study_Deck.txt",
  uploadedFile: "Chapter_4_Electrochemistry_Complete_Study_Deck (1).txt",
  sourceChapter: 4,
  displayChapter: 6,
} as const;

export const ahmedNadawiChemCh6Topics = ahmedNadawiChemCh4Topics;

export const ahmedNadawiChemCh6Cards: AhmedNadawiChemCh6Card[] = ahmedNadawiChemCh4Cards.map((card) => ({
  ...card,
  id: card.id.replace(/^CH4-/, "CH6-"),
}));
