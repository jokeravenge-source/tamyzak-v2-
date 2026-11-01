// Shared by the reader and Edge Functions. Language repair changes question
// fragments only; it must never regenerate or summarize the surrounding notes.
export const hasArabicLetters = (text: string) => /[\u0621-\u064a\u066e-\u06d3\u0750-\u077f\u08a0-\u08c9]/u.test(text);

const questionLabel = /(?:السؤال|سؤال|المطلوب|أسئلة|اسئلة|عل[ّ]?ل|قارن|اذكر|أذكر|عد[ّ]?د|عر[ّ]?ف|اشرح|وض[ّ]?ح|فس[ّ]?ر|بي[ّ]?ن)/u;
const imperative = /^(?:عل[ّ]?ل|قارن|اذكر|أذكر|عد[ّ]?د|عر[ّ]?ف|اشرح|وض[ّ]?ح|فس[ّ]?ر|بي[ّ]?ن)(?:\s|[:：])/u;

export function hasArabicLectureQuestions(notes: string): boolean {
  let reviewLevel = 0;
  for (const raw of notes.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^(#{1,6})\s+(.*)/);
    if (heading) {
      if (reviewLevel && heading[1].length <= reviewLevel) reviewLevel = 0;
      if (/Review Questions|أسئلة|اسئلة/i.test(heading[2])) reviewLevel = heading[1].length;
    }
    if (!hasArabicLetters(line)) continue;
    // Inspect each table cell independently: an English question may have an
    // Arabic answer in the next cell.
    for (const cell of line.split("|")) {
      const question = cell.split(/[?؟]/)[0];
      if (/[?؟]/.test(cell) && hasArabicLetters(question)) return true;
    }
    if (heading && questionLabel.test(heading[2])) return true;
    if (/\*\*[^*]*(?:السؤال|سؤال|المطلوب|أسئلة|اسئلة)[^*]*\*\*/u.test(line)) return true;
    const plain = line.replace(/^(?:>\s*)?(?:(?:[-*•]|[\d٠-٩]+[.)])\s+)?/, "").replace(/^\*\*/, "");
    if (imperative.test(plain)) return true;
    if (/^(?:ما(?:ذا)?|لماذا|كيف|متى|أين|هل|كم|أي|من (?:هو|الذي|المسؤول))(?:\s|[:：])/u.test(plain)) return true;
    if (reviewLevel && /^[\d٠-٩]+[.)]\s/.test(line)) {
      // Answers stay Arabic, including numbered answers within a review.
      if (/[?؟]/.test(line) && !hasArabicLetters(line.split(/[?؟]/)[0])) continue;
      if (!/^(?:[\d٠-٩]+[.)]\s*)(?:\*\*)?(?:الإجابة|الجواب|الحل|الشرح)/u.test(line)) return true;
    }
  }
  return false;
}

export type QuestionTranslation = { source: string; english: string };

export function applyQuestionTranslations(notes: string, edits: QuestionTranslation[]): string {
  const ranges: Array<{ start: number; end: number; english: string }> = [];
  const seen = new Set<string>();
  for (const edit of edits) {
    if (!edit || typeof edit.source !== "string" || typeof edit.english !== "string"
      || !edit.source.trim() || !edit.english.trim() || !hasArabicLetters(edit.source)
      || hasArabicLetters(edit.english) || !/[A-Za-z]/.test(edit.english)
      || /[\r\n]/.test(edit.source + edit.english) || edit.source.length > 2000
      || seen.has(edit.source)) throw new Error("Invalid question translation");
    seen.add(edit.source);
    // A question followed by an Arabic answer on the same line must be split.
    // The model may translate the question, never that answer or its label.
    const afterQuestion = edit.source.match(/[?؟]([\s\S]*)$/)?.[1] ?? "";
    if (hasArabicLetters(afterQuestion)
      || /(?:الإجابة|الجواب|الحل|الشرح)\s*[:：]/u.test(edit.source)) {
      throw new Error("Question translation includes an explanation");
    }
    let at = notes.indexOf(edit.source);
    if (at < 0) throw new Error("Question translation does not match the source");
    while (at >= 0) {
      ranges.push({ start: at, end: at + edit.source.length, english: edit.english });
      at = notes.indexOf(edit.source, at + edit.source.length);
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  for (let index = 1; index < ranges.length; index++) {
    if (ranges[index].start < ranges[index - 1].end) throw new Error("Overlapping question translations");
  }
  let result = notes;
  for (const range of ranges.reverse()) {
    result = result.slice(0, range.start) + range.english + result.slice(range.end);
  }
  return result;
}

export function splitLectureNoteForTranslation(notes: string, limit = 18000): string[] {
  const chunks: string[] = [];
  let chunk = "";
  // Keep every character, including original line endings. No source truncation.
  for (const line of notes.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    if (line.length > limit) throw new Error("A lecture note line is too long to translate safely");
    if (chunk.length + line.length > limit) { chunks.push(chunk); chunk = ""; }
    chunk += line;
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

export async function translateLectureQuestions(
  notes: string,
  translate: (chunk: string, sectionContext: string) => Promise<string>,
): Promise<string> {
  if (!hasArabicLectureQuestions(notes)) return notes;
  let result = notes;
  for (let attempt = 0; attempt < 2; attempt++) {
    let translated = "";
    let headings: string[] = [];
    for (const chunk of splitLectureNoteForTranslation(result)) {
      translated += await translate(chunk, headings.join("\n"));
      for (const line of chunk.split(/\r?\n/)) {
        const heading = line.match(/^(#{1,6})\s+/);
        if (!heading) continue;
        headings = headings.filter((previous) => previous.match(/^#+/)![0].length < heading[1].length);
        headings.push(line);
      }
    }
    result = translated;
    if (!hasArabicLectureQuestions(result)) return result;
  }
  throw new Error("Some questions were not translated");
}
