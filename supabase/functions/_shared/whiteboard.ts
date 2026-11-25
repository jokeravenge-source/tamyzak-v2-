export type BoardTemplate = "notes" | "parallel-plates";
export type BoardNote = "idea" | "reason" | "result";
export type BoardFocus = BoardNote | "plates" | "distance" | "area" | "dielectric" | "equation";
export type BoardAction =
  | { kind: "label"; target: BoardNote; text: string; at: number }
  | { kind: "reveal"; target: "plates" | "area" | "dielectric"; at: number }
  | { kind: "arrow"; target: "idea-reason" | "reason-result" | "distance"; at: number }
  | { kind: "highlight"; target: BoardFocus; at: number }
  | { kind: "equation"; text: string; at: number }
  | { kind: "double-gap"; at: number };

export type BoardSource = {
  id: string;
  kind: "lesson" | "curriculum" | "pdf" | "text";
  title: string;
  excerpt: string;
  chapter?: string;
  pdfPage?: number;
  printedPage?: number;
  url?: string;
};

export type BoardReference = { sourceId: string; quote: string };
export type BoardStep = { title: string; narration: string; reference: BoardReference; actions: BoardAction[] };
export type BoardLesson = { title: string; template: BoardTemplate; steps: BoardStep[]; sources: BoardSource[] };
export type BoardAnswer = { reply: string; reference: BoardReference; highlight: BoardFocus | null };

export type BoardInput = {
  question: string;
  topic?: string;
  selectedLesson?: string;
  sourceIds?: string[];
  language: "ar" | "en";
  pilot?: "parallel-plates";
  attachment?: { name: string; pages?: { page: number; text: string }[]; text?: string; selectedPage?: boolean };
};

export type BoardError = "missing_source" | "invalid_lesson" | "board_unavailable" | "auth_required" | "board_rate_limit";

export const BOARD_STEP_MAX = 6;
export const BOARD_QUESTION_MAX = 600;
export const BOARD_NOTES: readonly BoardNote[] = ["idea", "reason", "result"];
const diagramParts = ["plates", "distance", "area", "dielectric"] as const;

export function boardRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

const normalize = (text: string) => text.normalize("NFC").replace(/\s+/gu, " ").trim();
export const boardText = (value: unknown, limit: number) => {
  if (typeof value !== "string" || value.length > limit * 2) return null;
  const text = normalize(value);
  return text && text.length <= limit ? text : null;
};

export function boardFocusTargets(template: BoardTemplate): readonly BoardFocus[] {
  return template === "parallel-plates" ? [...diagramParts, "equation"] : [...BOARD_NOTES, "equation"];
}

export function parseBoardReference(value: unknown, sources: readonly BoardSource[]): BoardReference | null {
  const reference = boardRecord(value);
  if (!reference) return null;
  const source = sources.find(({ id }) => id === reference.sourceId);
  const quote = boardText(reference.quote, 360);
  if (!source || !quote || quote.length < 8 || !normalize(source.excerpt).includes(quote)) return null;
  return { sourceId: source.id, quote };
}

function parseAction(value: unknown, template: BoardTemplate): BoardAction | null {
  const row = boardRecord(value);
  if (!row) return null;
  const { kind, at, target } = row;
  if (typeof at !== "number" || !Number.isFinite(at) || at < 0 || at > 1) return null;

  if (kind === "equation") {
    const text = boardText(row.text, 120);
    return text ? { kind, text, at } : null;
  }
  if (kind === "highlight" && boardFocusTargets(template).includes(target as BoardFocus)) {
    return { kind, target: target as BoardFocus, at };
  }
  if (template === "parallel-plates") {
    if (kind === "reveal" && (target === "plates" || target === "dielectric" || target === "area")) return { kind, target, at };
    if (kind === "arrow" && target === "distance") return { kind, target, at };
    if (kind === "double-gap" && at <= 0.75) return { kind, at };
  } else {
    if (kind === "label" && BOARD_NOTES.includes(target as BoardNote)) {
      const text = boardText(row.text, 110);
      if (text) return { kind, target: target as BoardNote, text, at };
    }
    if (kind === "arrow" && (target === "idea-reason" || target === "reason-result")) return { kind, target, at };
  }
  return null;
}

export function parseBoardStep(value: unknown, sources: readonly BoardSource[], template: BoardTemplate): BoardStep | null {
  const row = boardRecord(value);
  if (!row) return null;
  const title = boardText(row.title, 100);
  const narration = boardText(row.narration, 340);
  const reference = parseBoardReference(row.reference, sources);
  if (!title || !narration || !/\p{Script=Arabic}/u.test(narration) || !reference || !Array.isArray(row.actions) || !row.actions.length || row.actions.length > 6) return null;
  const actions: BoardAction[] = [];
  for (const value of row.actions) {
    const action = parseAction(value, template);
    if (!action || action.at < (actions[actions.length - 1]?.at ?? 0)) return null;
    actions.push(action);
  }
  return { title, narration, reference, actions };
}

export function parseBoardLesson(value: unknown, sources: readonly BoardSource[], template: BoardTemplate): BoardLesson | null {
  const row = boardRecord(value);
  const title = boardText(row?.title, 140);
  if (!title || !Array.isArray(row?.steps) || row.steps.length < 2 || row.steps.length > BOARD_STEP_MAX) return null;
  const steps: BoardStep[] = [];
  for (const raw of row.steps) {
    const step = parseBoardStep(raw, sources, template);
    if (!step) return null;
    steps.push(step);
  }
  const cited = new Set(steps.map(({ reference }) => reference.sourceId));
  return { title, steps, template, sources: sources.filter(({ id }) => cited.has(id)).map(source => ({ ...source })) };
}

export function parseBoardAnswer(value: unknown, source: BoardSource, visible: readonly BoardFocus[]): BoardAnswer | null {
  const row = boardRecord(value);
  if (!row) return null;
  const reply = boardText(row.reply, 520);
  const reference = parseBoardReference(row.reference, [source]);
  if (!reply || !/\p{Script=Arabic}/u.test(reply) || !reference) return null;
  const highlight = visible.find(target => target === row.highlight) ?? null;
  return { reply, reference, highlight };
}

export function parseBoardJSON(content: unknown): unknown {
  if (typeof content !== "string" || content.length > 24000) return null;
  try {
    return JSON.parse(content.trim().replace(/^\x60{3}(?:json)?\s+([\s\S]*?)\s*\x60{3}$/iu, "$1"));
  } catch {
    return null;
  }
}
