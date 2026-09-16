export type McqCurriculum = { subject: string; chapter: number | null; chapters: { n: number; title: string; arTitle: string }[] };

export function validSelectedChapter(curriculum?: McqCurriculum): boolean {
  return !curriculum || (new Set(curriculum.chapters.map(c => c.n)).size === curriculum.chapters.length && (curriculum.chapter === null || curriculum.chapters.some(c => c.n === curriculum.chapter)));
}

export function curriculumInstructions(curriculum?: McqCurriculum): string {
  if (!curriculum) return "";
  return `\nCHAPTER ORGANIZATION\nThe student selected subject ${curriculum.subject}. Use ONLY this flashcard chapter taxonomy: ${JSON.stringify(curriculum.chapters)}.\n${curriculum.chapter === null ? "Cover relevant source material across these chapters." : `Generate only source-grounded questions that belong to chapter ${curriculum.chapter}; ignore unrelated source sections.`}\nReturn a chapter field on EACH question: the matching chapter number, or null if no confident match exists. Never guess a chapter. Chapter labels are organization metadata, not permission to introduce facts absent from the source.`;
}

export function applyCurriculumChapter<T extends { chapter?: number | null }>(question: T, curriculum?: McqCurriculum): T {
  if (!curriculum) return question;
  const chapter = typeof question.chapter === "number" && curriculum.chapters.some(c => c.n === question.chapter) && (curriculum.chapter === null || curriculum.chapter === question.chapter) ? question.chapter : null;
  return { ...question, chapter };
}
