import { describe, expect, it } from "vitest";
import { acceptedStandings, challengePhase, formatStudySeconds, remainingLabel, type StudyChallenge } from "./studyChallenges";

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
  });

  it("formats study totals and remaining time in both languages", () => {
    expect(formatStudySeconds(7260, "en")).toBe("2h 1m");
    expect(formatStudySeconds(7260, "ar")).toBe("2 س 1 د");
    expect(remainingLabel(challenge.endsAt, "en", Date.parse("2026-10-30T00:00:00.000Z"))).toBe("2d 0h");
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
