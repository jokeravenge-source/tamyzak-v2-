import { missionsData } from "@/data/missions";
import { categoryLabel, chapterQuestionResults, type PracticeAttempt } from "@/lib/topicMastery";

export type WeakAreaSource = "performance" | "student" | "combined";

export type WeakArea = {
  subject: string;
  chapterNumber: number;
  chapterKey: string;
  categoryKey: string;
  topicKey: string;
  topicAr: string;
  topicEn: string;
  weaknessText: string;
  source: WeakAreaSource;
  evidenceCount?: number;
  mcqAccuracy?: number | null;
  flashcardAccuracy?: number | null;
};

export type WeaknessMessage = { role: "user" | "assistant"; content: string };

export type WeaknessSession = {
  id?: string;
  isoWeek: string;
  status: "active" | "finished";
  messages: WeaknessMessage[];
  weakAreas: WeakArea[];
  detectedAreas: WeakArea[];
  startedAt: string;
  updatedAt: string;
  finishedAt?: string | null;
};

const VALID_SUBJECTS = new Set(Object.keys(missionsData));
const MIN_WEAKNESS_EVIDENCE = 3;
const WEAKNESS_ACCURACY_THRESHOLD = 0.7;
export const WEAKNESS_AUTO_OPEN_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000;

const LOOKUP_STOP_WORDS = new Set([
  "chapter", "unit", "lesson", "topic", "the", "and", "of", "in",
  "الفصل", "الوحدة", "الدرس", "موضوع", "في", "من", "الى", "على",
]);

const normalizeLookupText = (value: string) => value
  .normalize("NFKC")
  .toLocaleLowerCase()
  .replace(/[\u064B-\u065F\u0670ـ]/g, "")
  .replace(/[أإآ]/g, "ا")
  .replace(/[^\p{L}\p{N}\s]/gu, " ")
  .replace(/\s+/g, " ")
  .trim();

function lookupTokens(value: string): string[] {
  return normalizeLookupText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !LOOKUP_STOP_WORDS.has(token) && !/^\d+$/.test(token));
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const previous = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = previous;
    }
  }
  return row[b.length];
}

function lookupScore(query: string, candidate: string): number {
  const queryText = normalizeLookupText(query);
  const candidateTokens = lookupTokens(candidate);
  const queryTokens = lookupTokens(query);
  if (!candidateTokens.length || !queryTokens.length) return 0;
  const candidateText = candidateTokens.join(" ");
  if (candidateText.length >= 4 && queryText.includes(candidateText)) return 20 + candidateTokens.length;

  return candidateTokens.reduce((score, candidateToken) => {
    if (queryTokens.includes(candidateToken)) return score + 5;
    const fuzzy = queryTokens.some((queryToken) => {
      const longest = Math.max(candidateToken.length, queryToken.length);
      return longest >= 5 && 1 - editDistance(candidateToken, queryToken) / longest >= 0.78;
    });
    return score + (fuzzy ? 3 : 0);
  }, 0);
}

function missionChapterNumber(subject: string, chapterKey: string, index: number): number {
  const keyNumber = Number(chapterKey.match(/(\d+)(?!.*\d)/)?.[1]);
  return Number.isFinite(keyNumber) && keyNumber > 0 ? keyNumber : index + 1;
}

function inferredArea(
  subject: string,
  chapterIndex: number,
  weaknessText: string,
  topicIndex?: number,
): WeakArea {
  const chapter = missionsData[subject].chapters[chapterIndex];
  const chapterNumber = missionChapterNumber(subject, chapter.key, chapterIndex);
  const topic = topicIndex == null ? null : chapter.topics[topicIndex];
  return {
    subject,
    chapterNumber,
    chapterKey: chapter.key,
    categoryKey: topic ? `${subject}:${chapterNumber}:${topic.key}` : `${subject}:${chapterNumber}:general`,
    topicKey: topic?.key ?? "general",
    topicAr: topic?.ar ?? chapter.ar,
    topicEn: topic?.en ?? chapter.en,
    weaknessText: weaknessText.trim().slice(0, 700),
    source: "student",
  };
}

/**
 * Locally recognizes an obvious curriculum subject/chapter/topic so the save
 * action never depends entirely on the AI returning perfectly formatted JSON.
 * Fuzzy token matching intentionally handles small student spelling mistakes
 * such as "capictors" while requiring a strong curriculum match.
 */
export function inferWeakAreaFromText(text: string): WeakArea | null {
  const query = normalizeLookupText(text);
  if (!query) return null;

  const chapterMatch = query.match(/(?:chapter|unit|الفصل|الوحدة)\s*(\d{1,2})/u);
  if (chapterMatch) {
    const requestedChapter = Number(chapterMatch[1]);
    const subjectMatch = Object.entries(missionsData)
      .map(([subject, details]) => ({ subject, score: Math.max(lookupScore(query, details.en), lookupScore(query, details.ar)) }))
      .sort((a, b) => b.score - a.score)[0];
    if (subjectMatch?.score >= 3) {
      const chapterIndex = missionsData[subjectMatch.subject].chapters.findIndex((chapter, index) =>
        missionChapterNumber(subjectMatch.subject, chapter.key, index) === requestedChapter);
      if (chapterIndex >= 0) return inferredArea(subjectMatch.subject, chapterIndex, text);
    }
  }

  const chapters = Object.entries(missionsData).flatMap(([subject, details]) =>
    details.chapters.map((chapter, chapterIndex) => ({
      subject,
      chapterIndex,
      score: Math.max(lookupScore(query, chapter.en), lookupScore(query, chapter.ar)),
    })));
  chapters.sort((a, b) => b.score - a.score);
  if (chapters[0]?.score >= 3) return inferredArea(chapters[0].subject, chapters[0].chapterIndex, text);

  const topics = Object.entries(missionsData).flatMap(([subject, details]) =>
    details.chapters.flatMap((chapter, chapterIndex) => chapter.topics.map((topic, topicIndex) => ({
      subject,
      chapterIndex,
      topicIndex,
      score: Math.max(lookupScore(query, topic.en), lookupScore(query, topic.ar)),
    }))));
  topics.sort((a, b) => b.score - a.score);
  return topics[0]?.score >= 3
    ? inferredArea(topics[0].subject, topics[0].chapterIndex, text, topics[0].topicIndex)
    : null;
}

/** Keeps the check-in conversational but prevents a model from turning this
 * narrow intake flow into a long tutoring response. */
export function conciseWeaknessReply(text: string, maxWords = 40): string {
  return (text.match(/[^.!?؟]+[.!?؟]?/gu) ?? [text])
    .slice(0, 2)
    .join(" ")
    .trim()
    .split(/\s+/u)
    .slice(0, maxWords)
    .join(" ");
}

function chapterKeyFor(subject: string, chapterNumber: number): string {
  const chapters = missionsData[subject]?.chapters ?? [];
  const byNumber = chapters.find((chapter, index) => {
    const keyNumber = Number(chapter.key.match(/(\d+)(?!.*\d)/)?.[1]);
    return (Number.isFinite(keyNumber) ? keyNumber : index + 1) === chapterNumber;
  });
  return byNumber?.key ?? `${subject}-chapter-${chapterNumber}`;
}
export function normalizeWeakArea(value: Partial<WeakArea>, fallbackSource: WeakAreaSource = "student"): WeakArea | null {
  const subject = String(value.subject ?? "").trim().toLowerCase();
  const chapterNumber = Math.trunc(Number(value.chapterNumber));
  if (!VALID_SUBJECTS.has(subject) || !Number.isFinite(chapterNumber) || chapterNumber < 1 || chapterNumber > 20) return null;

  const categoryKey = String(value.categoryKey ?? "").trim() || `${subject}:${chapterNumber}:general`;
  const topicKey = String(value.topicKey ?? "").trim() || categoryKey.split(":").slice(2).join(":") || "general";
  return {
    subject,
    chapterNumber,
    chapterKey: String(value.chapterKey ?? "").trim() || chapterKeyFor(subject, chapterNumber),
    categoryKey,
    topicKey,
    topicAr: String(value.topicAr ?? "").trim().slice(0, 180) || categoryLabel(categoryKey, "ar"),
    topicEn: String(value.topicEn ?? "").trim().slice(0, 180) || categoryLabel(categoryKey, "en"),
    weaknessText: String(value.weaknessText ?? "").trim().slice(0, 700),
    source: value.source === "performance" || value.source === "combined" || value.source === "student"
      ? value.source
      : fallbackSource,
    evidenceCount: Math.max(0, Math.trunc(Number(value.evidenceCount ?? 0))) || undefined,
    mcqAccuracy: value.mcqAccuracy == null ? null : Math.max(0, Math.min(100, Math.round(Number(value.mcqAccuracy)))),
    flashcardAccuracy: value.flashcardAccuracy == null ? null : Math.max(0, Math.min(100, Math.round(Number(value.flashcardAccuracy)))),
  };
}

function accuracy(rows: PracticeAttempt[], source: PracticeAttempt["source"]): number | null {
  const matching = rows.filter((row) => row.source === source);
  return matching.length ? Math.round(100 * matching.filter((row) => row.correct).length / matching.length) : null;
}

/** A student-facing label that never falls back to the vague "Other questions" text. */
export function weakAreaDisplayLabel(area: WeakArea, language: "ar" | "en"): string {
  const subject = missionsData[area.subject];
  const chapter = subject?.chapters.find((item, index) => {
    const keyNumber = Number(item.key.match(/(\d+)(?!.*\d)/)?.[1]);
    return (Number.isFinite(keyNumber) ? keyNumber : index + 1) === area.chapterNumber;
  });
  const subjectLabel = subject?.[language] ?? area.subject;
  const chapterLabel = chapter?.[language]
    ?? (language === "ar" ? `الفصل ${area.chapterNumber}` : `Chapter ${area.chapterNumber}`);
  const isGeneric = area.topicKey === "general" || area.categoryKey.endsWith(":general");
  const topicLabel = language === "ar" ? area.topicAr : area.topicEn;
  return isGeneric
    ? `${subjectLabel} — ${chapterLabel}`
    : `${subjectLabel} — ${topicLabel}`;
}

/** Unfinished interviews may prompt automatically only after three quiet days. */
export function weaknessAutoOpenDue(lastActivityAt: string | null | undefined, now = Date.now()): boolean {
  const lastActivity = Date.parse(lastActivityAt ?? "");
  return !Number.isFinite(lastActivity) || now - lastActivity >= WEAKNESS_AUTO_OPEN_INTERVAL_MS;
}

/**
 * Finds weak curriculum areas from the latest answer to each distinct question.
 * MCQs are objective evidence; flashcard "forgot"/"hard" ratings are self-rated
 * evidence. Both sources remain visible instead of being blended into a fake score.
 */
export function detectWeakAreas(attempts: PracticeAttempt[], limit = 6): WeakArea[] {
  const groups = new Map<string, PracticeAttempt[]>();
  const latest = chapterQuestionResults(attempts);
  for (const row of latest) {
    const rows = groups.get(row.category_key) ?? [];
    rows.push(row);
    groups.set(row.category_key, rows);
  }

  return [...groups.entries()]
    .map(([categoryKey, rows]) => {
      const wrong = rows.filter((row) => !row.correct).length;
      const correctRate = rows.length ? rows.filter((row) => row.correct).length / rows.length : 1;
      const latestAt = rows.reduce((value, row) => row.created_at > value ? row.created_at : value, "");
      const subject = rows[0]?.subject ?? "";
      const chapterNumber = Math.max(1, Number(rows[0]?.chapter) || 1);
      const area = normalizeWeakArea({
        subject,
        chapterNumber,
        categoryKey,
        topicAr: categoryLabel(categoryKey, "ar"),
        topicEn: categoryLabel(categoryKey, "en"),
        weaknessText: "Detected from recent MCQ and flashcard answers.",
        source: "performance",
        evidenceCount: rows.length,
        mcqAccuracy: accuracy(rows, "mcq_bank"),
        flashcardAccuracy: accuracy(rows, "flashcards"),
      }, "performance");
      return area ? { area, wrong, correctRate, latestAt } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> =>
      Boolean(entry?.area)
      && entry.wrong > 0
      && entry.area.evidenceCount! >= MIN_WEAKNESS_EVIDENCE
      && entry.correctRate < WEAKNESS_ACCURACY_THRESHOLD)
    .sort((a, b) =>
      a.correctRate - b.correctRate
      || b.area.evidenceCount! - a.area.evidenceCount!
      || b.latestAt.localeCompare(a.latestAt))
    .slice(0, limit)
    .map(({ area }) => area);
}

export function mergeWeakAreas(existing: WeakArea[], incoming: Array<Partial<WeakArea>>): WeakArea[] {
  const merged = new Map<string, WeakArea>();
  for (const item of existing) {
    const normalized = normalizeWeakArea(item, item.source);
    if (normalized) merged.set(`${normalized.subject}:${normalized.chapterNumber}:${normalized.topicKey}`, normalized);
  }
  for (const item of incoming) {
    const normalized = normalizeWeakArea(item, "student");
    if (!normalized) continue;
    const key = `${normalized.subject}:${normalized.chapterNumber}:${normalized.topicKey}`;
    const previous = merged.get(key);
    merged.set(key, previous ? {
      ...previous,
      ...normalized,
      source: previous.source === normalized.source ? previous.source : "combined",
      evidenceCount: previous.evidenceCount,
      mcqAccuracy: previous.mcqAccuracy,
      flashcardAccuracy: previous.flashcardAccuracy,
    } : normalized);
  }
  return [...merged.values()].slice(0, 8);
}
