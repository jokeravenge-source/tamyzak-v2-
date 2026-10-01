// Sessions sends a heartbeat every 10 seconds while its timer is open.
// A fresh heartbeat may be advanced locally for a smooth ticking clock. When a
// mobile/background tab delays heartbeats (or device clocks differ), keep the
// last server-backed elapsed value visible instead of replacing it with --:--.
// This also prevents an abandoned row from counting forever.
export const PRESENCE_FRESH_MS = 60_000;
export const MAX_SESSION_SECONDS = 48 * 60 * 60;

type SessionPresence = {
  elapsed_seconds: number;
  is_running: boolean;
  last_seen_at: string;
};

export function elapsedFromFreshPresence(presence: SessionPresence, nowMs: number): number | null {
  const heartbeatMs = Date.parse(presence.last_seen_at);
  const elapsed = presence.elapsed_seconds;
  if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed > MAX_SESSION_SECONDS) return null;

  const snapshotSeconds = Math.floor(elapsed);
  const lagMs = nowMs - heartbeatMs;
  const heartbeatIsFresh = Number.isFinite(heartbeatMs) &&
    lagMs >= -PRESENCE_FRESH_MS && lagMs <= PRESENCE_FRESH_MS;

  // A missing/stale timestamp must not hide a valid student's timer. Freeze at
  // the most recent elapsed_seconds snapshot until the next database refresh.
  if (!presence.is_running || !heartbeatIsFresh) return snapshotSeconds;

  return Math.min(MAX_SESSION_SECONDS, snapshotSeconds + Math.max(0, Math.floor(lagMs / 1000)));
}
