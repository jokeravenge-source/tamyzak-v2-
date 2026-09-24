import { supabase } from "@/integrations/supabase/client";
import { matchPresetTopic, TOPIC_PRESETS } from "@/lib/flashcardTopicPresets";
import { missionsData } from "@/data/missions";

export type PracticeSource = "mcq_bank" | "flashcards" | "ministerial_bank";
export type PracticeAttempt = {
  subject: string;
  chapter: string;
  category_key: string;
  source: PracticeSource;
  question_key: string;
  correct: boolean;
  created_at: string;
};

export function topicForQuestion(subject: string, chapter: number | string, question: string, context = "") {
  const chapterKey = `${subject}:${chapter}`;
  const topic = matchPresetTopic(subject, chapter, question, context);
  if (!topic && !TOPIC_PRESETS[chapterKey]) {
    const missionChapter = missionsData[subject]?.chapters.find((item) =>
      Number(item.key.match(/\d+$/)?.[0]) === Number(chapter));
    const normalize = (text: string) => text.toLocaleLowerCase()
      .normalize("NFKC").replace(/[\u064B-\u065F\u0670ـ]/g, "")
      .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
    const questionText = normalize(`${question} ${context}`);
    const match = missionChapter?.topics.find((item) => {
      const generic = new Set(["chapter", "unit", "story", "lesson", "meanings", "verses", "introduction", "الفصل", "الوحده", "القصه", "الدرس", "المعاني", "مقدمه"]);
      const terms = [item.en, item.ar].flatMap((label) =>
        normalize(label).replace(/\d+/g, " ").match(/[\p{L}]{4,}/gu) ?? []).filter((term) => !generic.has(term));
      return terms.some((term) => questionText.includes(term));
    });
    if (match) return { key: `${chapterKey}:mission-${match.key}`, labelAr: match.ar, labelEn: match.en };
  }
  return {
    key: `${chapterKey}:${topic?.key ?? "general"}`,
    labelAr: topic?.ar ?? "أسئلة عامة للفصل",
    labelEn: topic?.en ?? "Other chapter questions",
  };
}

export function categoryLabel(key: string, language: "ar" | "en") {
  const [subject, chapter, ...topicParts] = key.split(":");
  const part = topicParts.join(":");
  const topic = TOPIC_PRESETS[`${subject}:${chapter}`]?.find((item) => item.key === part);
  const mission = missionsData[subject]?.chapters.find((item) => Number(item.key.match(/\d+$/)?.[0]) === Number(chapter))
    ?.topics.find((item) => `mission-${item.key}` === part);
  return topic?.[language] ?? mission?.[language] ?? (language === "ar" ? "أسئلة عامة للفصل" : "Other chapter questions");
}

// The question hash avoids storing question or answer text in practice events.
export function questionKey(question: string) {
  const normalized = question.normalize("NFKC").trim().toLocaleLowerCase().replace(/\s+/g, " ");
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export async function recordTopicPractice(input: {
  subject: string;
  chapter: number | string;
  question: string;
  context?: string;
  source: PracticeSource;
  correct: boolean;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const category = topicForQuestion(input.subject, input.chapter, input.question, input.context);
    await supabase.from("topic_practice_attempts" as never).insert({
      user_id: user.id,
      subject: input.subject,
      chapter: String(input.chapter),
      category_key: category.key,
      source: input.source,
      question_key: questionKey(input.question),
      correct: input.correct,
    } as never);
  } catch { /* Practice tracking must never interrupt studying. */ }
}

export async function loadTopicPractice(): Promise<PracticeAttempt[]> {
  const { data, error } = await supabase.from("topic_practice_attempts" as never)
    .select("subject,chapter,category_key,source,question_key,correct,created_at")
    .order("created_at", { ascending: false }).limit(1000);
  if (error) return [];
  return (data ?? []) as PracticeAttempt[];
}

export function topicSummary(attempts: PracticeAttempt[]) {
  const seen = new Set<string>();
  const latest = attempts
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .filter((row) => {
      const key = `${row.source}:${row.question_key}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);
  const objective = latest.filter((row) => row.source === "mcq_bank");
  const evidence = objective.length >= 3 ? objective : latest;
  const rate = evidence.length ? evidence.filter((row) => row.correct).length / evidence.length : 0;
  const state = evidence.length < 3 ? "starting" : rate >= 0.8 ? "strong" : rate >= 0.5 ? "improving" : "practice";
  return { state, count: latest.length, objectiveCount: objective.length } as const;
}

export function topChaptersByPractice(attempts: PracticeAttempt[]) {
  const chapters = new Map<string, { subject: string; chapter: string; attempts: PracticeAttempt[] }>();
  for (const attempt of attempts) {
    const key = `${attempt.subject}:${attempt.chapter}`;
    const entry = chapters.get(key) ?? { subject: attempt.subject, chapter: attempt.chapter, attempts: [] };
    entry.attempts.push(attempt);
    chapters.set(key, entry);
  }
  return [...chapters.values()]
    .sort((a, b) => b.attempts.length - a.attempts.length ||
      b.attempts.reduce((latest, row) => row.created_at > latest ? row.created_at : latest, "")
        .localeCompare(a.attempts.reduce((latest, row) => row.created_at > latest ? row.created_at : latest, "")))
    .slice(0, 3)
    .map(({ subject, chapter, attempts: chapterAttempts }) => {
      const seen = new Set<string>();
      const unique = [...chapterAttempts]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .filter((attempt) => {
          const key = `${attempt.source}:${attempt.question_key}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 20);
      const graded = unique.filter((attempt) => attempt.source === "mcq_bank");
      const evidence = graded.length >= 3 ? graded : unique;
      return {
        subject, chapter, attempts: chapterAttempts.length, questions: evidence.length,
        percent: evidence.length ? Math.round(100 * evidence.filter((attempt) => attempt.correct).length / evidence.length) : 0,
        selfAssessed: graded.length < 3 && unique.some((attempt) => attempt.source !== "mcq_bank"),
      };
    });
}
