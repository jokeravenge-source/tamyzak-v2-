import { expect, it } from "vitest";
import { NADAWI_QUESTIONS, NADAWI_WRITING, nadawiCorrect } from "./nadawiContestUnit2";
it("covers every supplied subquestion rather than dropping the exam's optional extras", () => {
  const expected = [
    ...Array.from({ length: 6 }, (_, i) => `Q1.${i + 1}`),
    ...Array.from({ length: 12 }, (_, i) => `Q2A.${i + 1}`),
    ...Array.from({ length: 6 }, (_, i) => `Q2B.${i + 1}`),
    ...Array.from({ length: 5 }, (_, i) => `Q3A.${i + 1}`),
    ...Array.from({ length: 6 }, (_, i) => `Q3B.${i + 1}`),
    ...Array.from({ length: 6 }, (_, i) => `Q3C.${i + 1}`),
  ];
  expect(NADAWI_QUESTIONS.map((q) => q.source)).toEqual(expected);
  expect(NADAWI_QUESTIONS.filter((q) => q.kind === "mcq")).toHaveLength(24);
  expect(NADAWI_QUESTIONS.filter((q) => q.kind === "short")).toHaveLength(17);
  expect(NADAWI_WRITING.id).toBe("Q4"); expect(NADAWI_WRITING.minWords).toBe(100); expect(NADAWI_WRITING.maxWords).toBe(120);
  for (const q of NADAWI_QUESTIONS) {
    expect(q.original.trim()).not.toBe("");
    if (q.kind === "mcq") {
      expect(new Set(q.choices).size).toBe(q.choices.length);
      expect(q.choices[q.correct]).toBeTruthy();
      expect(nadawiCorrect(q, q.correct)).toBe(true);
      expect(nadawiCorrect(q, (q.correct + 1) % q.choices.length)).toBe(false);
    } else {
      expect(q.answers.every((answer) => answer.trim().split(/\s+/).length <= (q.maxWords ?? 1))).toBe(true);
      expect(nadawiCorrect(q, q.answers[0].toUpperCase())).toBe(true);
    }
  }
});
it("keeps compound answers meaningful by providing the other words in the prompt", () => {
  for (const [id, required, answer] of [["Q3A.3", "special", "powder"], ["Q3B.1", "get ___ of", "rid"], ["Q3B.6", "___ belt", "conveyor"], ["Q3C.5", "driving ___", "licence"]]) {
    const q = NADAWI_QUESTIONS.find((q) => q.id === id)!;
    expect(q.prompt).toContain(required); expect(nadawiCorrect(q, answer)).toBe(true);
  }
});
it("tolerates case and final punctuation but rejects misspellings and multiple words", () => {
  const abbreviation = NADAWI_QUESTIONS.find((q) => q.id === "Q3C.1")!;
  expect(nadawiCorrect(abbreviation, "  FREQ.  ")).toBe(true);
  expect(nadawiCorrect(abbreviation, "frequent")).toBe(false);
  const teacher = NADAWI_QUESTIONS.find((q) => q.id === "Q3C.2")!;
  expect(nadawiCorrect(teacher, "Teacher")).toBe(true);
  expect(nadawiCorrect(teacher, "techer")).toBe(false);
  expect(nadawiCorrect(teacher, "a teacher")).toBe(false);
  const statement = NADAWI_QUESTIONS.find((q) => q.id === "Q1.5")!;
  if (statement.kind === "mcq") expect(statement.choices[statement.correct]).toBe("False");
});

it("accepts ticket or the full speeding ticket phrase, but not fine", () => {
  const question = NADAWI_QUESTIONS.find((q) => q.id === "Q3C.6")!;
  expect(nadawiCorrect(question, "Ticket")).toBe(true);
  expect(nadawiCorrect(question, " SPEEDING   TICKET. ")).toBe(true);
  expect(nadawiCorrect(question, "fine")).toBe(false);
});

it("accepts both requested alternatives for called", () => {
  const question = NADAWI_QUESTIONS.find((q) => q.id === "Q3C.4")!;
  expect(nadawiCorrect(question, "named")).toBe(true);
  expect(nadawiCorrect(question, "Alerted.")).toBe(true);
});
