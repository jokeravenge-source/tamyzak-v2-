import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import PodcastPractice from "./PodcastPractice";
const api = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("@/lib/podcastPractice", () => ({ loadPodcastPractice: api.load }));
beforeEach(() => vi.clearAllMocks());

it("does not load questions without consent and allows opting out", () => {
  const view = render(
    <PodcastPractice title="الحث" subject="الفيزياء" onSpeak={vi.fn()} />,
  );
  expect(api.load).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "مو هسه" }));
  expect(
    screen.queryByRole("button", { name: "ابدأ التدريب" }),
  ).not.toBeInTheDocument();
  expect(api.load).not.toHaveBeenCalled();
  view.unmount();
});

it("loads the selected type on demand and reveals feedback after an answer", async () => {
  api.load.mockResolvedValue({
    questions: [
      {
        id: "one",
        kind: "mcq",
        question: "سؤال الحث",
        answer: "صح",
        choices: ["صح", "خطأ"],
        answerIndex: 0,
      },
    ],
    partial: false,
  });
  const speak = vi.fn();
  render(<PodcastPractice title="الحث" subject="الفيزياء" onSpeak={speak} />);
  fireEvent.click(screen.getByRole("button", { name: "اختيار من متعدد MCQ" }));
  expect(api.load).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "ابدأ التدريب" }));
  await screen.findByText("سؤال الحث");
  expect(api.load).toHaveBeenCalledWith(
    "physics",
    "الحث",
    "ar",
    "mcq",
    expect.any(AbortSignal),
  );
  fireEvent.click(screen.getByRole("button", { name: "صح" }));
  fireEvent.click(screen.getByRole("button", { name: "شوف الإجابة والتفسير" }));
  expect(screen.getByText("عاشت إيدك، صحيح!")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "اسمع السؤال" }));
  expect(speak).toHaveBeenCalledWith("سؤال الحث");
});
