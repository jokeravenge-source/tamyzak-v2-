import rawCards from "./flashcardsChemCh3AhmedNadawiEn.text.json";
import topics from "./flashcardsChemCh3AhmedNadawiEn.topics.json";
import { ahmedNadawiChemCh3VerbatimOverrides } from "./flashcardsChemCh3AhmedNadawiEnVerbatim";
import type { StudyTextBlock } from "@/components/TextStudyContent";

export type AhmedChemCh3EnglishCard = {
  id: string;
  topic: string;
  kind: string;
  pages: string;
  q: string;
  a: string;
  answerBlocks: StudyTextBlock[];
};

const sourceCards = rawCards as AhmedChemCh3EnglishCard[];

export const ahmedNadawiChemCh3CardsEn: AhmedChemCh3EnglishCard[] = sourceCards.map(card => {
  const verbatim = ahmedNadawiChemCh3VerbatimOverrides[card.id];
  if (!verbatim) return card;

  const answerBlocks: StudyTextBlock[] = [{ type: "text", text: verbatim.a }];
  return {
    ...card,
    q: verbatim.q,
    a: verbatim.a,
    answerBlocks,
  };
});

export const ahmedNadawiChemCh3TopicsEn = topics;

export const ahmedNadawiChemCh3SourceAudit = {
  file: "Chapter three(1).pdf",
  pages: 171,
  sha256: "f817d279ab990525ad681a3929f0665c1e1bf0a2cd509c1779443f8484360b11",
  verbatimCards: Object.keys(ahmedNadawiChemCh3VerbatimOverrides).length,
  calculationCardsPreserved: true,
} as const;
