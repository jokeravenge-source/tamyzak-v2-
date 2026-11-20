import { beforeEach, expect, it, vi } from "vitest";
const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));
import { answerTimedNadawi, startTimedNadawi, formatNadawiDuration, parseTimedNadawiState, getNadawiMistakes } from "./nadawiContestApi";
beforeEach(() => vi.clearAllMocks());
it("formats millisecond precision so the time tie-break is visible", () => {
  expect(formatNadawiDuration(91234, true)).toBe("01:31.234"); expect(formatNadawiDuration(91234)).toBe("01:31");
});
it("submits only attempt, index and answer to the server", async () => {
  rpc.mockResolvedValue({ data: { status: "not_started", server_now: new Date().toISOString() }, error: null });
  await answerTimedNadawi("attempt", 4, "arrest");
  expect(rpc).toHaveBeenCalledWith("submit_nadawi_contest_answer", { _attempt_id: "attempt", _question_index: 4, _answer: "arrest" });
});
it("rejects malformed scores, elapsed times or question deadlines", () => {
  const base = { status: "completed", attempt_id: "a", server_now: new Date().toISOString(), started_at: new Date().toISOString(), completed_at: new Date().toISOString(), total_questions: 41, score: 42, elapsed_ms: 1000 };
  expect(() => parseTimedNadawiState(base)).toThrow();
  expect(() => parseTimedNadawiState({ ...base, score: 41, elapsed_ms: -1 })).toThrow();
});

it("uses separate preview endpoints without restarting the official attempt", async () => {
  rpc.mockResolvedValue({ data: { status: "not_started", server_now: new Date().toISOString() }, error: null });
  await startTimedNadawi(true, true);
  expect(rpc).toHaveBeenLastCalledWith("start_nadawi_admin_test", { _restart: true });
  await answerTimedNadawi("preview", 0, "1", true);
  expect(rpc).toHaveBeenLastCalledWith("submit_nadawi_admin_test_answer", { _attempt_id: "preview", _question_index: 0, _answer: "1" });
});

it("loads corrections through the own-attempt RPC and validates its response", async () => {
  const row = { question_number: 2, prompt: "Choose", word_bank: [], user_answer: "wrong", correct_answers: ["right"], timed_out: false };
  rpc.mockResolvedValue({ data: [row], error: null });
  expect(await getNadawiMistakes()).toEqual([row]);
  expect(rpc).toHaveBeenLastCalledWith("get_nadawi_contest_mistakes", { _admin_test: false });
  await getNadawiMistakes(true);
  expect(rpc).toHaveBeenLastCalledWith("get_nadawi_contest_mistakes", { _admin_test: true });
  rpc.mockResolvedValue({ data: [{ ...row, correct_answers: [] }], error: null });
  await expect(getNadawiMistakes()).rejects.toThrow("INVALID_MISTAKES");
});

it("accepts a closed state without requiring an attempt or question", () => {
  const closed = { status: "closed", server_now: new Date().toISOString() };
  expect(parseTimedNadawiState(closed)).toEqual(closed);
});
