import { describe, expect, it } from "vitest";
import type { PracticeAttempt } from "./topicMastery";
import { detectWeakAreas, mergeWeakAreas, type WeakArea } from "./weaknessProfile";
import { dailyLearningProfile, profileFromWeakAreas } from "./weeklyLearning";

const attempt = (
  question: string,
  correct: boolean,
  source: PracticeAttempt["source"],
  category = "physics:1:dielectric",
  createdAt = "2026-09-26T08:00:00Z",
): PracticeAttempt => ({
  subject: category.split(":")[0],
  chapter: category.split(":")[1],
  category_key: category,
  source,
  question_key: question,
  correct,
  created_at: createdAt,
});
describe("unified weakness profile", () => {
  it("uses the latest distinct MCQ and flashcard outcomes", () => {
    const areas = detectWeakAreas([
      attempt("mcq-a", false, "mcq_bank", "physics:1:dielectric", "2026-09-24T08:00:00Z"),
      attempt("mcq-a", true, "mcq_bank", "physics:1:dielectric", "2026-09-25T08:00:00Z"),
      attempt("mcq-b", false, "mcq_bank"),
      attempt("card-a", false, "flashcards"),
    ]);
    expect(areas[0]).toMatchObject({
      subject: "physics",
      chapterNumber: 1,
      evidenceCount: 3,
      mcqAccuracy: 50,
      flashcardAccuracy: 0,
    });
  });

  it("does not label a category weak after its only latest answer is correct", () => {
    expect(detectWeakAreas([
      attempt("same", false, "mcq_bank", "physics:1:dielectric", "2026-09-24T08:00:00Z"),
      attempt("same", true, "mcq_bank", "physics:1:dielectric", "2026-09-25T08:00:00Z"),
    ])).toEqual([]);
  });

  it("combines student confirmation with performance evidence", () => {
    const detected = detectWeakAreas([attempt("card", false, "flashcards")]);
    const merged = mergeWeakAreas(detected, [{
      ...detected[0],
      source: "student",
      weaknessText: "I forget when capacitance increases.",
    }]);
    expect(merged[0]).toMatchObject({ source: "combined", flashcardAccuracy: 0, weaknessText: "I forget when capacitance increases." });
  });

  it("rotates confirmed areas into the existing single target used by both practice tools", () => {
    const areas: WeakArea[] = [
      { subject: "physics", chapterNumber: 1, chapterKey: "physics-ch1", categoryKey: "physics:1:general", topicKey: "general", topicAr: "الفيزياء", topicEn: "Physics", weaknessText: "", source: "student" },
      { subject: "biology", chapterNumber: 2, chapterKey: "biology-ch2", categoryKey: "biology:2:general", topicKey: "general", topicAr: "الأحياء", topicEn: "Biology", weaknessText: "", source: "student" },
    ];
    const profile = profileFromWeakAreas(areas);
    const targets = new Set([
      dailyLearningProfile(profile, "2026-09-26")?.subject,
      dailyLearningProfile(profile, "2026-09-27")?.subject,
      dailyLearningProfile(profile, "2026-09-28")?.subject,
    ]);
    expect(targets).toEqual(new Set(["physics", "biology"]));
  });
});
