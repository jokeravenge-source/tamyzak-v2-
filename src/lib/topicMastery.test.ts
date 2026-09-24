import { describe, expect, it } from "vitest";
import { questionKey, topChaptersByPractice, topicForQuestion, topicSummary, type PracticeAttempt } from "./topicMastery";

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

  it("ranks chapters by practice and scores the latest distinct questions", () => {
    const attempt = (subject: string, chapter: string, question: string, correct: boolean, day: number): PracticeAttempt => ({
      subject, chapter, category_key: `${subject}:${chapter}:general`, source: "mcq_bank",
      question_key: question, correct, created_at: `2026-09-${String(day).padStart(2, "0")}T12:00:00Z`,
    });
    const chapters = topChaptersByPractice([
      attempt("physics", "1", "a", false, 20), attempt("physics", "1", "a", true, 21),
      attempt("physics", "1", "b", true, 22), attempt("physics", "1", "c", false, 23),
      attempt("biology", "2", "d", true, 21), attempt("biology", "2", "e", false, 22),
      attempt("chemistry", "3", "f", true, 23), attempt("math", "4", "g", true, 23),
    ]);
    expect(chapters).toHaveLength(3);
    expect(chapters[0]).toMatchObject({ subject: "physics", chapter: "1", attempts: 4, questions: 3, percent: 67 });
    expect(chapters[1]).toMatchObject({ subject: "biology", chapter: "2", attempts: 2, percent: 50 });
  });
});
