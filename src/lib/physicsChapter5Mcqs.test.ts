import { describe, expect, it } from "vitest";
import { getMcqChapterGroups } from "./mcqChapters";
import { getBuiltInPhysicsCh5 } from "./physicsChapter5Mcqs";

describe("Arabic Physics Chapter 5", () => {
  it("includes the 70 supplied questions with four choices and the supplied key", () => {
    const rows = getBuiltInPhysicsCh5("ar");
    expect(rows).toHaveLength(70);
    expect(new Set(rows.map((row) => row.id)).size).toBe(70);
    expect(rows.every((row) => new Set(row.choices).size === 4)).toBe(true);
    expect(rows.map((row) => "أبجد"[row.answer_index]).join(""))
      .toBe("بجدجبجبدأجأدأبجدجأبجدأببأجدبأجدجأبجأدبأجدجبأبأدجأبدجأبدجأدبأجدأبجدبجأب");
    expect(rows[5].choices[2]).toBe("أعدادًا زوجية من π");
    expect(rows[62].choices[0]).toBe("1/λ⁴");
    expect(rows[66].choices[1]).toBe("4.9×10⁻⁵ m");
  });

  it("groups the Arabic set under البصريات الفيزيائية only", () => {
    expect(getBuiltInPhysicsCh5("en")).toEqual([]);
    expect(getMcqChapterGroups("physics", getBuiltInPhysicsCh5("ar"), "ar"))
      .toEqual(expect.arrayContaining([expect.objectContaining({ chapter: 5, title: "البصريات الفيزيائية", count: 70 })]));
  });
});
