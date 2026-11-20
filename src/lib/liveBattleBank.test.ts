import { expect, it } from "vitest";
import { selectBattleQuestions } from "./liveBattleBank";
import type { RaceQuestion } from "./raceQuestionBank";
const bank: RaceQuestion[] = Array.from({ length: 12 }, (_, i) => ({ id: `bank-${i}`, subject: i < 8 ? "biology" : "physics", chapter: i % 2 + 1, question: `Bank question ${i}`, choices: [`A-${i}`, `B-${i}`, `C-${i}`], answer_index: i % 3, explanation: `Source explanation ${i}` }));
it("uses the original choices, answer and explanation from the selected subject/chapter", () => {
  const result = selectBattleQuestions(bank, "biology", 2, 10, 99);
  expect(result).toHaveLength(4);
  for (const question of result) {
    const source = bank.find((q) => q.id === question.id)!;
    expect(source.subject).toBe("biology"); expect(source.chapter).toBe(2);
    expect(question.choices).toEqual(source.choices);
    expect(question.answer).toBe(source.answer_index);
    expect(question.explanation).toBe(source.explanation);
  }
});
it("does not substitute another subject or chapter when the selection is empty", () => {
  expect(selectBattleQuestions(bank, "chemistry", 1, 10, 99)).toEqual([]);
  expect(selectBattleQuestions(bank, "biology", 7, 10, 99)).toEqual([]);
});
it("makes a reproducible selection without mutating the bank and limits the round to available questions", () => {
  const snapshot = structuredClone(bank);
  const first = selectBattleQuestions(bank, "biology", 0, 5, 123);
  expect(first).toEqual(selectBattleQuestions([...bank], "biology", 0, 5, 123));
  expect(first).toHaveLength(5);
  first[0].choices[0] = "changed locally";
  expect(bank).toEqual(snapshot);
});
