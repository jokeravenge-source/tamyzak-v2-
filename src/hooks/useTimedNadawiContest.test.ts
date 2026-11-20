import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useTimedNadawiContest } from "./useTimedNadawiContest";
const api = vi.hoisted(() => ({ get: vi.fn(), start: vi.fn(), answer: vi.fn() }));
vi.mock("@/lib/nadawiContestApi", () => ({ getTimedNadawiState: api.get, startTimedNadawi: api.start, answerTimedNadawi: api.answer }));
const active = (index = 0) => ({ state: { status: "active", attempt_id: "attempt", started_at: new Date(Date.now() - 5000).toISOString(), server_now: new Date().toISOString(), deadline_at: new Date(Date.now() + 30000).toISOString(), question_index: index, total_questions: 41, question: { kind: "mcq", prompt: "Question", choices: ["A", "B"], word_bank: [] } }, clockOffset: 0 });
beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); api.get.mockImplementation(async () => active()); api.answer.mockImplementation(async () => active(1)); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
it("automatically submits a timeout at 30 seconds and advances from the server response", async () => {
  const h = renderHook(useTimedNadawiContest); await act(async () => {});
  expect(h.result.current.seconds).toBe(30);
  await act(async () => vi.advanceTimersByTime(29900)); expect(api.answer).not.toHaveBeenCalled();
  await act(async () => vi.advanceTimersByTime(100));
  expect(api.answer).toHaveBeenCalledWith("attempt", 0, null);
  expect(h.result.current.state).toMatchObject({ status: "active", question_index: 1 });
});
it("prevents concurrent sends and keeps time running while the answer is in flight", async () => {
  let resolve: (v: unknown) => void;
  api.answer.mockImplementationOnce(() => new Promise((r) => { resolve = r; }));
  const h = renderHook(useTimedNadawiContest); await act(async () => {});
  act(() => { void h.result.current.submit("0"); void h.result.current.submit("1"); });
  expect(api.answer).toHaveBeenCalledOnce();
  act(() => vi.advanceTimersByTime(2000)); expect(h.result.current.seconds).toBe(28);
  await act(async () => resolve!(active(1)));
  expect(h.result.current.pending).toBe(false);
});
it("backs off when timeout synchronization fails instead of sending a request every tick", async () => {
  api.answer.mockRejectedValue(new Error("offline"));
  const h = renderHook(useTimedNadawiContest); await act(async () => {});
  await act(async () => vi.advanceTimersByTime(30000)); expect(api.answer).toHaveBeenCalledOnce();
  await act(async () => vi.advanceTimersByTime(1000)); expect(api.answer).toHaveBeenCalledOnce();
  expect(h.result.current.error).toBe("offline");
});
it("resumes the server attempt when the student returns to the tab", async () => {
  const h = renderHook(useTimedNadawiContest); await act(async () => {});
  api.get.mockResolvedValue(active(3));
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  expect(h.result.current.state).toMatchObject({ status: "active", question_index: 3 });
});
