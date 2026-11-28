import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import MyMistakes from "./MyMistakes";
import type { Mistake } from "@/lib/mistakes";

const test = vi.hoisted(() => ({ fetchAll: vi.fn(), fetchCards: vi.fn(), opened: vi.fn(), lift: vi.fn() }));
vi.mock("@/lib/mistakes", () => ({ fetchAllMistakes: test.fetchAll, recordMistake: vi.fn(), resolveMistake: vi.fn() }));
vi.mock("@/lib/srs", () => ({ fetchDueFlashcards: test.fetchCards, cardKey: vi.fn(), loadDeckStates: vi.fn(), rateCard: vi.fn() }));
vi.mock("@/lib/topicMastery", () => ({ recordTopicPractice: vi.fn() }));
vi.mock("@/components/MistakesPunishment", () => ({ markMistakesOpened: test.opened, liftMistakesPunishment: test.lift }));

const due: Mistake = {
  id: "mistake-1", source: "mcq_bank", subject: "physics", chapter: "2", language: "en",
  question: "A due question about induction", choices: ["A", "B"], correct_answer: "B",
  user_answer: "A", explanation: null, times_wrong: 1, times_redone: 0, resolved: false,
  next_review_at: "2000-01-01T00:00:00Z",
};

beforeEach(() => {
  test.fetchAll.mockReset().mockResolvedValue([due]);
  test.fetchCards.mockReset().mockResolvedValue([]);
  test.opened.mockClear();
  test.lift.mockClear();
});

it("starts the selected subject’s ready review without a second entry tap", async () => {
  const onBack = vi.fn();
  render(<MyMistakes language="en" onBack={onBack} subject="physics" startReview />);
  expect(await screen.findByRole("heading", { name: due.question })).toBeInTheDocument();
  expect(test.fetchAll).toHaveBeenCalledWith("physics");
  expect(test.fetchCards).toHaveBeenCalledWith(20, "physics");
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(await screen.findByRole("button", { name: /Review your mistakes/ })).toBeVisible();
  expect(onBack).not.toHaveBeenCalled();
});

it("does not lift a global review reminder just because one subject has no due tasks", async () => {
  test.fetchAll.mockResolvedValue([]);
  render(<MyMistakes language="ar" onBack={vi.fn()} subject="chemistry" startReview />);
  expect(await screen.findByRole("heading", { name: /أخطائي.*الكيمياء/ })).toBeVisible();
  expect(screen.getByRole("main")).toHaveAttribute("dir", "rtl");
  expect(test.lift).not.toHaveBeenCalled();
});


it("starts a retry from Daily Report even when a saved miss is scheduled for later", async () => {
  test.fetchAll.mockResolvedValue([{ ...due, next_review_at: "2999-01-01T00:00:00Z" }]);
  render(<MyMistakes language="en" onBack={vi.fn()} startReview />);
  expect(await screen.findByRole("heading", { name: due.question })).toBeInTheDocument();
  expect(test.fetchAll).toHaveBeenCalledWith();
});
