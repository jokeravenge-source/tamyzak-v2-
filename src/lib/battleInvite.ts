/**
 * Hand-off between a profile challenge and the Live Battle screen.
 * The challenger becomes the host; the accepting student joins the same code.
 */
export type PendingBattle = { code: string; host: boolean };

const KEY = "tmz_pending_battle_v1";

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
