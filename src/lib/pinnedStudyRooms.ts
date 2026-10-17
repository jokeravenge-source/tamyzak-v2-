import { SUBJECTS_ORDER } from "@/data/subjectChapters";

const SUBJECT_ROOM_CODES: Record<string, string> = {
  islamic: "TMZISL", arabic: "TMZARB", english: "TMZENG", french: "TMZFRE",
  math: "TMZMTH", physics: "TMZPHY", chemistry: "TMZCHM", biology: "TMZBIO",
};

export const PINNED_STUDY_ROOMS = [
  { code: "37ECJK", subject: null, ar: "تميّزك", en: "Tamayzak" },
  ...SUBJECTS_ORDER.map((s) => ({ ...s, code: SUBJECT_ROOM_CODES[s.code], subject: s.code })),
];

/** General rooms don't require a curriculum choice to start a study session. */
export function roomSessionSubject(roomSubject: string | null): string {
  return roomSubject || "general";
}