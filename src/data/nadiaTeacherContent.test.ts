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

  it("organizes the remaining Arabic chapters by their available topics", () => {
    expect(getNadiaNavigationItems("ar", 2)).toHaveLength(24);
    expect(getNadiaNavigationItems("ar", 3)).toHaveLength(33);
    expect(getNadiaNavigationItems("ar", 4)).toHaveLength(7);
    expect(getNadiaNavigationItems("ar", 3).some((item) => item.lecture === 11)).toBe(false);
    expect(getNadiaTopicTitle("ar", 4, 9, "ar")).toBe("الاستنساخ الحيواني وتقنيات الإخصاب المساعد");
  });

  it("organizes the remaining English chapters by topic", () => {
    expect(usesNadiaTopicNavigation("en", 2)).toBe(true);
    expect(usesNadiaTopicNavigation("en", 3)).toBe(true);
    expect(usesNadiaTopicNavigation("en", 4)).toBe(true);
    expect(getNadiaNavigationItems("en", 2)).toHaveLength(11);
    expect(getNadiaNavigationItems("en", 3)).toHaveLength(33);
    expect(getNadiaNavigationItems("en", 4)).toHaveLength(12);
    expect(getNadiaTopicTitle("en", 3, 6, "en")).toBe("Asexual Reproduction in Paramecium");
    expect(getNadiaTopicTitle("en", 3, 33, "en")).toBe("Parthenogenesis and Hermaphroditism");
  });

  it("organizes the existing English Chapter 1 content by topic", () => {
    const items = getNadiaNavigationItems("en", 1);
    expect(usesNadiaTopicNavigation("en", 1)).toBe(true);
    expect(items).toHaveLength(27);
    expect(items[0]).toMatchObject({ lecture: 1, en: "Introduction to Cells and Cell Theory" });
    expect(items.find((item) => item.lecture === 7)?.en).toBe("Golgi Apparatus");
    expect(items.at(-1)).toMatchObject({ lecture: 27, en: "Meiosis" });
  });

  it("uses the source-deck topic map for English Chapter 5", () => {
    const items = getNadiaNavigationItems("en", 5);
    expect(usesNadiaTopicNavigation("en", 5)).toBe(true);
    expect(items).toHaveLength(14);
    expect(items.at(-1)?.en).toBe("Ministerial Review");
  });
});
