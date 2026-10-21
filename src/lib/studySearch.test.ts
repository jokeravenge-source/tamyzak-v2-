import { describe, expect, it } from "vitest";
import { normalizeStudySearch } from "./studySearch";

describe("study search", () => {
  it("matches Arabic diacritics, stretched letters and common spelling variants", () => {
    expect(normalizeStudySearch(" أَحْيـاء ")).toBe(normalizeStudySearch("احياء"));
    expect(normalizeStudySearch("نادية النعيمي")).toBe(normalizeStudySearch("ناديه النعيمي"));
    expect(normalizeStudySearch("مُصْطَفَى")).toBe(normalizeStudySearch("مصطفي"));
  });
  it("normalizes English without removing the useful numbers in a search", () => {
    expect(normalizeStudySearch("  Unit 5 MCQ ")).toBe("unit 5 mcq");
  });
});
