import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import PodcastPractice from "./PodcastPractice";
const api = vi.hoisted(() => ({ load: vi.fn(), topics: vi.fn() }));
vi.mock("@/lib/podcastPractice", () => ({ loadPodcastPractice: api.load }));
vi.mock("@/lib/podcastTopics", () => ({ loadPodcastTopics: api.topics }));
beforeEach(() => {
  vi.clearAllMocks();
  api.topics.mockResolvedValue([{ ar: "الحث", en: "Induction" }]);
});

it("does not load questions without consent and allows opting out", () => {
  const view = render(
    <PodcastPractice sessionId="lesson-session" subject="الفيزياء" onSpeak={vi.fn()} />,
  );
  expect(api.load).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "مو هسه" }));
  expect(
    screen.queryByRole("button", { name: "ابدأ التدريب" }),
  ).not.toBeInTheDocument();
  expect(api.load).not.toHaveBeenCalled();
  expect(api.topics).not.toHaveBeenCalled();
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
  render(<PodcastPractice sessionId="lesson-session" subject="الفيزياء" onSpeak={speak} />);
  fireEvent.click(screen.getByRole("button", { name: "اختيار من متعدد MCQ" }));
  expect(api.load).not.toHaveBeenCalled();
  await screen.findByRole("option", { name: "الحث · Induction" });
  fireEvent.click(screen.getByRole("button", { name: "ابدأ التدريب" }));
  await screen.findByText("سؤال الحث");
  expect(api.load).toHaveBeenCalledWith(
    "physics",
    ["الحث", "Induction"],
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

it("searches an extracted concept in English and never uses a PDF filename", async () => {
  api.topics.mockResolvedValue([{ ar: "الانشطار الثنائي", en: "Binary fission" }, { ar: "التبرعم", en: "Budding" }]);
  api.load.mockResolvedValue({ questions: [], partial: false });
  render(<PodcastPractice sessionId="old-pdf-session" subject="biology" onSpeak={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "وزاريات" }));
  await screen.findByRole("option", { name: "الانشطار الثنائي · Binary fission" });
  expect(screen.getByRole("textbox")).toHaveValue("الانشطار الثنائي");
  fireEvent.change(screen.getByRole("combobox", { name: "لغة الأسئلة" }), { target: { value: "en" } });
  fireEvent.change(screen.getByRole("combobox", { name: "مفاهيم مستخرجة من الدرس" }), { target: { value: "التبرعم" } });
  fireEvent.click(screen.getByRole("button", { name: "ابدأ التدريب" }));
  await screen.findByText(/ما لكينا أسئلة مطابقة لهذا المفهوم/);
  expect(api.load).toHaveBeenCalledWith("biology", ["التبرعم", "Budding"], "en", "ministerial", expect.any(AbortSignal));
  expect(api.topics).toHaveBeenCalledTimes(1);
});

it("resolves a manually entered concept before searching banks", async () => {
  api.load.mockResolvedValue({ questions: [], partial: false });
  render(<PodcastPractice sessionId="lesson-session" subject="biology" onSpeak={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "وزاريات" }));
  await screen.findByRole("option", { name: "الحث · Induction" });
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "الانشطار الثنائي" } });
  api.topics.mockResolvedValue([{ ar: "الانشطار الثنائي", en: "Binary fission" }]);
  fireEvent.click(screen.getByRole("button", { name: "ابدأ التدريب" }));
  await screen.findByText(/ما لكينا أسئلة مطابقة لهذا المفهوم/);
  expect(api.topics).toHaveBeenLastCalledWith("lesson-session", expect.any(AbortSignal), "الانشطار الثنائي");
  expect(api.load).toHaveBeenLastCalledWith("biology", ["الانشطار الثنائي", "Binary fission"], "ar", "ministerial", expect.any(AbortSignal));
});

it("leaves the topic empty on extraction failure and lets the user retry", async () => {
  api.topics.mockRejectedValueOnce(new Error("Unavailable"));
  render(<PodcastPractice sessionId="old-pdf-session" subject="biology" onSpeak={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "وزاريات" }));
  fireEvent.click(await screen.findByRole("button", { name: "إعادة تحديد المفاهيم" }));
  expect(screen.getByRole("textbox")).toHaveValue("");
  await screen.findByRole("option", { name: "الحث · Induction" });
  expect(api.topics).toHaveBeenCalledTimes(2);
});
