// Full Arabic translation of the identical uploaded deck, with separate CH6 IDs.
import { ahmedNadawiChemCh4CardsAr } from "./flashcardsChemCh4AhmedNadawiAr";
import type { AhmedNadawiChemCh6Card } from "./flashcardsChemCh6AhmedNadawi";

export const ahmedNadawiChemCh6CardsAr: AhmedNadawiChemCh6Card[] = ahmedNadawiChemCh4CardsAr.map((card) => ({
  ...card,
  id: card.id.replace(/^CH4-/, "CH6-"),
}));
