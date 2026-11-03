/** Compact, non-security fingerprints keep study text out of chapter-picker bundles. */
export function fingerprint(text: string): string {
  let first = 2166136261, second = 5381;
  for (let index = 0; index < text.length; index++) {
    const code = text.charCodeAt(index);
    first = Math.imul(first ^ code, 16777619);
    second = Math.imul(second, 33) ^ code;
  }
  return `${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0).toString(16).padStart(8, "0")}`;
}

export const textFingerprint = (text: string) => fingerprint(text.normalize("NFC").trim().replace(/\s+/gu, " "));
export const reviewFingerprint = (question: string) => fingerprint(question.replace(/\s+/g, " ").trim().slice(0, 180));
export type FlashcardSummary = readonly [question: string, answer: string, review: string, sourceId?: string];
export const summarizeCard = (question: string, answer: string): FlashcardSummary => [textFingerprint(question), textFingerprint(answer), reviewFingerprint(question)];
