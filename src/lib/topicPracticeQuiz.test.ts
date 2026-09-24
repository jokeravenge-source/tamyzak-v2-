import { describe, expect, it } from "vitest";
import { buildTopicQuiz, topicBaseline, type TopicPracticeTarget } from "./topicPracticeQuiz";
import { questionKey, type PracticeAttempt } from "./topicMastery";

const target: TopicPracticeTarget = { subject: "physics", chapter: 1, categoryKey: "physics:1:dielectric" };
const row = (id: string, question: string, chapter = 1) => ({ id, subject: "physics", chapter, chapter_title: null, question, tags: [] as string[] });
const attempt = (question: string, correct: boolean, day: number): PracticeAttempt => ({
  subject: "physics", chapter: "1", category_key: target.categoryKey, source: "mcq_bank",
  question_key: questionKey(question), correct, created_at: `2026-09-${String(day).padStart(2, "0")}T10:00:00Z`,
});

describe("focused topic practice", () => {
  it("selects exact-topic questions and puts missed questions before new and mastered ones", () => {
    const missed = row("missed", "What happens to a dielectric in a capacitor?");
    const fresh = row("fresh", "Which dielectric changes capacitance?");
    const mastered = row("mastered", "How does dielectric constant affect capacitance?");
    const other = row("other", "What happens to the magnetic flux?");
    const wrongChapter = row("wrong-chapter", "Which dielectric changes capacitance?", 2);
    const quiz = buildTopicQuiz([mastered, other, fresh, wrongChapter, missed], [
      attempt(missed.question, false, 20), attempt(mastered.question, true, 21),
    ], target);
    expect(quiz.map((question) => question.id)).toEqual(["missed", "fresh", "mastered"]);
  });

  it("does not fill a short topic quiz with questions from elsewhere", () => {
    expect(buildTopicQuiz([row("other", "What happens to magnetic flux?")], [], target)).toEqual([]);
  });

  it("uses the latest graded result per distinct question for the earlier baseline", () => {
    const data = [attempt("a", false, 20), attempt("a", true, 21), attempt("b", false, 22)];
    expect(topicBaseline(data, target)).toEqual({ count: 2, percent: 50 });
    expect(topicBaseline([], target)).toEqual({ count: 0, percent: null });
  });
});
