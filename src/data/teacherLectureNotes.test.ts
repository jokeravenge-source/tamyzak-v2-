import { describe, expect, it } from "vitest";
import { getCuratedTeacherLectureNote } from "./teacherLectureNotes";

describe("Nadia English lecture notes", () => {
  it.each([2, 4, 6])("uses English titles, headings and questions with Arabic explanations in lecture %s", (lecture) => {
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
});
