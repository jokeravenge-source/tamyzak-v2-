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

  it("groups the English set under Alternating Current", () => {
    expect(getMcqChapterGroups("physics", getBuiltInPhysicsCh3("en"), "en"))
      .toEqual(expect.arrayContaining([expect.objectContaining({ chapter: 3, title: "Alternating Current", count: 45 })]));
  });
});

describe("Arabic Physics Chapter 3", () => {
  it("includes the 57 supplied questions with four choices and the corrected key", () => {
    const rows = getBuiltInPhysicsCh3("ar");
    const englishIds = new Set(getBuiltInPhysicsCh3("en").map((row) => row.id));
    expect(rows).toHaveLength(57);
    expect(new Set(rows.map((row) => row.id)).size).toBe(57);
    expect(rows.every((row) => !englishIds.has(row.id) && new Set(row.choices).size === 4)).toBe(true);
    expect(rows.map((row) => "أبجد"[row.answer_index]).join(""))
      .toBe("جأبدبجدبججأدجأبببجأدجبدجبأبجأبجبأبجدأدأبجبجدبجأأجبجأبجدبأ");
    expect(rows[19].choices[rows[19].answer_index]).toBe("مفتاح مغلق");
    expect(rows[46].choices[0]).toBe("1 / (2π√(LC))");
  });

  it("groups the Arabic set under التيار المتناوب", () => {
    expect(getMcqChapterGroups("physics", getBuiltInPhysicsCh3("ar"), "ar"))
      .toEqual(expect.arrayContaining([expect.objectContaining({ chapter: 3, title: "التيار المتناوب", count: 57 })]));
  });
});
