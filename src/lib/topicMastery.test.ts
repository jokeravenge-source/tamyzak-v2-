import { describe, expect, it } from "vitest";
import { questionKey, topicForQuestion, topicSummary, type PracticeAttempt } from "./topicMastery";

describe("shared practice categories", () => {
  it("groups a ministerial question and an MCQ about the same concept", () => {
    const ministerial = topicForQuestion("physics", 1, "What are the properties of a dielectric?");
    const mcq = topicForQuestion("physics", 1, "How does a dielectric affect a capacitor?");
    expect(ministerial.key).toBe(mcq.key);
    expect(ministerial.key).toBe("physics:1:dielectric");
  });

  it("keeps unmatched questions in a chapter-specific category", () => {
    expect(topicForQuestion("physics", 1, "Unrelated question").key).toBe("physics:1:general");
    expect(topicForQuestion("physics", 2, "Unrelated question").key).toBe("physics:2:general");
  });

  it("counts the most recent result for each distinct question", () => {
    const row = (question: string, correct: boolean, date: string): PracticeAttempt => ({
      subject: "physics", chapter: "1", category_key: "physics:1:dielectric",
      source: "mcq_bank", question_key: questionKey(question), correct, created_at: date,
    });
    const summary = topicSummary([
      row("a", false, "2026-09-20T00:00:00Z"),
      row("a", true, "2026-09-21T00:00:00Z"),
      row("b", true, "2026-09-21T00:00:00Z"),
      row("c", true, "2026-09-21T00:00:00Z"),
    ]);
    expect(summary).toMatchObject({ count: 3, objectiveCount: 3, state: "strong" });
  });
});
