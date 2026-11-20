import type { RaceQuestion } from "./raceQuestionBank";

export type LiveBattleQuestion = {
  id: string;
  q: string;
  choices: string[];
  answer: number;
  subject: string;
  explanation?: string | null;
};

/** Keep each bank question's real choices and answer together. Never manufacture distractors. */
export function selectBattleQuestions(bank: RaceQuestion[], subject: string, chapter: number, count: number, seed: number): LiveBattleQuestion[] {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const rows = bank.filter((q) => q.subject === subject && (!chapter || q.chapter === chapter)).slice();
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  return rows.slice(0, Math.max(1, Math.min(20, count))).map((row) => ({
    id: row.id, q: row.question, choices: [...row.choices], answer: row.answer_index,
    subject: row.subject, explanation: row.explanation,
  }));
}

export function isLiveBattleQuestion(value: unknown): value is LiveBattleQuestion {
  const q = value as LiveBattleQuestion;
  return !!q && typeof q.q === "string" && !!q.q.trim()
    && Array.isArray(q.choices) && q.choices.length >= 2
    && q.choices.every((choice) => typeof choice === "string" && !!choice.trim())
    && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length;
}
