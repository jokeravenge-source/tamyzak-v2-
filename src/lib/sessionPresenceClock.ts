// Sessions sends a heartbeat every 10 seconds while its timer is open.
// Advance a running timer from the moment this browser observed its latest
// database snapshot. This avoids comparing two students' device clocks, which
// can differ enough to make an otherwise valid timer look stale or frozen.
export const PRESENCE_FRESH_MS = 60_000;
export const MAX_SESSION_SECONDS = 48 * 60 * 60;
export const MAX_UNCONFIRMED_TICK_MS = 15 * 60 * 1000;

type SessionPresence = {
  elapsed_seconds: number;
  is_running: boolean;
  last_seen_at: string;
  observed_at_ms?: number;
};

export function elapsedFromFreshPresence(presence: SessionPresence, nowMs: number): number | null {
  const heartbeatMs = Date.parse(presence.last_seen_at);
  const elapsed = presence.elapsed_seconds;
  if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed > MAX_SESSION_SECONDS) return null;

  const snapshotSeconds = Math.floor(elapsed);
  if (!presence.is_running) return snapshotSeconds;

  const observedAtMs = presence.observed_at_ms;
  const observedLagMs = typeof observedAtMs === "number" ? nowMs - observedAtMs : Number.NaN;
  if (Number.isFinite(observedLagMs) && observedLagMs >= 0 && observedLagMs <= MAX_UNCONFIRMED_TICK_MS) {
    return Math.min(MAX_SESSION_SECONDS, snapshotSeconds + Math.floor(observedLagMs / 1000));
  }

  // Older callers without an observation anchor can still use a genuinely
  // fresh server heartbeat. Never extrapolate a stale row into invented hours.
  const lagMs = nowMs - heartbeatMs;
  const heartbeatIsFresh = Number.isFinite(heartbeatMs) &&
    lagMs >= -PRESENCE_FRESH_MS && lagMs <= PRESENCE_FRESH_MS;
  if (!heartbeatIsFresh) return snapshotSeconds;

  return Math.min(MAX_SESSION_SECONDS, snapshotSeconds + Math.max(0, Math.floor(lagMs / 1000)));
}
