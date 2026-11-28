import { getMcqChapterGroups, type ChapteredMcq } from "@/lib/mcqChapters";
import { getFahrastTopicGroups, GENERAL_QUESTIONS, type FahrastMcq } from "@/lib/mcqFahrastTopics";

const SUBJECTS = ["physics", "chemistry", "biology", "english", "english_literature", "french", "islamic", "math"] as const;
export type StudyStartSubject = typeof SUBJECTS[number];
export const STUDY_START_KEY = "tamayzak:study-start:v1";
export const STARTER_LIMIT = 5;
export const STUDY_FOCUS_LIMIT = 5;
export type StudyStartIntent = { subject: StudyStartSubject; topicKeys: string[] };
type Question = ChapteredMcq & FahrastMcq;
type Lang = "ar" | "en";

export function isStudyStartSubject(value: unknown): value is StudyStartSubject {
  return typeof value === "string" && (SUBJECTS as readonly string[]).includes(value);
}

export function describeStudyStartTopics(subject: string, language: Lang = "ar") {
  if (!isStudyStartSubject(subject)) return [];
  const chapters = getMcqChapterGroups(subject, [], language);
  if (subject === "english_literature" && !chapters.length) {
    chapters.push({ key: "section:1", chapter: null, title: "", count: 0, questionIds: [] });
  }
  const topics = chapters.flatMap(chapter => getFahrastTopicGroups(subject, chapter, [], language)
    .filter(topic => topic.key !== GENERAL_QUESTIONS)
    .map(topic => ({ key: topic.key, title: topic.title, group: chapter.title || topic.section || "" })));
  return [...new Map(topics.map(topic => [topic.key, topic])).values()];
}

export function normalizeStudyFocus(subject: string, values: readonly unknown[]): string[] {
  const allowed = new Set(describeStudyStartTopics(subject).map(topic => topic.key));
  return [...new Set(values.filter((value): value is string => typeof value === "string" && allowed.has(value)))]
    .slice(0, STUDY_FOCUS_LIMIT);
}

export function parseStudyStart(raw: string | null): StudyStartIntent | null {
  try {
    const data = raw ? JSON.parse(raw) : null;
    if (!isStudyStartSubject(data?.subject) || !Array.isArray(data.topicKeys)) return null;
    const topicKeys = normalizeStudyFocus(data.subject, data.topicKeys);
    if (data.topicKeys.length && !topicKeys.length) return null;
    return { subject: data.subject, topicKeys };
  } catch { return null; }
}

/** A chosen topic is a hard filter; a general quiz is an explicit choice. */
export function chooseStarterQuestions<T extends Question>(rows: readonly T[], intent: StudyStartIntent, language: Lang): T[] {
  const valid = rows.filter(row => row.subject === intent.subject && Array.isArray(row.choices)
    && row.choices.length > 1 && Number.isInteger(row.answer_index)
    && row.answer_index! >= 0 && row.answer_index! < row.choices.length);
  const matchIds = new Set<string>();
  if (intent.topicKeys.length) {
    const requested = new Set(intent.topicKeys);
    const byId = new Map(valid.map(row => [row.id, row]));
    for (const chapter of getMcqChapterGroups(intent.subject, valid, language)) {
      const chapterRows = chapter.questionIds.flatMap(id => { const row = byId.get(id); return row ? [row] : []; });
      if (!chapterRows.length) continue;
      for (const group of getFahrastTopicGroups(intent.subject, chapter, chapterRows, language)) {
        if (requested.has(group.key)) group.questionIds.forEach(id => matchIds.add(id));
      }
    }
  }
  const seen = new Set<string>();
  return valid.filter(row => {
    const identity = row.question.trim().normalize("NFKC").replace(/\s+/gu, " ").toLowerCase();
    if (!identity || seen.has(identity) || (intent.topicKeys.length && !matchIds.has(row.id))) return false;
    seen.add(identity);
    return true;
  }).slice(0, STARTER_LIMIT);
}
