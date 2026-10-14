import { describe, expect, it } from "vitest";
import {
  displayedStudyTimerSeconds,
  formatStudyTimer,
  studyTimerDisplay,
  timerDisplayFromPersistedSession,
} from "./studyTimerDisplay";

const now = 1_000_000;
const session = {
  subject: "chemistry", started: true, running: true,
  accumulated: 0, startedAt: now - 20_000,
  pomodoro: true, pomodoroWorkMin: 50, pomodoroRestMin: 10,
  phase: "work", phaseStartSeconds: 0, restEndsAt: 0,
};

describe("the shared study timer", () => {
  it("shows the large focus countdown from the screenshot and preserves study totals", () => {
    const original = { ...session };
    const timer = timerDisplayFromPersistedSession(session, now)!;
    expect(formatStudyTimer(timer.seconds)).toBe("00:49:40");
    expect(displayedStudyTimerSeconds(timer, now + 10_000)).toBe(49 * 60 + 30);
    expect(session).toEqual(original);
    expect(session.accumulated).toBe(0);
  });

  it("uses the same countdown for the main display and a room snapshot", () => {
    const local = studyTimerDisplay({
      elapsedSeconds: 20, started: true, running: true, pomodoro: true,
      phase: "work", phaseStartSeconds: 0, workMinutes: 50, restRemaining: 0,
    });
    expect(timerDisplayFromPersistedSession(session, now)).toMatchObject(local);
  });

  it("freezes focus time when paused and continues after a resume", () => {
    const paused = timerDisplayFromPersistedSession({ ...session, running: false, accumulated: 20, startedAt: null }, now)!;
    expect(displayedStudyTimerSeconds(paused, now + 5 * 60_000)).toBe(2980);
    const resumed = timerDisplayFromPersistedSession({ ...session, accumulated: 20, startedAt: now + 5 * 60_000 }, now + 5 * 60_000)!;
    expect(displayedStudyTimerSeconds(resumed, now + 5 * 60_000 + 10_000)).toBe(2970);
  });

  it("counts down a break while the study clock is paused", () => {
    const resting = { ...session, phase: "rest", running: false, accumulated: 3000, restEndsAt: now + 600_000 };
    const timer = timerDisplayFromPersistedSession(resting, now)!;
    expect(timer.isRunning).toBe(true);
    expect(timer.seconds).toBe(600);
    expect(displayedStudyTimerSeconds(timer, now + 20_000)).toBe(580);
    expect(timerDisplayFromPersistedSession(resting, now + 20_000)?.seconds).toBe(580);
    expect(resting.accumulated).toBe(3000);
  });

  it("starts the next focus block with the full preset", () => {
    const next = timerDisplayFromPersistedSession({
      ...session, accumulated: 3000, phaseStartSeconds: 3000, startedAt: now,
    }, now)!;
    expect(formatStudyTimer(next.seconds)).toBe("00:50:00");
  });

  it("uses elapsed time for a normal session", () => {
    const timer = timerDisplayFromPersistedSession({ ...session, pomodoro: false }, now)!;
    expect(formatStudyTimer(timer.seconds)).toBe("00:00:20");
    expect(displayedStudyTimerSeconds(timer, now + 10_000)).toBe(30);
  });

  it("extrapolates from a wall-clock anchor while the owner's tab is in the background", () => {
    const timer = timerDisplayFromPersistedSession(session, now + 5 * 60_000)!;
    expect(timer.seconds).toBe(44 * 60 + 40);
  });

  it("never lets a countdown go negative or an elapsed clock exceed 48 hours", () => {
    const countdown = timerDisplayFromPersistedSession(session, now)!;
    expect(displayedStudyTimerSeconds(countdown, now + 60 * 60_000)).toBe(0);
    expect(displayedStudyTimerSeconds({ seconds: 48 * 3600 - 1, direction: "up", isRunning: true, sampledAt: now }, now + 10_000)).toBe(48 * 3600);
  });

  it("rejects corrupt and abandoned timer snapshots", () => {
    expect(timerDisplayFromPersistedSession(null, now)).toBeNull();
    expect(timerDisplayFromPersistedSession({ ...session, started: false }, now)).toBeNull();
    expect(timerDisplayFromPersistedSession({ ...session, accumulated: -1 }, now)).toBeNull();
    expect(timerDisplayFromPersistedSession({ ...session, pomodoroWorkMin: "bad" }, now)).toBeNull();
    const timer = timerDisplayFromPersistedSession(session, now)!;
    expect(displayedStudyTimerSeconds(timer, now + 66 * 60_000)).toBeNull();
    expect(displayedStudyTimerSeconds({ ...timer, seconds: NaN }, now)).toBeNull();
  });

  it("formats every room clock in the same left-to-right HH:MM:SS format", () => {
    expect(formatStudyTimer(0)).toBe("00:00:00");
    expect(formatStudyTimer(3661)).toBe("01:01:01");
  });
});
