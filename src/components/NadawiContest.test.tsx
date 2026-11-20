import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import NadawiContest from "./NadawiContest";
import { NADAWI_QUESTIONS, newNadawiAttempt, type NadawiAttempt } from "@/data/nadawiContestUnit2";
afterEach(cleanup);
function View({ initial = newNadawiAttempt() }: { initial?: NadawiAttempt }) {
  const [attempt, setAttempt] = useState(initial);
  return <NadawiContest language="en" attempt={attempt} setAttempt={setAttempt} />;
}
it("requires one typed word rather than offering multiple-choice buttons for vocabulary", () => {
  render(<View initial={{ ...newNadawiAttempt(), started: true, index: 24 }} />);
  const input = screen.getByLabelText("Type one word");
  fireEvent.change(input, { target: { value: "will arrest" } });
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  expect(screen.queryByRole("button", { name: "arrest" })).not.toBeInTheDocument();
  fireEvent.change(input, { target: { value: "arrest" } });
  expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  expect(screen.queryByText(/Correct answer/)).not.toBeInTheDocument();
});
it("lets students complete every automatic question and keeps the full letter outside its score", () => {
  render(<View />);
  fireEvent.click(screen.getByRole("button", { name: "Start challenge" }));
  for (let i = 0; i < NADAWI_QUESTIONS.length; i++) {
    const q = NADAWI_QUESTIONS[i];
    if (q.kind === "mcq") fireEvent.click(screen.getByRole("button", { name: q.choices[q.correct] }));
    else fireEvent.change(screen.getByLabelText("Type one word"), { target: { value: q.answers[0] } });
    fireEvent.click(screen.getByRole("button", { name: i === 40 ? "Continue to letter" : "Next" }));
  }
  expect(screen.getByRole("heading", { name: /Write a letter to your friend/ })).toBeInTheDocument();
  expect(screen.getByText(/does not count towards the automatic score/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Finish and show result" }));
  expect(screen.getByText("41 / 41")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Q4 · Letter — manual marking" })).toBeInTheDocument();
});
