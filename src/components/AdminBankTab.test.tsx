import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminBankTab from "@/components/AdminBankTab";

const mocks = vi.hoisted(() => ({ update: vi.fn(), insert: vi.fn(), toast: vi.fn(), eq: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ toast: mocks.toast }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: (table: string) => {
  const result = { data: table === "mcq_banks" ? [{ id: "existing-mcq", subject: "chemistry", chapter: 1, chapter_title: "Thermodynamics", section: null, language: "ar", question: "Existing question", choices: ["A", "B", "C", "D"], answer_index: 1, explanation: "Explanation", difficulty: "medium", source: "seed" }] : [], count: table === "mcq_banks" ? 1 : 0, error: null };
  const chain = {
    select: () => chain,
    eq: (...args: unknown[]) => { mocks.eq(...args); return chain; },
    order: () => chain,
    range: async () => result,
    then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
    update: (payload: unknown) => { mocks.update(payload); return chain; },
    insert: (payload: unknown) => { mocks.insert(payload); return chain; },
  };
  return chain;
} } }));
afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("admin MCQ chapter assignment", () => {
  it("requires a shared flashcard chapter for new bank questions", async () => {
    render(<AdminBankTab />);
    fireEvent.click(screen.getByRole("button", { name: "MCQ bank" }));
    await screen.findByRole("combobox", { name: "Flashcard chapter" });
    fireEvent.click(screen.getByRole("button", { name: "Add question" }));
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Choose a flashcard chapter first" }));
    expect(within(screen.getByRole("combobox", { name: "Flashcard chapter" })).getByRole("option", { name: "2 · الفصل الثاني" })).toBeInTheDocument();
  });
  it("assigns only chapter metadata to the exact existing question", async () => {
    render(<AdminBankTab />);
    fireEvent.click(screen.getByRole("button", { name: "MCQ bank" }));
    const select = await screen.findByRole("combobox", { name: "Assign chapter for existing-mcq" });
    fireEvent.change(select, { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Assign chapter" }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({ chapter: 2, chapter_title: "الفصل الثاني" }));
    expect(mocks.eq).toHaveBeenCalledWith("id", "existing-mcq");
    expect(mocks.toast).toHaveBeenCalledWith({ title: "Flashcard chapter assigned" });
  });
});
