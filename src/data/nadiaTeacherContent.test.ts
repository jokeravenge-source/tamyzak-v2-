import { describe, expect, it } from "vitest";
import {
  getNadiaLectureCount,
  getNadiaNavigationItems,
  getNadiaTopicTitle,
  usesNadiaTopicNavigation,
} from "./nadiaTeacherContent";

describe("Nadia lecture counts", () => {
  it("limits Arabic Chapter 3 to 34 lectures", () => {
    expect(getNadiaLectureCount("ar", 3)).toBe(34);
  });

  it("leaves English Chapter 3 unchanged", () => {
    expect(getNadiaLectureCount("en", 3)).toBe(39);
  });
});

describe("Nadia topic navigation", () => {
  it("organizes Arabic Chapter 1 by unique topics", () => {
    const items = getNadiaNavigationItems("ar", 1);
    expect(usesNadiaTopicNavigation("ar", 1)).toBe(true);
    expect(items).toHaveLength(26);
    expect(items.some((item) => item.lecture === 5)).toBe(false);
    expect(items.some((item) => item.lecture === 26)).toBe(false);
    expect(getNadiaTopicTitle("ar", 1, 22, "ar")).toBe("الشرب الخلوي والإخراج الخلوي");
  });

  it("organizes Arabic Chapter 5 by its 21 genetics topics", () => {
    const items = getNadiaNavigationItems("ar", 5);
    expect(usesNadiaTopicNavigation("ar", 5)).toBe(true);
    expect(items).toHaveLength(21);
    expect(items.at(-1)?.ar).toBe("الهندسة الوراثية وتطبيقاتها");
  });

  it("keeps other chapters lecture-based", () => {
    expect(usesNadiaTopicNavigation("en", 1)).toBe(false);
    expect(getNadiaNavigationItems("ar", 3)).toHaveLength(34);
  });
});
