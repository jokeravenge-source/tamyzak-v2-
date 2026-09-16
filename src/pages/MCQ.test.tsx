import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MCQ from "@/pages/MCQ";

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), mistake: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: mocks.invoke } } }));
vi.mock("@/hooks/useFeatureUsed", () => ({ useFeatureUsed: vi.fn() }));
vi.mock("@/components/PointsHint", () => ({ default: () => null }));
vi.mock("@/lib/points", () => ({ awardPoints: vi.fn() }));
vi.mock("@/lib/unlocks", () => ({ awardAction: vi.fn() }));
vi.mock("@/lib/mistakes", () => ({ recordMistake: mocks.mistake }));
vi.mock("@/lib/fileText", () => ({ materializeFile: async (f: File) => f, extractStudyMaterial: async () => ({ text: "Source material ".repeat(20) }) }));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} }); });
const question = (chapter: number | null, name = "Sample question") => ({ question: name, chapter, choices: ["Answer A", "Answer B", "Answer C", "Answer D"], answer_index: 0, explanation: "Source explanation" });
async function upload() {
  fireEvent.change(document.querySelector('input[type="file"]')!, { target: { files: [new File(["Study material"], "lesson.txt", { type: "text/plain" })] } });
  await screen.findByText("lesson.txt");
}

describe("MCQ generator chapter organization", () => {
  it("requires a subject and uses the same chapter names as flashcards", async () => {
    render(<MCQ language="en" onBack={vi.fn()} />);
    await upload();
    expect(screen.getByRole("button", { name: "Generate Questions" })).toBeDisabled();
    fireEvent.change(screen.getByRole("combobox", { name: "Subject" }), { target: { value: "physics" } });
    const chapters = screen.getByRole("combobox", { name: "Chapter" });
    expect(within(chapters).getByRole("option", { name: "1 · Capacitors" })).toBeInTheDocument();
    expect(within(chapters).getAllByRole("option")).toHaveLength(9);
    expect(screen.getByRole("button", { name: "Generate Questions" })).toBeEnabled();
  });
  it("resets chapter selection when switching subjects and supports English sections", () => {
    render(<MCQ language="en" onBack={vi.fn()} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Subject" }), { target: { value: "physics" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Chapter" }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Subject" }), { target: { value: "english" } });
    expect(screen.getByRole("combobox", { name: "Chapter" })).toHaveValue("all");
    fireEvent.change(screen.getByRole("combobox", { name: "Section" }), { target: { value: "paragraphs" } });
    expect(screen.getByRole("option", { name: "1 · Paragraphs" })).toBeInTheDocument();
  });
  it("groups a mixed quiz by chapter, preserves unknown questions, and saves classified mistakes", async () => {
    mocks.invoke.mockResolvedValue({ data: { questions: [question(1, "Capacitor question"), question(2, "Induction question"), question(99, "Unknown question")] }, error: null });
    render(<MCQ language="en" onBack={vi.fn()} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Subject" }), { target: { value: "physics" } });
    await upload();
    fireEvent.click(screen.getByRole("button", { name: "Generate Questions" }));
    await screen.findByRole("heading", { name: "Choose a chapter to practise" });
    expect(mocks.invoke.mock.calls[0][1].body.curriculum.chapters).toHaveLength(8);
    expect(screen.getByRole("button", { name: /Unclassified.*1 questions/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Capacitors.*1 questions/ }));
    expect(screen.getByRole("heading", { name: "Capacitor question" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Induction question" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Answer B" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(mocks.mistake).toHaveBeenCalledWith(expect.objectContaining({ subject: "physics", chapter: "1", question: "Capacitor question" }));
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    fireEvent.click(screen.getByRole("button", { name: "Choose another chapter from this quiz" }));
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /Unclassified.*1 questions/ }));
    expect(screen.getByRole("heading", { name: "Unknown question" })).toBeInTheDocument();
  });
  it("passes selected chapter context and supports older endpoint responses", async () => {
    const oldQuestion = question(null); delete (oldQuestion as { chapter?: number | null }).chapter;
    mocks.invoke.mockResolvedValue({ data: { questions: [oldQuestion] }, error: null });
    render(<MCQ language="en" onBack={vi.fn()} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Subject" }), { target: { value: "physics" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Chapter" }), { target: { value: "1" } });
    await upload();
    fireEvent.click(screen.getByRole("button", { name: "Generate Questions" }));
    await screen.findByRole("heading", { name: "Sample question" });
    expect(mocks.invoke.mock.calls[0][1].body.curriculum.chapter).toBe(1);
    expect(screen.getByText("Capacitors")).toBeInTheDocument();
  });
  it("uses RTL Arabic and Arabic flashcard chapter numbers", () => {
    render(<MCQ language="ar" onBack={vi.fn()} />);
    expect(screen.getByRole("main")).toHaveAttribute("dir", "rtl");
    fireEvent.change(screen.getByRole("combobox", { name: "المادة" }), { target: { value: "arabic" } });
    expect(screen.getByRole("option", { name: "6 · الاستفهام" })).toBeInTheDocument();
  });
});
