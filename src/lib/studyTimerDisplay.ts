import { restSecondsRemaining, workSecondsRemaining } from "./pomodoro";
import { MAX_SESSION_SECONDS, STARTED_PRESENCE_MS } from "./sessionPresenceClock";
import { restoreFocusPeriods, type StudyFocusPeriod } from "./studyFocusPeriods";

export const STUDY_SESSION_STORAGE_KEY = "study_session_state_v1";

export type StudyTimerDisplay = {
  seconds: number;
  direction: "up" | "down";
  isRunning: boolean;
  sampledAt: number;
  observedAt?: number;
  focus?: StudyTimerFocus;
  focusEndedAt?: number;
};

export type StudyTimerFocus = { periods: StudyFocusPeriod[]; run: StudyFocusPeriod | null };
export const STUDY_TIMER_HEARTBEAT_MS = 10_000;

export function readStudyTimerFocus(value: unknown, sampledAt: number): StudyTimerFocus | undefined {
  if (!value || typeof value !== "object" || !Number.isSafeInteger(sampledAt)) return;
  const { periods, run } = value as Record<string, unknown>;
  if (!Array.isArray(periods)) return;
  const recorded = restoreFocusPeriods(periods, MAX_SESSION_SECONDS, sampledAt);
  if (recorded.length !== periods.length) return;
  if (run === null) return { periods: recorded, run: null };
  if (!Array.isArray(run) || run.length !== 2) return;
  const [start, limit] = run;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(limit) || start <= 0 || start > sampledAt ||
    start < (recorded.at(-1)?.[1] ?? 0) || limit <= start || limit - start > MAX_SESSION_SECONDS * 1000) return;
  return { periods: recorded, run: [start, limit] };
}

/** The visible clock is separate from the elapsed seconds saved for rewards. */
export function studyTimerDisplay({
  elapsedSeconds,
  started,
  running,
  pomodoro,
  phase,
  phaseStartSeconds,
  workMinutes,
  restRemaining,
}: {
  elapsedSeconds: number;
  started: boolean;
  running: boolean;
  pomodoro: boolean;
  phase: "work" | "rest";
  phaseStartSeconds: number;
  workMinutes: number;
  restRemaining: number;
}): Pick<StudyTimerDisplay, "seconds" | "direction" | "isRunning"> {
  const countdown = started && pomodoro;
  return {
    seconds: countdown
      ? phase === "rest" ? restRemaining : workSecondsRemaining(elapsedSeconds, phaseStartSeconds, workMinutes)
      : elapsedSeconds,
    direction: countdown ? "down" : "up",
    // Study time pauses during breaks, but the visible break clock keeps ticking.
    isRunning: started && (countdown && phase === "rest" || running),
  };
}

export function timerDisplayFromPersistedSession(value: unknown, now = Date.now()): StudyTimerDisplay | null {
  if (!value || typeof value !== "object") return null;
  const session = value as Record<string, unknown>;
  if (typeof session.subject !== "string" || !session.subject || session.started === false) return null;
  const accumulated = Number(session.accumulated ?? 0);
  const startedAt = Number(session.startedAt ?? 0);
  if (!Number.isFinite(accumulated) || accumulated < 0 || accumulated > MAX_SESSION_SECONDS ||
    !Number.isFinite(startedAt)) return null;
  const running = session.running === true;
  const elapsedSeconds = Math.min(MAX_SESSION_SECONDS, accumulated +
    (running && startedAt > 0 ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0));
  const workMinutes = Number(session.pomodoroWorkMin ?? 45);
  const phaseStartSeconds = Number(session.phaseStartSeconds ?? 0);
  if (!Number.isFinite(workMinutes) || workMinutes <= 0 || workMinutes * 60 > MAX_SESSION_SECONDS ||
    !Number.isFinite(phaseStartSeconds) || phaseStartSeconds < 0) return null;
  const phase = session.phase === "rest" ? "rest" : "work";
  const checkIn = Number(session.lastCheckInSeconds);
  const previousCheckIn = Number.isInteger(checkIn) && checkIn >= 0 && checkIn <= accumulated
    ? checkIn : Math.floor(accumulated / 3600) * 3600;
  const focusLimit = Math.min(MAX_SESSION_SECONDS, previousCheckIn + 3600,
    session.pomodoro === true ? phaseStartSeconds + workMinutes * 60 : MAX_SESSION_SECONDS);
  const isFocusing = running && phase === "work" && startedAt > 0 && startedAt <= now;
  const closed = restoreFocusPeriods(session.focusPeriods, accumulated, isFocusing ? startedAt : now);
  const run: StudyFocusPeriod | null = isFocusing && focusLimit > accumulated
    ? [startedAt, startedAt + Math.floor(focusLimit - accumulated) * 1000]
    : null;
  return {
    ...studyTimerDisplay({
      elapsedSeconds,
      started: true,
      running,
      pomodoro: session.pomodoro === true,
      phase,
      phaseStartSeconds,
      workMinutes,
      restRemaining: restSecondsRemaining(Number(session.restEndsAt ?? 0), now),
    }),
    sampledAt: now,
    focus: { periods: closed, run },
  };
}

export function displayedStudyTimerSeconds(timer: StudyTimerDisplay | undefined, now: number): number | null {
  if (!timer || !Number.isFinite(timer.seconds) || timer.seconds < 0 || timer.seconds > MAX_SESSION_SECONDS ||
    !Number.isFinite(timer.sampledAt) || typeof timer.isRunning !== "boolean" ||
    (timer.direction !== "up" && timer.direction !== "down")) return null;
  const age = now - (timer.observedAt ?? timer.sampledAt);
  if (!Number.isFinite(age) || age < -60_000 || age > STARTED_PRESENCE_MS) return null;
  const extra = timer.isRunning ? Math.floor(Math.max(0, age) / 1000) : 0;
  return Math.max(0, Math.min(MAX_SESSION_SECONDS,
    Math.floor(timer.seconds) + (timer.direction === "down" ? -extra : extra)));
}

/** A Pomodoro break can show a ticking clock even though focus has paused. */
export function isStudyTimerFocusing(timer: StudyTimerDisplay | undefined, presenceRunning: boolean): boolean {
  if (!timer) return presenceRunning;
  if (!timer.isRunning || timer.focusEndedAt !== undefined) return false;
  return timer.direction === "up" || (timer.focus ? timer.focus.run !== null : presenceRunning);
}

export function formatStudyTimer(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return [Math.floor(total / 3600), Math.floor(total % 3600 / 60), total % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");
}
