import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import NadawiContest from "./NadawiContest";
import type { TimedNadawiState } from "@/lib/nadawiContestApi";
const api = vi.hoisted(() => ({ state: null as TimedNadawiState | null, seconds: 30, pending: false, error: "", submit: vi.fn(), start: vi.fn(), refresh: vi.fn(), ranks: vi.fn(), restart: vi.fn() }));
vi.mock("@/hooks/useTimedNadawiContest", () => ({ useTimedNadawiContest: () => ({ ...api, elapsed: 2500 }) }));
vi.mock("@/lib/nadawiContestApi", () => ({ formatNadawiDuration: (ms: number) => String(ms), getNadawiRankings: api.ranks }));
beforeEach(() => { vi.clearAllMocks(); api.state = { status: "not_started", server_now: new Date().toISOString() }; api.seconds = 30; api.pending = false; api.error = ""; api.ranks.mockResolvedValue([]); });
afterEach(cleanup);
const active = (kind: "mcq" | "short"  = "mcq"): Extract<TimedNadawiState, { status: "active" }> => ({ status: "active", attempt_id: "attempt", started_at: new Date().toISOString(), server_now: new Date().toISOString(), deadline_at: new Date(Date.now() + 30000).toISOString(), question_index: 0, total_questions: 41, question: { kind, prompt: "Choose your answer", choices: kind === "mcq" ? ["First", "Second"] : [], word_bank: [] } });
it("explains the timed one-attempt ranking rules before starting", () => {
  render(<NadawiContest language="en" />);
  expect(screen.getByText(/30 seconds per question/)).toBeInTheDocument();
  expect(screen.getByText(/Higher score wins/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Start challenge" }));
  expect(api.start).toHaveBeenCalledOnce();
});
it("sends only the selected option and never a client score or time", () => {
  api.state = active(); render(<NadawiContest language="en" />);
  fireEvent.click(screen.getByRole("button", { name: "Second" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit and continue" }));
  expect(api.submit).toHaveBeenCalledWith("1");
  expect(screen.queryByText("Review my mistakes")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument();
  expect(screen.queryByText(/Correct answer:/)).not.toBeInTheDocument();
});
it("disables answers on timeout and rejects multiword short answers", () => {
  api.state = active("short"); const view = render(<NadawiContest language="en" />);
  fireEvent.change(screen.getByLabelText("Type one word"), { target: { value: "will arrest" } });
  expect(screen.getByRole("button", { name: "Submit and continue" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Type one word"), { target: { value: "arrest" } });
  expect(screen.getByRole("button", { name: "Submit and continue" })).toBeEnabled();
  api.seconds = 0; view.rerender(<NadawiContest language="en" />);
  expect(screen.getByRole("button", { name: /Time’s up/ })).toBeDisabled();
});
it("shows the persisted score, precise total time and official ranking", async () => {
  api.state = { status: "completed", attempt_id: "attempt", started_at: new Date().toISOString(), server_now: new Date().toISOString(), completed_at: new Date().toISOString(), score: 31, total_questions: 41, elapsed_ms: 91234 };
  api.ranks.mockResolvedValue([{ rank: 1, display_name: "Sara", score: 41, elapsed_ms: 60000, is_me: false }, { rank: 2, display_name: "Ali", score: 31, elapsed_ms: 91234, is_me: true }]);
  render(<NadawiContest language="en" />);
  expect(screen.getByText("31 / 41")).toBeInTheDocument();
  expect(screen.getByText("Review my mistakes")).toBeInTheDocument();
  expect(await screen.findByText("Ali (you)")).toBeInTheDocument();
  expect(screen.getByText("Your current rank")).toBeInTheDocument();
  expect(screen.getByText("#2")).toBeInTheDocument();
  expect(screen.getByText("Sara")).toBeInTheDocument();
  expect(screen.getByText(/Letter writing|Original letter task/)).toBeInTheDocument();
});

it("keeps admin test results outside student standings and offers restart", () => {
  api.state = { status: "completed", attempt_id: "preview", started_at: new Date().toISOString(), server_now: new Date().toISOString(), completed_at: new Date().toISOString(), score: 41, total_questions: 41, elapsed_ms: 2000 };
  render(<NadawiContest language="en" adminTest />);
  expect(screen.getByText(/excluded from student rankings/)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Test complete!" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Restart test" }));
  expect(api.restart).toHaveBeenCalledOnce();
  expect(api.ranks).not.toHaveBeenCalled();
});

it("clears the previous answer when an admin restarts at question zero", () => {
  api.state = active("short"); const view = render(<NadawiContest language="en" adminTest />);
  fireEvent.change(screen.getByLabelText("Type one word"), { target: { value: "oldanswer" } });
  api.state = { ...active("short"), attempt_id: "new-preview" };
  view.rerender(<NadawiContest language="en" adminTest />);
  expect(screen.getByLabelText("Type one word")).toHaveValue("");
});
