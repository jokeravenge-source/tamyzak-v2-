import { describe, expect, it } from "vitest";
import { getNadiaLectureCount } from "./nadiaTeacherContent";

describe("Nadia lecture counts", () => {
  it("limits Arabic Chapter 3 to 34 lectures", () => {
    expect(getNadiaLectureCount("ar", 3)).toBe(34);
  });

  it("leaves English Chapter 3 unchanged", () => {
    expect(getNadiaLectureCount("en", 3)).toBe(39);
  });
});