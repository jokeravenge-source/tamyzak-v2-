import { describe, expect, it } from "vitest";
import { getMcqChapterGroups } from "./mcqChapters";
import { getBuiltInPhysicsCh4 } from "./physicsChapter4Mcqs";

describe("English Physics Chapter 4", () => {
  it("includes the 77 supplied questions with four choices and the supplied key", () => {
    const rows = getBuiltInPhysicsCh4("en");
    expect(rows).toHaveLength(77);
    expect(new Set(rows.map((row) => row.id)).size).toBe(77);
    expect(rows.every((row) => new Set(row.choices).size === 4)).toBe(true);
    expect(rows.map((row) => "ABCD"[row.answer_index]).join(""))
      .toBe("ACDBCADBACDCBDACBDABCDABCADBCADBCADBCADBCABDACBDCADBCABCDABCDACBDACBADCBBCADB");
    expect(rows[19].choices[1]).toBe("fr = 1/(2π√LC)");
    expect(rows[72].choices[1]).toBe("897 pF");
  });

  it("groups the English set under Electromagnetic Waves only", () => {
    expect(getBuiltInPhysicsCh4("ar")).toEqual([]);
    expect(getMcqChapterGroups("physics", getBuiltInPhysicsCh4("en"), "en"))
      .toEqual(expect.arrayContaining([expect.objectContaining({ chapter: 4, title: "Electromagnetic Waves", count: 77 })]));
  });
});
