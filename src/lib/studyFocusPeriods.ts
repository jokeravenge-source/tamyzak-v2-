import { MAX_SESSION_SECONDS } from "./sessionPresenceClock";

export type StudyFocusPeriod = [start: number, end: number];

export function elapsedStudySeconds(accumulated: number, startedAt: number, now = Date.now()): number {
  const extra = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  return Math.min(MAX_SESSION_SECONDS, accumulated + extra);
}

/** Close only the portion added to the timer's elapsed total by this run. */
export function appendFocusRun(periods: StudyFocusPeriod[], startedAt: number, seconds: number): void {
  const end = startedAt + seconds * 1000;
  const start = Math.max(startedAt, periods.at(-1)?.[1] ?? 0);
  if (startedAt > 0 && end > start) periods.push([start, end]);
}

export function restoreFocusPeriods(value: unknown, accumulated: number, now: number): StudyFocusPeriod[] {
  if (!Array.isArray(value)) return [];
  const periods: StudyFocusPeriod[] = [];
  let remaining = accumulated * 1000;
  for (const candidate of value) {
    if (!Array.isArray(candidate) || candidate.length !== 2) return [];
    const [start, end] = candidate;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) ||
        start <= 0 || end <= start || end > now || start < (periods.at(-1)?.[1] ?? 0)) return [];
    remaining -= end - start;
    if (remaining < 0) return [];
    periods.push([start, end]);
  }
  return periods;
}

export function trimFocusRuns(periods: StudyFocusPeriod[], removedSeconds: number): void {
  let remaining = removedSeconds * 1000;
  while (periods.length && remaining > 0) {
    const [start, end] = periods[periods.length - 1];
    const dropped = Math.min(end - start, remaining);
    if (end - dropped > start) periods[periods.length - 1] = [start, end - dropped];
    else periods.pop();
    remaining -= dropped;
  }
}

export function focusPeriodsMultirange(periods: StudyFocusPeriod[]): string {
  const ranges = periods.map(([start, end]) =>
    `["${new Date(start).toISOString()}","${new Date(end).toISOString()}")`);
  return `{${ranges.join(",")}}`;
}
