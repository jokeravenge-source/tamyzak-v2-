import { describe, expect, it } from "vitest";
import { getNadiaNavigationItems } from "@/data/nadiaTeacherContent";
import { getNadiaArabicLectureNoteSourceKeys } from "@/data/nadiaLectureNoteSources";

describe("Nadia English lecture-note Arabic fallbacks", () => {
  it("provides an Arabic note source for every English lecture in all chapters", () => {
    for (const chapter of [1, 2, 3, 4, 5] as const) {
      for (const item of getNadiaNavigationItems("en", chapter)) {
        const key = `nadia-en-ch${chapter}-lec${item.lecture}-study`;
        expect(getNadiaArabicLectureNoteSourceKeys(key), key).not.toHaveLength(0);
      }
    }
  });

  it("combines the shorter Arabic lectures for aggregated English topics", () => {
    expect(getNadiaArabicLectureNoteSourceKeys("nadia-en-ch2-lec10-study")).toEqual([
      "nadia-ar-ch2-lec25-study",
      "nadia-ar-ch2-lec26-study",
      "nadia-ar-ch2-lec27-study",
      "nadia-ar-ch2-lec28-study",
    ]);
    expect(getNadiaArabicLectureNoteSourceKeys("nadia-en-ch3-lec30-study")).toEqual([
      "nadia-ar-ch3-lec30-study",
      "nadia-ar-ch3-lec31-study",
    ]);
  });

  it("does not affect other teachers or non-study topic keys", () => {
    expect(getNadiaArabicLectureNoteSourceKeys("nadia-en-ch3-lec1-exam")).toEqual([]);
    expect(getNadiaArabicLectureNoteSourceKeys("ahmed-en-ch3-lec1-study")).toEqual([]);
  });
});
