import { describe, expect, it } from "vitest";
import { appendFocusRun, elapsedStudySeconds, focusPeriodsMultirange, restoreFocusPeriods, trimFocusRuns, type StudyFocusPeriod } from "./studyFocusPeriods";

describe("saved timer focus periods", () => {
  it("records work on each side of a pause and keeps its original timestamps on reload", () => {
    const periods: StudyFocusPeriod[] = [];
    appendFocusRun(periods, 1000, 30);
    const restored = restoreFocusPeriods(JSON.parse(JSON.stringify(periods)), 30, 60001);
    const elapsed = elapsedStudySeconds(30, 60001, 71002);
    appendFocusRun(restored, 60001, elapsed - 30);
    expect(restored).toEqual([[1000, 31000], [60001, 71001]]);
  });

  it("does not guess the timestamps of a legacy timer's accumulated minutes", () => {
    const restored = restoreFocusPeriods(undefined, 3600, 10000);
    appendFocusRun(restored, 10000, elapsedStudySeconds(3600, 10000, 18000) - 3600);
    expect(restored).toEqual([[10000, 18000]]);
  });

  it("trims removed time from the latest work, across any intervening pause", () => {
    const periods: StudyFocusPeriod[] = [[1000, 31000], [61000, 71000]];
    trimFocusRuns(periods, 15);
    expect(periods).toEqual([[1000, 26000]]);
    expect(focusPeriodsMultirange(periods)).toBe('{["1970-01-01T00:00:01.000Z","1970-01-01T00:00:26.000Z")}');
  });

  it("bounds the restored clock and excludes invalid or future periods", () => {
    expect(elapsedStudySeconds(172799, 1000, 8000)).toBe(172800);
    expect(elapsedStudySeconds(50, 8000, 1000)).toBe(50);
    expect(restoreFocusPeriods([[1000, 8000]], 20, 5000)).toEqual([]);
    expect(restoreFocusPeriods([[1000, 3000], [2000, 4000]], 20, 5000)).toEqual([]);
    expect(restoreFocusPeriods([[1000, 4000]], 2, 5000)).toEqual([]);
  });
});
