import { supabase } from "@/integrations/supabase/client";

export type TimedNadawiQuestion = { kind: "mcq" | "short"; prompt: string; choices: string[]; word_bank: string[] };
type Base = { server_now: string };
export type TimedNadawiState =
  | (Base & { status: "not_started" })
  | (Base & { status: "active"; attempt_id: string; started_at: string; deadline_at: string; question_index: number; total_questions: number; question: TimedNadawiQuestion })
  | (Base & { status: "completed"; attempt_id: string; started_at: string; completed_at: string; total_questions: number; score: number; elapsed_ms: number });
export type NadawiRank = { rank: number; display_name: string; score: number; elapsed_ms: number; is_me: boolean };
export type NadawiMistake = { question_number: number; prompt: string; word_bank: string[]; user_answer: string | null; correct_answers: string[]; timed_out: boolean };

// Keep the RPC boundary isolated until generated database types are refreshed after deployment.
type ContestRpc = (name: string, args?: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
const rpc: ContestRpc = (name, args) => (supabase.rpc as unknown as ContestRpc).call(supabase, name, args);
export function parseTimedNadawiState(value: unknown): TimedNadawiState {
  const s = value as TimedNadawiState;
  if (!s || !Number.isFinite(Date.parse(s.server_now))) throw new Error("INVALID_CONTEST_STATE");
  if (s.status === "not_started") return s;
  if (!["active", "completed"].includes(s.status) || typeof s.attempt_id !== "string" || s.total_questions !== 41 || !Number.isFinite(Date.parse(s.started_at))) throw new Error("INVALID_CONTEST_STATE");
  if (s.status === "completed") {
    if (!Number.isInteger(s.score) || s.score < 0 || s.score > 41 || !Number.isFinite(s.elapsed_ms) || s.elapsed_ms < 0 || !Number.isFinite(Date.parse(s.completed_at))) throw new Error("INVALID_CONTEST_STATE");
  } else {
    if (!Number.isInteger(s.question_index) || s.question_index < 0 || s.question_index >= 41 || !Number.isFinite(Date.parse(s.deadline_at)) || !s.question || !["mcq", "short"].includes(s.question.kind) || typeof s.question.prompt !== "string" || !Array.isArray(s.question.choices) || !s.question.choices.every((c) => typeof c === "string") || (s.question.kind === "mcq" && s.question.choices.length < 2) || !Array.isArray(s.question.word_bank)) throw new Error("INVALID_CONTEST_STATE");
  }
  return s;
}
async function stateRequest(name: string, args?: Record<string, unknown>) {
  const started = Date.now();
  const { data, error } = await rpc(name, args);
  const finished = Date.now();
  if (error) throw new Error(error.message);
  const state = parseTimedNadawiState(data);
  return { state, clockOffset: Date.parse(state.server_now) - (started + finished) / 2 };
}
export const getTimedNadawiState = (adminTest = false) => stateRequest(adminTest ? "get_nadawi_admin_test_state" : "get_nadawi_contest_state");
export const startTimedNadawi = (adminTest = false, restart = false) => adminTest ? stateRequest("start_nadawi_admin_test", { _restart: restart }) : stateRequest("start_nadawi_contest");
export const answerTimedNadawi = (attemptId: string, index: number, answer: string | null, adminTest = false) => stateRequest(adminTest ? "submit_nadawi_admin_test_answer" : "submit_nadawi_contest_answer", { _attempt_id: attemptId, _question_index: index, _answer: answer });
export async function getNadawiRankings(): Promise<NadawiRank[]> {
  const { data, error } = await rpc("get_nadawi_contest_leaderboard");
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error("INVALID_RANKINGS");
  return data.map((row) => {
    const r = row as NadawiRank;
    if (!Number.isFinite(Number(r.rank)) || typeof r.display_name !== "string" || !Number.isInteger(r.score) || !Number.isFinite(Number(r.elapsed_ms))) throw new Error("INVALID_RANKINGS");
    return { ...r, rank: Number(r.rank), elapsed_ms: Number(r.elapsed_ms) };
  });
}
export async function getNadawiMistakes(adminTest = false): Promise<NadawiMistake[]> {
  const { data, error } = await rpc("get_nadawi_contest_mistakes", { _admin_test: adminTest });
  if (error) throw new Error(error.message);
  if (!Array.isArray(data) || !data.every((row: NadawiMistake) => row && Number.isInteger(row.question_number) && row.question_number >= 1 && row.question_number <= 41 && typeof row.prompt === "string" && Array.isArray(row.word_bank) && row.word_bank.every((word) => typeof word === "string") && (row.user_answer === null || typeof row.user_answer === "string") && Array.isArray(row.correct_answers) && row.correct_answers.length > 0 && row.correct_answers.every((answer) => typeof answer === "string") && typeof row.timed_out === "boolean")) throw new Error("INVALID_MISTAKES");
  return data;
}
export function formatNadawiDuration(ms: number, precise = false) {
  const value = Math.max(0, Math.floor(ms));
  const minutes = Math.floor(value / 60000);
  const seconds = String(Math.floor(value / 1000) % 60).padStart(2, "0");
  return `${String(minutes).padStart(2, "0")}:${seconds}${precise ? `.${String(value % 1000).padStart(3, "0")}` : ""}`;
}

export async function canTestNadawiContest(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return false;
    const result = await rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    return !result.error && result.data === true;
  } catch { return false; }
}
