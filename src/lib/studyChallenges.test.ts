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
