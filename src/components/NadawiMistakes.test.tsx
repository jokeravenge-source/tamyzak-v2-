import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import NadawiMistakes from "./NadawiMistakes";
const api = vi.hoisted(() => ({ mistakes: vi.fn() }));
vi.mock("@/lib/nadawiContestApi", () => ({ getNadawiMistakes: api.mistakes }));
beforeEach(() => api.mistakes.mockReset());
afterEach(cleanup);
const open = () => fireEvent.click(screen.getByText("Review my mistakes"));

it("loads on demand and shows the student's wrong answer, correction and timeout", async () => {
  api.mistakes.mockResolvedValue([
    { question_number: 3, prompt: "Fill in the gap", word_bank: ["arrest", "base"], user_answer: "wrong", correct_answers: ["arrest"], timed_out: false },
    { question_number: 7, prompt: "Choose a word", word_bank: [], user_answer: null, correct_answers: ["correct choice"], timed_out: true },
  ]);
  render(<NadawiMistakes language="en" />);
  expect(api.mistakes).not.toHaveBeenCalled();
  open();
  expect(await screen.findByText("correct choice")).toBeInTheDocument();
  expect(screen.getByText("wrong")).toBeInTheDocument();
  expect(screen.getByText("arrest")).toBeInTheDocument();
  expect(screen.getByText("Question 7 · Timed out")).toBeInTheDocument();
  expect(screen.getByText("No answer")).toBeInTheDocument();
  expect(api.mistakes).toHaveBeenCalledWith(false);
});

it("shows a perfect result for an admin's separate test", async () => {
  api.mistakes.mockResolvedValue([]);
  render(<NadawiMistakes language="en" adminTest />);
  open();
  expect(await screen.findByText(/All your answers are correct/)).toBeInTheDocument();
  expect(api.mistakes).toHaveBeenCalledWith(true);
});

it("lets the student retry without changing their competition attempt", async () => {
  api.mistakes.mockRejectedValueOnce(new Error("offline")).mockResolvedValue([]);
  render(<NadawiMistakes language="en" />);
  open();
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not load");
  fireEvent.click(screen.getByRole("button", { name: "Retry mistakes" }));
  expect(await screen.findByText(/No mistakes to review/)).toBeInTheDocument();
});
