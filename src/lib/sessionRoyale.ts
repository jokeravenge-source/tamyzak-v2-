import { supabase } from "@/integrations/supabase/client";
import type { AppLanguage } from "@/components/LanguageGate";
import type { LiveBattleQuestion } from "@/lib/liveBattleBank";
import { SUBJECTS_ORDER } from "@/data/subjectChapters";
import { SESSION_ROOM_CODE } from "@/lib/pinnedStudyRooms";

export { SESSION_ROOM_CODE };
export const MAX_ROYALE_INVITEES = 10;
const roomLinkKey = "tmz_session_room_link";

export function captureSessionRoomLink() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (url.pathname.replace(/\/+$/, "") !== "/room" || url.searchParams.get("code") !== SESSION_ROOM_CODE) return;
  try {
    localStorage.setItem(roomLinkKey, String(Date.now() + 15 * 60_000));
    localStorage.setItem("app_menu_choice_v1", "sessions");
  } catch { /* The room can still open directly from the URL. */ }
}

export function hasSessionRoomLink() {
  if (typeof window === "undefined") return false;
  if (window.location.pathname.replace(/\/+$/, "") === "/room" && new URLSearchParams(window.location.search).get("code") === SESSION_ROOM_CODE) return true;
  try { return Number(localStorage.getItem(roomLinkKey)) > Date.now(); } catch { return false; }
}

export function clearSessionRoomLink() {
  try { localStorage.removeItem(roomLinkKey); } catch { /* optional storage */ }
  const url = new URL(window.location.href);
  if (url.pathname.replace(/\/+$/, "") !== "/room" || url.searchParams.get("code") !== SESSION_ROOM_CODE) return;
  url.searchParams.delete("code");
  window.history.replaceState(window.history.state, "", "/" + url.search + url.hash);
}

export type RoyaleTopic = { subject: string; chapter: number; language: AppLanguage };
export type SessionPoll =
  | { id: string; state: "voting"; closes_at: string; vote: RoyaleTopic | null; topics: RoyaleTopic[] }
  | ({ id: string; state: "ready"; starts_at: string } & RoyaleTopic)
  | { id: string; state: "no_votes" };
export type RoyaleAction = "status" | "join" | "start" | "leave" | "answer";
export type RoyaleState = RoyaleTopic & {
  state: "lobby" | "playing" | "closed" | "done";
  host: boolean; starts_at: string | null; expires_at: string; server_now: string;
  players: { user_id: string; name: string; me: boolean; score: number }[];
  total: number; index: number | null; picked: number | null; deadline: string | null;
  question: { q: string; choices: string[] } | null;
};

async function resultOf<T>(request: PromiseLike<{ data: unknown; error: { message: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return data as T;
}
export const readSessionPoll = (vote?: RoyaleTopic) =>
  resultOf<SessionPoll | null>(supabase.rpc("session_royale_poll", vote ? { _vote: vote } : {}));
export const getRoyale = (id: string, action: RoyaleAction, index?: number, choice?: number) =>
  resultOf<RoyaleState | null>(supabase.rpc("study_royale", { _id: id, _action: action, _index: index, _choice: choice }));
export const createRoyale = (invitees: string[], topic: RoyaleTopic, questions: LiveBattleQuestion[]) =>
  resultOf<string>(supabase.rpc("create_study_royale", {
    _invitees: invitees, _subject: topic.subject, _chapter: topic.chapter, _language: topic.language, _questions: questions,
  }));

export function royaleSubjectName(subject: string, language: AppLanguage) {
  return SUBJECTS_ORDER.find((item) => item.code === subject)?.[language] ??
    (subject === "english_literature" ? (language === "ar" ? "الأدب الإنكليزي" : "English literature") : subject);
}
