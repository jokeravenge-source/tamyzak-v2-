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
    expect(usesNadiaTopicNavigation("en", 3)).toBe(false);
    expect(getNadiaNavigationItems("ar", 3)).toHaveLength(34);
  });

  it("organizes the existing English Chapter 1 content by topic", () => {
    const items = getNadiaNavigationItems("en", 1);
    expect(usesNadiaTopicNavigation("en", 1)).toBe(true);
    expect(items).toHaveLength(17);
    expect(items[0]).toMatchObject({ lecture: 2, en: "Cells and Cell Theory" });
    expect(items.at(-1)).toMatchObject({ lecture: 27, en: "Meiosis" });
  });

  it("uses the genetics topic map for English Chapter 5", () => {
    const items = getNadiaNavigationItems("en", 5);
    expect(usesNadiaTopicNavigation("en", 5)).toBe(true);
    expect(items).toHaveLength(21);
    expect(items.at(-1)?.en).toBe("Genetic Engineering and Its Applications");
  });
});
