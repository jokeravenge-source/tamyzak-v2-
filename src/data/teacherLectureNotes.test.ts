import { describe, expect, it } from "vitest";
import { getCuratedTeacherLectureNote } from "./teacherLectureNotes";
import { getNadiaTopicTitle } from "./nadiaTeacherContent";

describe("Nadia English lecture notes", () => {
  it.each([2, 4, 6, 20, 25, 26, 27, 28, 29, 30, 31, 32, 33])("uses English titles, headings and questions with Arabic explanations in lecture %s", (lecture) => {
    const note = getCuratedTeacherLectureNote("nadia-al-nuaimy", `nadia-en-ch3-lec${lecture}-study`)!;
    expect(note).toBeTruthy();
    expect(note.title).not.toMatch(/[\u0600-\u06ff]/);
    expect(note.notes).toMatch(/[\u0600-\u06ff]/);
    for (const line of note.notes.split("\n").filter((line) => /^#{1,6}\s/.test(line))) {
      expect(line).not.toMatch(/[\u0600-\u06ff]/);
    }
    const questions = note.notes.split("## Review Questions")[1].split("**Source:")[0];
    expect(questions).not.toMatch(/[\u0600-\u06ff]/);
    expect(questions).toMatch(/1\./);
  });
  it("maps the ten supplied summaries to the correct topics and records source pages", () => {
    for (const lecture of [20, 25, 26, 27, 28, 29, 30, 31, 32, 33]) {
      const note = getCuratedTeacherLectureNote("nadia-al-nuaimy", `nadia-en-ch3-lec${lecture}-study`)!;
      expect(note.title).toBe(getNadiaTopicTitle("en", 3, lecture, "en"));
      expect(note.notes).toMatch(/PDF page/);
      expect(note.notes).toMatch(/Answer:/);
      expect(getCuratedTeacherLectureNote("nadia-al-nuaimy", `nadia-ar-ch3-lec${lecture}-study`)).toBeNull();
    }
  });

  it("marks the missing insect metamorphosis source coverage rather than claiming completion", () => {
    const note = getCuratedTeacherLectureNote("nadia-al-nuaimy", "nadia-en-ch3-lec25-study")!;
    expect(note.remainingCoverage).toMatch(/partial/);
    expect(note.notes).toContain("## What Remains Uncovered");
  });

});
