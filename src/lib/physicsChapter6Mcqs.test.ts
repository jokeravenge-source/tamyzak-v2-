import { describe, expect, it } from "vitest";
import { getMcqChapterGroups } from "./mcqChapters";
import { getBuiltInPhysicsCh6 } from "./physicsChapter6Mcqs";

describe("Arabic Physics Chapter 6", () => {
  it("includes the 49 available questions with four choices and the verified key", () => {
    const rows = getBuiltInPhysicsCh6("ar");
    expect(rows).toHaveLength(49);
    expect(new Set(rows.map((row) => row.id)).size).toBe(49);
    expect(rows.every((row) => new Set(row.choices).size === 4)).toBe(true);
    expect(rows.map((row) => "أبجد"[row.answer_index]).join(""))
      .toBe("بأججبدأببأبجبجأدبجدأبجأجبدأجأبدجأبدأبأدجدأأبجأدأب");
    expect(rows[6].choices[0]).toBe("λm·T = 2.898×10⁻³");
    expect(rows[37].choices[0]).toBe("2×10⁶ m/s");
    expect(rows[48].answer_index).toBe(1);
  });

  it("groups the Arabic set under الفيزياء الحديثة only", () => {
    expect(getBuiltInPhysicsCh6("en")).toEqual([]);
    expect(getMcqChapterGroups("physics", getBuiltInPhysicsCh6("ar"), "ar"))
      .toEqual(expect.arrayContaining([expect.objectContaining({ chapter: 6, title: "الفيزياء الحديثة", count: 49 })]));
  });
});
