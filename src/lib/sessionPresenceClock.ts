// Sessions sends a heartbeat every 10 seconds while its timer is open.
// A room may contain old active_sessions rows left behind by closed tabs. Only
// show a timer while either the server heartbeat or a locally observed snapshot
// change is fresh. This prevents abandoned rows from appearing as 8h/48h timers.
export const PRESENCE_FRESH_MS = 60_000;
export const MAX_SESSION_SECONDS = 48 * 60 * 60;
export const MAX_UNCONFIRMED_TICK_MS = PRESENCE_FRESH_MS;

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
  const observedAtMs = presence.observed_at_ms;
  const observedLagMs = typeof observedAtMs === "number" ? nowMs - observedAtMs : Number.NaN;
  const observationIsFresh = Number.isFinite(observedLagMs) &&
    observedLagMs >= 0 && observedLagMs <= MAX_UNCONFIRMED_TICK_MS;
  const lagMs = nowMs - heartbeatMs;
  const heartbeatIsFresh = Number.isFinite(heartbeatMs) &&
    lagMs >= -PRESENCE_FRESH_MS && lagMs <= PRESENCE_FRESH_MS;
  if (!observationIsFresh && !heartbeatIsFresh) return null;

  if (!presence.is_running) return snapshotSeconds;

  // Prefer the local observation anchor once one exists. It is immune to clock
  // differences between the student and the viewer's devices.
  const tickLagMs = observationIsFresh ? observedLagMs : Math.max(0, lagMs);
  return Math.min(MAX_SESSION_SECONDS, snapshotSeconds + Math.floor(tickLagMs / 1000));
}
