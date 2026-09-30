import { beforeEach, describe, expect, it } from "vitest";
import { markUsageIntroAnswered, usageIntroAnswered } from "@/lib/usageIntro";

describe("UsageIntroGate device persistence", () => {
  beforeEach(() => localStorage.clear());

  it("opens for a device that has never answered", () => {
    expect(usageIntroAnswered()).toBe(false);
  });

  it("stays answered permanently on the current device", () => {
    markUsageIntroAnswered();
    expect(usageIntroAnswered()).toBe(true);
  });

  it("does not interrupt devices that answered the previous daily prompt", () => {
    localStorage.setItem("usage_intro_answered_day", "2026-09-30");
    expect(usageIntroAnswered()).toBe(true);
  });
});
