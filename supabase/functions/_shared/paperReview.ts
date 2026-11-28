import { boardRecord, boardText } from "./whiteboard.ts";
import { paperChapter, paperCurriculumTrack, paperSubject, type PaperCurriculumTrack, type PaperSubjectId } from "./paperReviewCurriculum.ts";

export const PAPER_REVIEW_PATH = "/paper-review";
export const PAPER_REVIEW_IMAGE_BYTES = 1_800_000;
export const PAPER_REVIEW_BODY_BYTES = 2_405_000;

export type PaperLocation = [top: number, left: number, bottom: number, right: number];
export type PaperFinding = {
  excerpt: string;
  explanation: string;
  kind: "teacher-mark" | "suggestion";
  location: PaperLocation | null;
};
export type PaperPractice = {
  question: string;
  choices: [string, string, string];
  correctIndex: number;
  explanation: string;
};
export type PaperReport = {
  status: "reviewed" | "unclear";
  summary: string;
  skill: string | null;
  findings: PaperFinding[];
  practice: PaperPractice | null;
};
export type PaperReviewView = Omit<PaperReport, "practice"> & {
  practice: Pick<PaperPractice, "question" | "choices"> | null;
};
export type PaperReviewAccess = {
  premium: boolean;
  remaining: 0 | 1 | null;
  pending: boolean;
  resetAt: string;
  completedPractices: number;
};

type Language = "ar" | "en";
export type PaperExerciseSummary = {
  id: string;
  subject: PaperSubjectId;
  chapter: string;
  curriculum: PaperCurriculumTrack;
  title: string;
  question: string;
};
export type PaperExercise = PaperExerciseSummary & {
  solution: string;
  rubric: string | null;
  practice: PaperPractice | null;
};

export const paperExerciseId = (value: unknown): value is string =>
  typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);

const exerciseText = (value: unknown) =>
  typeof value === "string" ? value.normalize("NFC").trim() || null : null;

export function readPaperExerciseSummary(value: unknown): PaperExerciseSummary | null {
  const row = boardRecord(value);
  const subject = paperSubject(row?.subject);
  const chapter = paperChapter(subject, row?.chapter);
  const title = boardText(row?.title, 100);
  const question = exerciseText(row?.question);
  if (!row || !paperExerciseId(row.id) || !subject || !chapter || !paperCurriculumTrack(row.curriculum) || !title || !question) return null;
  return { id: row.id, subject: subject.id, chapter: chapter.key, curriculum: row.curriculum, title, question };
}

export function paperReviewImage(value: unknown) {
  const prefix = "data:image/jpeg;base64,";
  if (typeof value !== "string" || !value.startsWith(prefix)) return null;
  const encoded = value.slice(prefix.length);
  if (encoded.length > Math.ceil(PAPER_REVIEW_IMAGE_BYTES / 3) * 4
      || encoded.length < 16 || encoded.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return null;
  const header = atob(encoded.slice(0, 16));
  const size = encoded.length / 4 * 3 - (encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0);
  return size <= PAPER_REVIEW_IMAGE_BYTES && header.startsWith("\xff\xd8\xff") ? value : null;
}

function readLocation(value: unknown): PaperLocation | null {
  if (!Array.isArray(value) || value.length !== 4 || !value.every(n => Number.isInteger(n) && n >= 0 && n <= 1000)) return null;
  const [top, left, bottom, right] = value;
  return bottom > top && right > left ? [top, left, bottom, right] : null;
}

function readPractice(value: unknown): PaperPractice | null {
  const row = boardRecord(value);
  const question = boardText(row?.question, 380);
  const explanation = boardText(row?.explanation, 440);
  const choices = Array.isArray(row?.choices) ? row.choices.map(choice => boardText(choice, 120)) : [];
  const index = row?.correctIndex;
  if (!question || !explanation || choices.length !== 3 || choices.some(choice => !choice) || new Set(choices).size !== 3
    || typeof index !== "number" || !Number.isInteger(index) || index < 0 || index > 2) return null;
  return { question, choices: choices as PaperPractice["choices"], correctIndex: index, explanation };
}

export function readPaperExercise(value: unknown, language: Language): PaperExercise | null {
  const row = boardRecord(value);
  const content = boardRecord(row?.content);
  const localized = boardRecord(content?.[language] ?? content?.ar ?? content?.en);
  const summary = readPaperExerciseSummary({ ...row, title: localized?.title, question: localized?.question });
  const solution = exerciseText(localized?.solution);
  if (!summary || !solution) return null;
  return { ...summary, solution, rubric: exerciseText(localized?.rubric), practice: readPractice(localized?.practice) };
}

export function parsePaperReport(value: unknown, exercise?: PaperExercise | null): PaperReport | null {
  const row = boardRecord(value);
  const summary = boardText(row?.summary, 360);
  if (!row || !summary || (row.status !== "reviewed" && row.status !== "unclear")) return null;
  if (row.status === "unclear") {
    return { status: row.status, summary, skill: null, findings: [], practice: null };
  }

  if (!Array.isArray(row.findings) || row.findings.length > 4) return null;
  const findings: PaperFinding[] = [];
  for (const value of row.findings) {
    const finding = boardRecord(value);
    const excerpt = boardText(finding?.excerpt, 110);
    const explanation = boardText(finding?.explanation, 450);
    if (!finding || !excerpt || !explanation || (finding.kind !== "teacher-mark" && finding.kind !== "suggestion")) return null;
    findings.push({ excerpt, explanation, kind: finding.kind, location: readLocation(finding.location) });
  }
  const matched = row.matchedExercise === true ? exercise : undefined;
  return {
    status: row.status, summary, findings,
    skill: matched?.title ?? boardText(row.skill, 100),
    practice: matched?.practice ?? readPractice(row.practice),
  };
}

export const paperReviewView = ({ practice, ...report }: PaperReport): PaperReviewView => ({
  ...report,
  practice: practice ? { question: practice.question, choices: practice.choices } : null,
});
