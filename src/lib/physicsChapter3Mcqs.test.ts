import { describe, expect, it } from "vitest";
import { getMcqChapterGroups } from "./mcqChapters";
import { getBuiltInPhysicsCh3 } from "./physicsChapter3Mcqs";

describe("English Physics Chapter 3", () => {
  it("includes the 45 supplied questions with four choices and their original key", () => {
    const rows = getBuiltInPhysicsCh3("en");
    expect(rows).toHaveLength(45);
    expect(new Set(rows.map((row) => row.id)).size).toBe(45);
    expect(rows.every((row) => new Set(row.choices).size === 4)).toBe(true);
    expect(rows.map((row) => "ABCD"[row.answer_index]).join(""))
      .toBe("BACBBDACABCBCCABACBCCBACACDBCABCBBACCBCBBBCBA");
    expect(rows[5].choices[3]).toBe("π/2");
    expect(rows[28].question).toContain("power is consumed");
  });

  it("keeps the supplied set in Alternating Current and out of the Arabic curriculum", () => {
    expect(getBuiltInPhysicsCh3("ar")).toEqual([]);
    expect(getMcqChapterGroups("physics", getBuiltInPhysicsCh3("en"), "en"))
      .toEqual(expect.arrayContaining([expect.objectContaining({ chapter: 3, title: "Alternating Current", count: 45 })]));
  });
});
