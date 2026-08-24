/**
 * Hand-off between a profile challenge and the Live Battle screen.
 * The challenger becomes the host; the accepting student joins the same code.
 */
export type ChallengeSubject = "physics" | "chemistry" | "biology";

export type PendingBattle = {
  code: string;
  host: boolean;
  subject?: ChallengeSubject;
  chapter?: number;
  /** Curriculum language of the questions. */
  lang?: "ar" | "en";
  count?: number;
};

const KEY = "tmz_pending_battle_v1";

export const CHALLENGE_SUBJECTS: { key: ChallengeSubject; ar: string; en: string }[] = [
  { key: "physics", ar: "الفيزياء", en: "Physics" },
  { key: "chemistry", ar: "الكيمياء", en: "Chemistry" },
  { key: "biology", ar: "الأحياء", en: "Biology" },
];

export const CHALLENGE_COUNTS = [5, 10, 15, 20];

export function newRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function setPendingBattle(p: PendingBattle) {
  try { sessionStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

/** Reads and clears the pending battle (single use). */
export function consumePendingBattle(): PendingBattle | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const p = JSON.parse(raw) as PendingBattle;
    return /^\d{6}$/.test(p?.code || "") ? p : null;
  } catch {
    return null;
  }
}
