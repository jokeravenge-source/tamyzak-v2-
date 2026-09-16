import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import McqBank from "@/pages/McqBank";

const mocks = vi.hoisted(() => ({ rows: [] as { id: string; subject: string; chapter: number; chapter_title: string | null; question: string; choices: string[]; answer_index: number; explanation: null }[], rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  from: () => {
    const chain = { select: () => chain, eq: () => chain, order: () => chain, limit: async () => ({ data: mocks.rows }) };
    return chain;
  }, rpc: mocks.rpc,
} }));
vi.mock("@/lib/physicsChapter2Mcqs", () => ({ getBuiltInPhysicsCh2: () => [] }));
vi.mock("@/lib/englishLiteratureSection1Mcqs", () => ({ getBuiltInEnglishLiteratureSection1: () => [] }));
vi.mock("@/lib/englishLiteratureSection2Mcqs", () => ({ getBuiltInEnglishLiteratureSection2: () => [] }));
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));
vi.mock("@/lib/points", () => ({ awardPoints: vi.fn(), showAward: vi.fn() }));
vi.mock("@/lib/mistakes", () => ({ recordMistake: vi.fn() }));
afterEach(cleanup);
beforeEach(() => { mocks.rpc.mockResolvedValue({ data: [], error: null }); mocks.rows = []; });
function row(subject: string, chapter: number, chapter_title: string | null) {
  return { id: `${subject}-${chapter}`, subject, chapter, chapter_title, question: `Question for ${subject} ${chapter}`, choices: ["A", "B", "C", "D"], answer_index: 0, explanation: null };
}

describe("MCQ bank flashcard divisions", () => {
  it("shows matching chapter titles, disables empty chapters, and opens only that chapter", async () => {
    mocks.rows = [row("physics", 1, "Capacitors"), row("physics", 2, "Electromagnetic Induction")];
    render(<McqBank language="en" onBack={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: /Physics/ }));
    expect(screen.getByRole("button", { name: /Alternating Current/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Capacitors/ }));
    expect(screen.getByRole("heading", { name: "Physics · Capacitors" })).toBeInTheDocument();
    expect(screen.getByText("Question for physics 1")).toBeInTheDocument();
    expect(screen.queryByText("Question for physics 2")).not.toBeInTheDocument();
  });
  it("keeps unclassified bank questions accessible without assigning a guessed chapter", async () => {
    mocks.rows = [row("physics", 99, "Unknown")];
    render(<McqBank language="en" onBack={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: /Physics/ }));
    fireEvent.click(screen.getByRole("button", { name: /Unclassified/ }));
    expect(screen.getByText("Question for physics 99")).toBeInTheDocument();
  });
  it("uses Arabic titles and retains the existing Arabic MCQ access lock", async () => {
    mocks.rows = [row("physics", 1, "Capacitors"), row("arabic", 2, "Istifham")];
    render(<McqBank language="ar" onBack={vi.fn()} />);
    expect(await screen.findByRole("button", { name: "العربية — مغلق" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /الفيزياء/ }));
    expect(screen.getByRole("main")).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("button", { name: /المتسعات/ })).toBeEnabled();
  });
  it("preserves the existing English literature section navigation", async () => {
    mocks.rows = [row("english_literature", 2, "Section 2")];
    render(<McqBank language="en" onBack={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: /English Literature/ }));
    fireEvent.click(screen.getByRole("button", { name: /Section 2/ }));
    expect(screen.getByText("Question for english_literature 2")).toBeInTheDocument();
  });
});
