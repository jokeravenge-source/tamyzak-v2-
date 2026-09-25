/**
 * Rejects document metadata and extraction artifacts that are not curriculum
 * knowledge and should never appear as student exam questions.
 */
const NON_EXAM_QUESTION_PATTERNS = [
  /\b(?:on\s+)?(?:what|which)\s+page\b/i,
  /\bpage\s+(?:number|no\.?|#|\d+)\b/i,
  /\b(?:name\s+of\s+the|who\s+is\s+the)\s+(?:teacher|instructor|author|writer|compiler)\b/i,
  /\b(?:teacher|instructor|author|writer|compiler)(?:'s)?\s+name\b/i,
  /\b(?:source|file|document)\s+(?:name|title)\b/i,
  /(?:في|على)\s+(?:أي|اى)\s+صفحة/u,
  /رقم\s+الصفحة/u,
  /(?:ما|ماذا)\s+(?:هو|هي)?\s*اسم\s+(?:المدرس|الأستاذ|الاستاذ|المؤلف|الكاتب)/u,
  /من\s+هو\s+(?:المدرس|الأستاذ|الاستاذ|المؤلف|الكاتب)/u,
  /(?:اسم|عنوان)\s+(?:الملف|المصدر|الوثيقة)/u,
  /layout attribution|parsed-documents|\bocr\b|توزيع التخطيط|معرفات مناطق التخطيط/i,
];

export function isExamRelevantQuestion(question: unknown): question is string {
  if (typeof question !== "string") return false;
  const normalized = question.replace(/\s+/g, " ").trim();
  if (normalized.length < 4) return false;
  return !NON_EXAM_QUESTION_PATTERNS.some((pattern) => pattern.test(normalized));
}
