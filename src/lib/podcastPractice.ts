import { normalizeStudySearch } from "./studySearch";
import { loadRaceQuestionBank } from "./raceQuestionBank";
import { loadSource } from "@/features/pdf-builder/bankSources";

export type PracticeKind = "ministerial" | "mcq" | "both";
export type PodcastPracticeQuestion = {
  id: string;
  kind: "ministerial" | "mcq";
  question: string;
  answer: string;
  choices?: string[];
  answerIndex?: number;
  explanation?: string | null;
};
const stopWords = new Set([
  "محاضره",
  "مراجعه",
  "الفصل",
  "شرح",
  "الاستاذ",
  "السادس",
  "العلمي",
  "الجزء",
  "درس",
  "موضوع",
  "lecture",
  "chapter",
  "lesson",
  "review",
  "the",
  "and",
  "with",
  "for",
]);

export function relatedPractice(
  items: PodcastPracticeQuestion[],
  topic: string | string[],
) {
  const aliases = (Array.isArray(topic) ? topic : [topic]).map((name) => [
    ...new Set(
      normalizeStudySearch(name)
        .split(/[^\p{L}\p{N}]+/u)
        .filter((term) => term.length >= 3 && !stopWords.has(term))
        .map((term) => /^[\u0621-\u064a]+$/.test(term) ? term.replace(/^ال/, "") : term),
    ),
  ]).filter((terms) => terms.length);
  if (!aliases.length) return [];
  return items
    .map((item) => {
      const text = normalizeStudySearch(`${item.question} ${item.answer} ${item.explanation ?? ""}`);
      return {
        item,
        score: Math.max(...aliases.map((terms) => {
          const matched = terms.filter((term) => text.includes(term)).length;
          return matched >= Math.ceil(terms.length * 0.6) ? matched / terms.length : 0;
        })),
      };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.item);
}

export async function loadPodcastPractice(
  subject: string,
  topic: string | string[],
  language: "ar" | "en",
  kind: PracticeKind,
  signal: AbortSignal,
) {
  const items: PodcastPracticeQuestion[] = [];
  let partial = false;
  if (kind !== "mcq") {
    const chapters = await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        loadSource(`ministerial:${subject}:${language}:${i + 1}`),
      ),
    );
    chapters.forEach((cards, chapter) =>
      cards.forEach((card, index) =>
        items.push({
          id: `ministerial:${subject}:${chapter + 1}:${index}`,
          kind: "ministerial",
          question: card.q,
          answer: card.a,
        }),
      ),
    );
  }
  if (kind !== "ministerial") {
    const result = await loadRaceQuestionBank(language, signal);
    partial = result.partial;
    result.questions
      .filter((row) => row.subject === subject)
      .forEach((row) =>
        items.push({
          id: row.id,
          kind: "mcq",
          question: row.question,
          answer: row.choices[row.answer_index],
          choices: row.choices,
          answerIndex: row.answer_index,
          explanation: row.explanation,
        }),
      );
  }
  const seen = new Set<string>();
  const related = relatedPractice(items, topic).filter((item) => {
    const key = `${item.kind}:${normalizeStudySearch(item.question)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // Keep both requested categories represented even when one bank has more matches.
  return {
    questions:
      kind === "both"
        ? [
            ...related.filter((q) => q.kind === "ministerial").slice(0, 5),
            ...related.filter((q) => q.kind === "mcq").slice(0, 5),
          ]
        : related.slice(0, 10),
    partial,
  };
}
