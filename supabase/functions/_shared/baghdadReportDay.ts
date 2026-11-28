// Iraq is UTC+3 year-round. Report timestamps use an inclusive start and
// exclusive end so midnight sessions never appear on two successive days.
const DAY_MS = 86_400_000;
const BAGHDAD_OFFSET_MS = 3 * 60 * 60 * 1000;

export function baghdadReportDate(now = new Date()) {
  return new Date(now.getTime() + BAGHDAD_OFFSET_MS).toISOString().slice(0, 10);
}

export function baghdadReportBounds(day: string) {
  const start = new Date(`${day}T00:00:00+03:00`);
  const end = new Date(start.getTime() + DAY_MS);
  return { start: start.toISOString(), end: end.toISOString() };
}
