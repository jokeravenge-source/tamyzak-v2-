import { describe, expect, it } from "vitest";
import {
  elapsedFromFreshPresence,
  MAX_SESSION_SECONDS,
  MAX_UNCONFIRMED_TICK_MS,
  PRESENCE_FRESH_MS,
} from "./sessionPresenceClock";

const now = Date.parse("2026-09-24T12:00:00Z");
const presence = (seconds: number, running: boolean, lastSeenMs = now - 10_000) => ({
  elapsed_seconds: seconds,
  is_running: running,
  last_seen_at: new Date(lastSeenMs).toISOString(),
});

describe("room participant clock", () => {
  it("tracks a fresh running student's own elapsed seconds", () => {
    expect(elapsedFromFreshPresence(presence(300, true), now)).toBe(310);
  });

  it("shows a fresh paused timer without advancing it", () => {
    expect(elapsedFromFreshPresence(presence(300, false), now)).toBe(300);
  });

  it("hides abandoned running and paused timers", () => {
    expect(elapsedFromFreshPresence(presence(8 * 3600, true, now - 60 * 60 * 1000), now)).toBeNull();
    expect(elapsedFromFreshPresence(presence(48 * 3600, false, now - PRESENCE_FRESH_MS - 1), now)).toBeNull();
  });

  it("keeps ticking from the local observation when student and viewer clocks differ", () => {
    expect(elapsedFromFreshPresence({
      ...presence(300, true, now + 5 * 60 * 1000),
      observed_at_ms: now - 10_000,
    }, now)).toBe(310);
  });

  it("hides an observation that has not been confirmed by a new heartbeat", () => {
    expect(elapsedFromFreshPresence({
      ...presence(300, true, now - 60 * 60 * 1000),
      observed_at_ms: now - MAX_UNCONFIRMED_TICK_MS - 1,
    }, now)).toBeNull();
  });

  it("rejects corrupt elapsed times and malformed stale heartbeats", () => {
    expect(elapsedFromFreshPresence(presence(177 * 3600, true), now)).toBeNull();
    expect(elapsedFromFreshPresence(presence(MAX_SESSION_SECONDS + 1, false), now)).toBeNull();
    expect(elapsedFromFreshPresence({ ...presence(300, true), last_seen_at: "invalid" }, now)).toBeNull();
  });

  it("uses a recent local observation when the student's device clock differs", () => {
    expect(elapsedFromFreshPresence({
      ...presence(300, false),
      last_seen_at: "invalid",
      observed_at_ms: now - 5_000,
    }, now)).toBe(300);
  });
});

import { displayedPresenceSeconds } from "./sessionPresenceClock";
describe("room timer display", () => {
  it("shows the live time for a student whose timer is running", () => {
    expect(displayedPresenceSeconds(presence(300, true), now)).toBe(310);
  });
  it("stays blank for a student who left 10 minutes ago", () => {
    expect(displayedPresenceSeconds(presence(300, true, now - 10 * 60_000), now)).toBeNull();
  });
});
