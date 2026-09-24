import { resolveMcqChapter } from "@/lib/mcqChapters";
import { questionKey, topicForQuestion, type PracticeAttempt } from "@/lib/topicMastery";
import { dailyRotate, todayKey } from "@/lib/weeklyLearning";

export const TOPIC_PRACTICE_TARGET_KEY = "tamayzak:topic-practice-target";
export const RETURN_TO_PROGRESS_KEY = "tamayzak:topic-practice-return-progress";

export type TopicPracticeTarget = { subject: string; chapter: number; categoryKey: string };

type TopicQuestion = { id: string; subject: string; chapter: number; chapter_title: string | null; question: string; tags?: string[] };

/** Prefer missed questions, then unseen ones. Never substitute a different topic. */
export function buildTopicQuiz<T extends TopicQuestion>(rows: T[], attempts: PracticeAttempt[], target: TopicPracticeTarget, seed = todayKey()): T[] {
  const latest = new Map<string, PracticeAttempt>();
  [...attempts].sort((a, b) => b.created_at.localeCompare(a.created_at)).forEach((attempt) => {
    if (attempt.source === "mcq_bank" && attempt.subject === target.subject && attempt.chapter === String(target.chapter)
      && !latest.has(attempt.question_key)) latest.set(attempt.question_key, attempt);
  });
  const matching = rows.filter((row) => row.subject === target.subject
    && resolveMcqChapter(row)?.n === target.chapter
    && topicForQuestion(row.subject, target.chapter, row.question, (row.tags ?? []).join(" ")).key === target.categoryKey);
  const unique = matching.filter((row, index) => matching.findIndex((other) => questionKey(other.question) === questionKey(row.question)) === index);
  const missed: T[] = [], unseen: T[] = [], correct: T[] = [];
  unique.forEach((row) => {
    const prior = latest.get(questionKey(row.question));
    (prior ? prior.correct ? correct : missed : unseen).push(row);
  });
  const rotate = (group: T[], label: string) => dailyRotate(group, 10, `${seed}:${target.categoryKey}:${label}`);
  return [...rotate(missed, "missed"), ...rotate(unseen, "unseen"), ...rotate(correct, "correct")].slice(0, 10);
}

/** Previous automatically graded answers for the selected topic, one recent answer per question. */
export function topicBaseline(attempts: PracticeAttempt[], target: TopicPracticeTarget) {
  const seen = new Set<string>();
  const recent = [...attempts].filter((row) => row.subject === target.subject && row.chapter === String(target.chapter)
    && row.category_key === target.categoryKey && row.source === "mcq_bank")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .filter((row) => {
      if (seen.has(row.question_key)) return false;
      seen.add(row.question_key);
      return true;
    }).slice(0, 10);
  return { count: recent.length, percent: recent.length ? Math.round(recent.filter((row) => row.correct).length * 100 / recent.length) : null };
}
