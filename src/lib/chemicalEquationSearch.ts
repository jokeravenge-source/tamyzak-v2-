import { chemicalEquationTopics, chemicalEquations, type ChemicalEquationTopic } from "@/data/chemicalEquations";

// Normalize search only: accept H₂O, H2O, or H_2O and Arabic without vowel marks.
export function normalizeEquationSearch(text: string): string {
  return text.normalize("NFKC").toLocaleLowerCase()
    .replace(/[\u064b-\u065f\u0670\u0640]/g, "")
    .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي")
    .replace(/[−–]/g, "-").replace(/⁄/g, "/")
    .replace(/[\s_{}\\]/g, "");
}

export function filterChemicalEquations(query: string, topic: ChemicalEquationTopic | "all" = "all") {
  const normalized = normalizeEquationSearch(query.trim());
  return chemicalEquations.filter((equation) => {
    if (topic !== "all" && equation.topic !== topic) return false;
    if (!normalized) return true;
    const heading = chemicalEquationTopics.find((item) => item.id === equation.topic)!.title;
    return [heading.ar, heading.en, equation.title.ar, equation.title.en,
      equation.subtopic.ar, equation.subtopic.en, equation.formula,
      equation.value?.text ?? "", equation.hint.ar, equation.hint.en]
      .some((text) => normalizeEquationSearch(text).includes(normalized));
  });
}
