import { describe, expect, it } from "vitest";
import { acceptedStandings, challengePhase, formatStudySeconds, liveChallengeStandings, remainingLabel, type StudyChallenge } from "./studyChallenges";
import type { StudyTimerDisplay } from "./studyTimerDisplay";

const challenge: StudyChallenge = {
  id: "challenge", title: "Finals", creatorId: "a", creatorName: "Ali",
  startsAt: "2026-10-29T00:00:00.000Z", endsAt: "2026-11-01T00:00:00.000Z",
  status: "active", myStatus: "accepted",
  participants: [
    { userId: "a", displayName: "Ali", status: "accepted", totalSeconds: 3600 },
    { userId: "b", displayName: "Sara", status: "accepted", totalSeconds: 7200 },
    { userId: "c", displayName: "Noor", status: "pending", totalSeconds: 20000 },
  ],
};

describe("study friend challenges", () => {
  it("ranks accepted students only by saved study time", () => {
    expect(acceptedStandings(challenge).map((student) => student.displayName)).toEqual(["Sara", "Ali"]);
  });

  it("derives invite, active, completed and cancelled phases", () => {
    expect(challengePhase({ ...challenge, myStatus: "pending" }, Date.parse("2026-10-30"))).toBe("invited");
    expect(challengePhase(challenge, Date.parse("2026-10-30"))).toBe("active");
    expect(challengePhase(challenge, Date.parse("2026-11-02"))).toBe("completed");
    expect(challengePhase({ ...challenge, status: "cancelled" }, Date.parse("2026-10-30"))).toBe("cancelled");
    expect(challengePhase({ ...challenge, challengeType: "all_or_nothing", roomState: "lobby" }, Date.parse("2026-10-30"))).toBe("lobby");
    expect(challengePhase({ ...challenge, challengeType: "all_or_nothing", roomState: "lobby", myStatus: "open" }, Date.parse("2026-10-30"))).toBe("open");
    expect(challengePhase({ ...challenge, challengeType: "all_or_nothing", roomState: "settled" }, Date.parse("2026-10-30"))).toBe("completed");
  });

  it("formats study totals and remaining time in both languages", () => {
    expect(formatStudySeconds(7260, "en")).toBe("2h 1m");
    expect(formatStudySeconds(7260, "ar")).toBe("2 س 1 د");
    expect(remainingLabel(challenge.endsAt, "en", Date.parse("2026-10-30T00:00:00.000Z"))).toBe("2d 0h");
  });
});

describe("All or Nothing live focus", () => {
  const zero = Date.parse("2026-11-27T12:00:00Z");
  const at = (seconds: number) => zero + seconds * 1000;
  const iso = (seconds: number) => new Date(at(seconds)).toISOString();
  const room: StudyChallenge = {
    ...challenge, challengeType: "all_or_nothing", roomState: "running",
    startsAt: iso(0), endsAt: iso(120),
    participants: [{ ...challenge.participants[0], joinedAt: iso(5), totalSeconds: 15, savedFocus: [[at(10), at(25)]] }],
  };
  const timer: StudyTimerDisplay = {
    sampledAt: at(40), seconds: 1000, direction: "down", isRunning: true,
    focus: { periods: [[at(-20), at(12)], [at(18), at(27)]], run: [at(30), at(90)] },
  };
  const score = (now: number, snapshot: StudyTimerDisplay = timer, target: StudyChallenge = room, savedRequestedAt = 0) =>
    liveChallengeStandings(target, { a: snapshot }, at(now), savedRequestedAt)[0];

  it("clips to the join and challenge times, merges overlapping seconds, and ticks between heartbeats", () => {
    expect(score(40)).toMatchObject({ totalSeconds: 32, isStudying: true });
    expect(score(42)).toMatchObject({ totalSeconds: 34, isStudying: true });
    expect(score(42, timer, { ...room, startsAt: iso(8) }).totalSeconds).toBe(31);
  });

  it("does not tick during breaks or beyond the last heartbeat's grace period", () => {
    const paused = { ...timer, focus: { periods: [[at(5), at(27)], [at(30), at(40)]] as [number, number][], run: null } };
    expect(score(50, paused)).toMatchObject({ totalSeconds: 32, isStudying: false });
    expect(score(72)).toMatchObject({ totalSeconds: 62, isStudying: false });
  });

  it("freezes a stopping timer and does not re-add it when the save arrives before or after presence clears", () => {
    const ended = { ...timer, focusEndedAt: at(44) };
    const saved: StudyChallenge = { ...room, participants: [{
      ...room.participants[0], totalSeconds: 36, savedFocus: [[at(5), at(27)], [at(30), at(44)]],
    }] };
    const stopped = { ...timer, focus: { periods: [[at(5), at(27)], [at(30), at(44)]] as [number, number][], run: null } };
    expect(score(46, stopped, saved, at(43))).toMatchObject({ totalSeconds: 36, isStudying: false });
    expect(score(46, ended)).toMatchObject({ totalSeconds: 36, isStudying: false });
    expect(score(46, ended, saved, at(45))).toMatchObject({ totalSeconds: 36, isStudying: false });
    expect(score(46, ended, room, at(45))).toMatchObject({ totalSeconds: 15, isStudying: false }); // discarded
    expect(score(46, ended, { ...saved, roomState: "settled" })).toMatchObject({ totalSeconds: 36, isStudying: false });
    expect(score(121)).toMatchObject({ totalSeconds: 15, isStudying: false });
  });
});


describe("challenge elapsed-time limits", () => {
  const recent: StudyChallenge = {
    ...challenge,
    startsAt: "2026-11-13T12:00:00Z",
    endsAt: "2026-11-20T12:00:00Z",
    participants: [
      { userId: "k", displayName: "Koki", status: "accepted", totalSeconds: 43200 },
      { userId: "v", displayName: "Valid", status: "accepted", totalSeconds: 900 },
    ],
  };

  it("removes excess from an old response while preserving valid time", () => {
    const standings = acceptedStandings(recent, Date.parse("2026-11-13T12:30:00Z"));
    expect(standings.map((p) => p.totalSeconds)).toEqual([1800, 900]);
    expect(recent.participants[0].totalSeconds).toBe(43200);
  });

  it("does not allow study time before the start or beyond the final challenge duration", () => {
    expect(acceptedStandings(recent, Date.parse("2026-11-13T11:59:00Z"))[0].totalSeconds).toBe(0);
    const ended = { ...recent, endsAt: "2026-11-13T13:00:00Z" };
    expect(acceptedStandings(ended, Date.parse("2026-11-14T12:00:00Z"))[0].totalSeconds).toBe(3600);
  });

  it("handles invalid totals and dates without displaying impossible times", () => {
    const invalid = { ...recent, participants: [
      { ...recent.participants[0], totalSeconds: Number.POSITIVE_INFINITY },
      { ...recent.participants[1], totalSeconds: -20 },
    ] };
    expect(acceptedStandings(invalid).map((p) => p.totalSeconds)).toEqual([0, 0]);
    expect(acceptedStandings({ ...recent, startsAt: "invalid" })[0].totalSeconds).toBe(0);
  });
});
