import { describe, expect, it } from "vitest";
import { getMcqChapterGroups } from "./mcqChapters";
import { getBuiltInPhysicsCh7 } from "./physicsChapter7Mcqs";

describe("English Physics Chapter 7", () => {
  it("includes all 72 supplied questions with four choices and the supplied answer key", () => {
    const rows = getBuiltInPhysicsCh7("en");
    expect(rows).toHaveLength(72);
    expect(new Set(rows.map((row) => row.id)).size).toBe(72);
    expect(rows.every((row) => new Set(row.choices).size === 4)).toBe(true);
    expect(rows.map((row) => "ABCD"[row.answer_index]).join(""))
      .toBe("ABBBCCABBBBBBBBBBBBBCABCBBBBBBBBBCBBBBBCBABBABBBBBABBBABABABBBBABBAABAAA");
    expect(rows[5].choices[2]).toBe("10⁻⁸ to 10⁻⁵ Ω·m");
    expect(rows[54].choices[0]).toContain("≥ 1.1 eV");
    expect(rows[71].choices[0]).toContain("G = 900000");
  });

  it("groups the English set under Solid-State Electronics only", () => {
    expect(getBuiltInPhysicsCh7("ar")).toEqual([]);
    expect(getMcqChapterGroups("physics", getBuiltInPhysicsCh7("en"), "en"))
      .toEqual(expect.arrayContaining([expect.objectContaining({ chapter: 7, title: "Solid State Electronics", count: 72 })]));
  });
});
