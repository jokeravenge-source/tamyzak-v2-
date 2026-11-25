import { missionsData } from "@/data/missions";
import { presetTopicNumbers, questionAliases, sectionAliases } from "@/data/mcqFahrastLabels";
import { TOPIC_PRESETS } from "@/lib/flashcardTopicPresets";
import type { McqChapterGroup } from "@/lib/mcqChapters";

export type FahrastMcq = {
  id: string;
  question: string;
  section?: string | null;
  source?: string | null;
  tags?: string[];
  explanation?: string | null;
  choices?: unknown;
  answer_index?: number;
};
export type FahrastTopicGroup = {
  key: string;
  title: string;
  section: string | null;
  questionIds: string[];
};

export const GENERAL_QUESTIONS = "general";

const normalize = (text: string) => text.normalize("NFKD").toLowerCase()
  .replace(/[\p{M}ـ’']/gu, "").replace(/ى/g, "ي").replace(/ة/g, "ه")
  .replace(/[^\p{L}\p{N}]+/gu, " ").trim()
  .replace(/\b([a-z]{3,}[a-rt-z])s\b/g, "$1");

const withoutNumber = (label: string) => label.replace(/^\d+\s*-\s*\d+\s+/, "");
const generalTerms = new Set([
  "introduction", "preface", "question", "exercise", "system", "capacitor", "application",
  "مقدمه", "الاسيله", "الاساله", "المتسعه", "المتسعات", "المكثف", "تطبيقات", "نظام",
]);

const frenchTopics: Record<number, string> = {
  1: "fr-g-1", 2: "fr-g-3", 3: "fr-g-7", 4: "fr-g-5", 5: "fr-g-6", 6: "fr-g-4",
};

function catalogFor(subject: string, number: number | null) {
  if (subject === "english_literature") return missionsData.english.chapters.filter(item => item.key === "eng-lit");
  if (number === null) return [];
  if (subject === "english") return missionsData.english.chapters.filter(item =>
    item.key === `eng-g${number}` || item.key === `eng-r${number}`);
  if (subject === "french") return missionsData.french.chapters.filter(item =>
    frenchTopics[number] ? item.key === "fr-gram" : item.key === "fr-dial");
  if (subject === "islamic") return missionsData.islamic.chapters.filter(item => /^isl-\d+$/.test(item.key));
  return missionsData[subject]?.chapters.filter(item => item.key.endsWith(`-${number}`)) ?? [];
}

type Candidate = { group: FahrastTopicGroup; labels: string[]; cues: string[] };

function bestMatch(candidates: Candidate[], message: string): Candidate | null {
  if (!message) return null;
  const text = " " + normalize(message) + " ";
  let best: Candidate | null = null;
  let highest = 0;
  for (const candidate of candidates) {
    let score = 0;
    for (const phrase of candidate.cues) {
      if (text.includes(" " + phrase + " ")) {
        score = Math.max(score, phrase.split(" ").length * 5 + Math.min(phrase.length, 24));
      }
    }
    if (score > highest) {
      best = candidate;
      highest = score;
    } else if (score === highest) {
      best = null;
    }
  }
  return best;
}

export function getFahrastTopicGroups(
  subject: string,
  chapter: Pick<McqChapterGroup, "chapter" | "key">,
  rows: readonly FahrastMcq[],
  language: "ar" | "en",
): FahrastTopicGroup[] {
  const catalog = catalogFor(subject, chapter.chapter);
  if (!catalog.length) return [];
  const presetKey = `${subject}:${chapter.chapter}`;
  const exactFrenchTopic = subject === "french" ? frenchTopics[chapter.chapter ?? 0] : undefined;
  const candidates = catalog.flatMap(part => part.topics
    .filter((topic, index) => (!exactFrenchTopic || topic.key === exactFrenchTopic) && (subject !== "islamic" || index === 0))
    .map(topic => {
      const labels = [topic.ar, topic.en].map(label => normalize(withoutNumber(label)));
      const vocabulary = (TOPIC_PRESETS[presetKey] ?? []).filter(preset =>
        topic.key === `${part.key}-${presetTopicNumbers[presetKey]?.[preset.key]}`);
      const cues = [...new Set([
        ...labels, ...(questionAliases[topic.key] ?? []).map(normalize),
        ...vocabulary.flatMap(def => [...(def.kwAr ?? []), ...(def.kwEn ?? [])].map(normalize)),
      ])].filter(term => term.length >= 2 && !generalTerms.has(term));
      return {
        group: { key: topic.key, title: topic[language], section: catalog.length > 1 ? part[language] : null, questionIds: [] },
        labels: [...labels, normalize(topic.ar), normalize(topic.en)],
        cues,
      } satisfies Candidate;
    }));
  if (!candidates.length) return [];

  const byKey = new Map(candidates.map(candidate => [normalize(candidate.group.key), candidate]));
  const byHeading = new Map<string, Set<Candidate>>();
  const addHeading = (label: string, candidate: Candidate) => {
    const key = normalize(label);
    const matches = byHeading.get(key) ?? new Set<Candidate>();
    matches.add(candidate);
    byHeading.set(key, matches);
  };
  for (const candidate of candidates) {
    for (const label of candidate.labels) addHeading(label, candidate);
  }
  for (const part of catalog) {
    for (const [ordinals, labels] of sectionAliases[part.key] ?? []) {
      for (const number of Array.isArray(ordinals) ? ordinals : [ordinals]) {
        const candidate = byKey.get(normalize(`${part.key}-${number}`));
        if (candidate) for (const label of labels) addHeading(label, candidate);
      }
    }
  }
  const general: FahrastTopicGroup = {
    key: GENERAL_QUESTIONS,
    title: language === "ar" ? "أسئلة عامة من الفصل" : "General chapter questions",
    section: null,
    questionIds: [],
  };

  for (const row of rows) {
    const metadata = [row.section, ...(row.tags ?? []), row.source]
      .filter((value): value is string => !!value).map(normalize);
    const explicit = new Set(metadata.flatMap(value => byKey.get(value) ?? []));
    const headings = new Set(metadata.flatMap(value => [...(byHeading.get(value) ?? [])]));
    const eligible = explicit.size ? [...explicit] : headings.size ? [...headings] : candidates;
    const correct = Array.isArray(row.choices) && row.answer_index !== undefined ? row.choices[row.answer_index] : null;
    const chosen = (explicit.size || headings.size || exactFrenchTopic) && eligible.length === 1
      ? eligible[0]
      : bestMatch(eligible, row.question) ?? bestMatch(eligible, typeof correct === "string" ? correct : "")
        ?? bestMatch(eligible, row.explanation ?? "");
    (chosen?.group ?? general).questionIds.push(row.id);
  }
  return [...candidates.map(candidate => candidate.group), ...(general.questionIds.length ? [general] : [])];
}
