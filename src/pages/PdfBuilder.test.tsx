import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PdfBuilder from "./PdfBuilder";
import type { BankLoadResult } from "@/features/pdf-builder/loadBank";
import type { PdfQuestion, PdfSettings } from "@/features/pdf-builder/model";

const mocks = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("@/features/pdf-builder/loadBank", () => ({ loadPdfBank: mocks.load }));
vi.mock("@/features/pdf-builder/BookletPreview", () => ({ default: ({ questions, settings }: { questions: PdfQuestion[]; settings: PdfSettings }) => <output data-testid="rendered-booklet">{JSON.stringify({ questions, settings })}</output> }));
const bank: BankLoadResult = { warnings: [], questions: [
  { id: "m", kind: "ministerial", origin: "ministerial", question: "Ministerial prompt", answer: "Ministerial answer", source: "ministerial" },
  { id: "r", kind: "review", origin: "review", question: "Review prompt", answer: "Review answer", source: "cards" },
  { id: "c", kind: "mcq", origin: "review", question: "Choice prompt", answer: "Correct choice", choices: ["Correct choice", "Other choice"], answerIndex: 0, source: "mcq" },
] };
beforeEach(() => { mocks.load.mockReset().mockResolvedValue(bank); });
afterEach(cleanup);
const rendered = () => JSON.parse(screen.getByTestId("rendered-booklet").textContent!) as { questions: PdfQuestion[]; settings: PdfSettings };

describe("PDF builder", () => {
  it("previews the four designs using the chosen questions, title and answer placement", async () => {
    render(<PdfBuilder language="en" onBack={vi.fn()} />);
    const button = await screen.findByRole("button", { name: "Preview my PDF · 3" });
    fireEvent.click(button);
    for (const [name, id] of [["Exam paper", "exam"], ["Compact revision", "compact"], ["Tamayzak signature", "tamayzak"], ["Revision booklet", "revision"]]) {
      fireEvent.click(screen.getByRole("button", { name, exact: true }));
      expect(rendered().settings.template).toBe(id);
      expect(screen.getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "true");
    }
    fireEvent.change(screen.getByLabelText("Booklet title"), { target: { value: "My final revision" } });
    fireEvent.change(screen.getByLabelText("Answer placement"), { target: { value: "none" } });
    expect(rendered().settings).toMatchObject({ title: "My final revision", answers: "none" });
    expect(rendered().questions.map(q => q.id)).toEqual(["m", "r", "c"]);
  });
  it("removes excluded source questions and rejects an excessive requested count", async () => {
    render(<PdfBuilder language="en" onBack={vi.fn()} />);
    await screen.findByRole("button", { name: "Preview my PDF · 3" });
    fireEvent.click(screen.getByLabelText("Ministerial questions", { selector: "input" }));
    fireEvent.click(screen.getByRole("button", { name: "Preview my PDF · 2" }));
    expect(rendered().questions.map(q => q.id)).toEqual(["r", "c"]);
    fireEvent.change(screen.getByLabelText("Non-ministerial review quantity"), { target: { value: "number" } });
    fireEvent.change(screen.getByLabelText("Non-ministerial review question count"), { target: { value: "10" } });
    expect(screen.getByText("Choose a number within each section’s available count.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preview my PDF" })).toBeDisabled();
  });
  it("does not let a slow response overwrite a new chapter", async () => {
    let resolveOld!: (result: BankLoadResult) => void;
    mocks.load.mockImplementationOnce(() => new Promise<BankLoadResult>(resolve => { resolveOld = resolve; })).mockResolvedValueOnce({ ...bank, questions: [bank.questions[1]] });
    render(<PdfBuilder language="en" onBack={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Chapter / topic"), { target: { value: "2" } });
    await screen.findByRole("button", { name: "Preview my PDF · 1" });
    resolveOld(bank);
    await waitFor(() => expect(screen.queryByRole("button", { name: "Preview my PDF · 3" })).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Preview my PDF · 1" }));
    expect(rendered().questions.map(q => q.id)).toEqual(["r"]);
    expect(rendered().settings.subtitle).toContain("Electromagnetic Induction");
  });
  it("blocks the preview on correction-load failures and supports retry", async () => {
    mocks.load.mockRejectedValueOnce(new Error("corrections unavailable"));
    render(<PdfBuilder language="en" onBack={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load the bank and its corrections");
    expect(screen.getByRole("button", { name: "Preview my PDF" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Reload banks" }));
    expect(await screen.findByRole("button", { name: "Preview my PDF · 3" })).toBeEnabled();
  });
});
