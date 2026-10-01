import { describe, expect, it } from "vitest";
import { elapsedFromFreshPresence, MAX_SESSION_SECONDS, PRESENCE_FRESH_MS } from "./sessionPresenceClock";

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

  it("leaves a fresh paused timer unchanged", () => {
    expect(elapsedFromFreshPresence(presence(300, false), now)).toBe(300);
  });

  it("keeps showing the last verified time after the student's heartbeat is delayed", () => {
    expect(elapsedFromFreshPresence(presence(300, true, now - 60 * 60 * 1000), now)).toBe(300);
    expect(elapsedFromFreshPresence(presence(300, false, now - PRESENCE_FRESH_MS - 1), now)).toBe(300);
  });

  it("uses the saved timer when student and viewer device clocks differ", () => {
    expect(elapsedFromFreshPresence(presence(300, true, now + 5 * 60 * 1000), now)).toBe(300);
  });

  it("rejects corrupt elapsed times but keeps a valid snapshot with a malformed heartbeat", () => {
    expect(elapsedFromFreshPresence(presence(177 * 3600, true), now)).toBeNull();
    expect(elapsedFromFreshPresence(presence(MAX_SESSION_SECONDS + 1, false), now)).toBeNull();
    expect(elapsedFromFreshPresence({ ...presence(300, true), last_seen_at: "invalid" }, now)).toBe(300);
  });
});
