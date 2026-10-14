import { restSecondsRemaining, workSecondsRemaining } from "./pomodoro";
import { MAX_SESSION_SECONDS, STARTED_PRESENCE_MS } from "./sessionPresenceClock";

export const STUDY_SESSION_STORAGE_KEY = "study_session_state_v1";

export type StudyTimerDisplay = {
  seconds: number;
  direction: "up" | "down";
  isRunning: boolean;
  sampledAt: number;
  observedAt?: number;
};

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
  return {
    ...studyTimerDisplay({
      elapsedSeconds,
      started: true,
      running,
      pomodoro: session.pomodoro === true,
      phase: session.phase === "rest" ? "rest" : "work",
      phaseStartSeconds,
      workMinutes,
      restRemaining: restSecondsRemaining(Number(session.restEndsAt ?? 0), now),
    }),
    sampledAt: now,
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

export function formatStudyTimer(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return [Math.floor(total / 3600), Math.floor(total % 3600 / 60), total % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");
}
