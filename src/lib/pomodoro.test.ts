import { describe, expect, it } from "vitest";
import {
  matchingPomodoroPreset,
  restSecondsRemaining,
  workSecondsRemaining,
} from "./pomodoro";

describe("pomodoro timing", () => {
  it("counts down a work phase from study time only", () => {
    expect(workSecondsRemaining(15 * 60, 0, 45)).toBe(30 * 60);
    expect(workSecondsRemaining(60 * 60, 15 * 60, 45)).toBe(0);
  });

  it("uses a wall-clock deadline for rest time", () => {
    expect(restSecondsRemaining(1_000_000, 700_000)).toBe(300);
    expect(restSecondsRemaining(1_000_000, 1_000_001)).toBe(0);
  });

  it("falls back to the 45/5 preset for old custom settings", () => {
    expect(matchingPomodoroPreset(45, 15)).toMatchObject({ workMinutes: 45, restMinutes: 5 });
    expect(matchingPomodoroPreset(50, 10).id).toBe("50-10");
  });
});
