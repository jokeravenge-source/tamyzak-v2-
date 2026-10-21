import rawCards from "./flashcardsChemCh3AhmedNadawiEn.text.json";
import topics from "./flashcardsChemCh3AhmedNadawiEn.topics.json";
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
export const ahmedNadawiChemCh3CardsEn = rawCards as AhmedChemCh3EnglishCard[];
export const ahmedNadawiChemCh3TopicsEn = topics;
