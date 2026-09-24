// Sessions sends a heartbeat every 10 seconds while its timer is open.
// An abandoned running row must never keep counting in another student's room.
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
  const lagMs = nowMs - heartbeatMs;
  if (!Number.isFinite(heartbeatMs) || !Number.isFinite(elapsed) || elapsed < 0 || elapsed > MAX_SESSION_SECONDS ||
      lagMs > PRESENCE_FRESH_MS || lagMs < -PRESENCE_FRESH_MS) return null;

  return Math.min(MAX_SESSION_SECONDS, Math.floor(elapsed) +
    (presence.is_running ? Math.max(0, Math.floor(lagMs / 1000)) : 0));
}
