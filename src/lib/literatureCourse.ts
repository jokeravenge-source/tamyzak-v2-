export type LiteratureQuestion = { question: string; choices: string[]; answer_index: number; explanation: string };
export function validateLiteratureQuestions(value: unknown): LiteratureQuestion[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) throw new Error("invalid_questions");
  const seen = new Set<string>();
  return value.map(raw => {
    if (!raw || typeof raw !== "object") throw new Error("invalid_questions");
    const q = raw as LiteratureQuestion;
    if (typeof q.question !== "string" || !q.question.trim() || q.question.length > 4000 || !Array.isArray(q.choices) || q.choices.length !== 4 || q.choices.some(c => typeof c !== "string" || !c.trim() || c.length > 1000) || new Set(q.choices.map(c => c.trim().toLowerCase())).size !== 4 || !Number.isInteger(q.answer_index) || q.answer_index < 0 || q.answer_index > 3 || typeof q.explanation !== "string" || !q.explanation.trim() || q.explanation.length > 6000) throw new Error("invalid_questions");
    const key = q.question.trim().replace(/\s+/g, " ").toLowerCase();
    if (seen.has(key)) throw new Error("duplicate_questions"); seen.add(key);
    return { question: q.question.trim(), choices: q.choices.map(c => c.trim()), answer_index: q.answer_index, explanation: q.explanation.trim() };
  });
}
export function literatureCount(value: string | number): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error("invalid_count");
  return n;
}
export function literatureExamExtension(file: Pick<File, "name" | "size">): string {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (file.size === 0 || file.size > 100 * 1024 * 1024 || !ext || !["pdf", "png", "jpg", "jpeg"].includes(ext)) throw new Error("invalid_exam_file");
  return ext;
}
