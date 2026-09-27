export type PomodoroPhase = "work" | "rest";

export type PomodoroPreset = {
  id: "45-5" | "50-10" | "60-15";
  workMinutes: number;
  restMinutes: number;
};

export const POMODORO_PRESETS: readonly PomodoroPreset[] = [
  { id: "45-5", workMinutes: 45, restMinutes: 5 },
  { id: "50-10", workMinutes: 50, restMinutes: 10 },
  { id: "60-15", workMinutes: 60, restMinutes: 15 },
] as const;

export function matchingPomodoroPreset(workMinutes: number, restMinutes: number): PomodoroPreset {
  return POMODORO_PRESETS.find((preset) =>
    preset.workMinutes === workMinutes && preset.restMinutes === restMinutes)
    ?? POMODORO_PRESETS[0];
}

export function workSecondsRemaining(
  totalStudySeconds: number,
  phaseStartedAtStudySeconds: number,
  workMinutes: number,
): number {
  const elapsed = Math.max(0, totalStudySeconds - phaseStartedAtStudySeconds);
  return Math.max(0, workMinutes * 60 - elapsed);
}

export function restSecondsRemaining(restEndsAt: number, now = Date.now()): number {
  if (!Number.isFinite(restEndsAt) || restEndsAt <= 0) return 0;
  return Math.max(0, Math.ceil((restEndsAt - now) / 1000));
}
