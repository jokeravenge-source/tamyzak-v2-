import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Teachers, { NadiaLectureWorkspace, PracticeModal } from "./Teachers";

const api = vi.hoisted(() => ({ rows: [] as Array<Record<string, unknown>>, write: vi.fn(), error: vi.fn() }));
vi.mock("@/lib/fileText", () => ({ extractStudyMaterial: vi.fn() }));
vi.mock("@/components/TeacherLectureVideos", () => ({ default: () => <div>Lecture notes</div> }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: api.error } }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: null } }) },
  from: (table: string) => {
    const filters: Record<string, string> = {};
    let action = "read", patch: unknown;
    const query = {
      select: () => query,
      eq: (column: string, value: string) => {
        filters[column] = value;
        return action === "read" ? query : api.write(action, patch, filters);
      },
      order: async () => ({ data: table === "teacher_topic_mcqs"
        ? api.rows.filter(row => Object.entries(filters).every(([key, value]) => row[key] === value)) : [], error: null }),
      maybeSingle: async () => ({ data: { video_id: "abcdefghijk" }, error: null }),
      update: (value: unknown) => { action = "update"; patch = value; return query; },
      delete: () => { action = "delete"; return query; },
    };
    return query;
  },
} }));

const questions = [1, 2, 3].map(n => ({ question: `Question ${n}`, choices: [`${n} A`, `${n} B`, `${n} C`, `${n} D`], answer_index: 0, explanation: `Explanation ${n}` }));
const set = { id: "anzi-practice", teacher_id: "mohammed-anzi", topic_key: "anzi-ar-ch3-lec1-exam", title: "Biology practice", questions, created_at: "2026-11-15T00:00:00Z" };
beforeEach(() => {
  vi.clearAllMocks(); api.rows = []; api.write.mockResolvedValue({ error: null });
  window.history.replaceState({}, "", "/teachers");
});
afterEach(() => vi.restoreAllMocks());
const click = async (name: string) => { await act(async () => fireEvent.click(screen.getByRole("button", { name }))); };

describe("teacher MCQ navigation", () => {
  it.each([['ar', 'التالي', 'السابق', 'إنهاء'], ['en', 'Next', 'Previous', 'Finish']] as const)(
    "allows %s students to move both ways without answering first", async (language, next, previous, finish) => {
      render(<PracticeModal set={set} language={language} onClose={() => {}} />);
      expect(screen.getByRole("button", { name: previous })).toBeDisabled();
      expect(screen.getByRole("button", { name: next })).toBeEnabled();
      await click(next); expect(screen.getByRole("heading", { name: "Question 2" })).toBeInTheDocument();
      await click(previous); expect(screen.getByRole("heading", { name: "Question 1" })).toBeInTheDocument();
      await click(next); await click(next);
      expect(screen.getByRole("heading", { name: "Question 3" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: finish })).toBeEnabled();
    },
  );

  it("preserves a selected choice and a revealed explanation when returning to a question", async () => {
    render(<PracticeModal set={set} language="en" onClose={() => {}} />);
    await click("1 B"); await click("Next"); await click("Previous");
    expect(screen.getByRole("button", { name: "1 B" })).toHaveAttribute("aria-pressed", "true");
    await click("Show answer"); expect(screen.getByText("Explanation 1")).toBeInTheDocument();
    await click("Next"); await click("Previous");
    expect(screen.getByRole("button", { name: "1 B" })).toBeDisabled();
    expect(screen.getByText("Explanation 1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Show answer" })).not.toBeInTheDocument();
  });

  it("counts each answer once across backward navigation and result review", async () => {
    render(<PracticeModal set={{ ...set, questions: questions.slice(0, 2) }} language="en" onClose={() => {}} />);
    await click("1 A"); await click("Show answer"); await click("Next"); await click("Previous");
    await click("Next"); await click("2 B"); await click("Show answer"); await click("Finish");
    expect(screen.getByText("1 / 2", { selector: "p.text-4xl" })).toBeInTheDocument();
    await click("Review questions"); await click("Previous"); await click("Next"); await click("Finish");
    expect(screen.getByText("1 / 2", { selector: "p.text-4xl" })).toBeInTheDocument();
  });

  it("portals out of the animated teacher container and starts each question at the top", async () => {
    const view = render(<div style={{ transform: "translateY(0)" }}><PracticeModal set={set} language="en" onClose={() => {}} /></div>);
    expect(view.container.querySelector('[role="dialog"]')).toBeNull();
    const content = screen.getByRole("region", { name: "Question content" });
    content.scrollTop = 300; await click("Next");
    expect(content.scrollTop).toBe(0);
    expect(screen.getByRole("navigation", { name: "Question navigation" })).toBeInTheDocument();
  });

  it("keeps answers aligned and removes a deleted question from the score", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    const updated = vi.fn();
    render(<PracticeModal set={set} language="en" isAdmin onClose={() => {}} onSetUpdated={updated} />);
    await click("1 A"); await click("Show answer"); await click("Next");
    await click("2 B"); await click("Show answer"); await click("Previous"); await click("Delete question");
    expect(screen.getByRole("heading", { name: "Question 2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2 B" })).toBeDisabled();
    expect(updated).toHaveBeenCalledWith(expect.objectContaining({ questions: questions.slice(1) }));
    await click("Next"); await click("Finish");
    expect(screen.getByText("0 / 2", { selector: "p.text-4xl" })).toBeInTheDocument();
  });

  it("retains the current question and enables navigation again after deletion fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    api.write.mockResolvedValueOnce({ error: { message: "Could not delete" } });
    render(<PracticeModal set={set} language="en" isAdmin onClose={() => {}} />);
    await click("Delete question");
    expect(screen.getByRole("heading", { name: "Question 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    expect(api.error).toHaveBeenCalledWith("Could not delete");
  });

  it("handles an empty set and closes with Escape", async () => {
    const close = vi.fn();
    render(<PracticeModal set={{ ...set, questions: [] }} language="en" onClose={close} />);
    expect(screen.getByText("No questions in this set.")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(close).toHaveBeenCalledOnce();
  });
});

describe("Mohammed Al-Anzi lecture entry points", () => {
  it.each([['ar', 3], ['en', 4]] as const)("navigates from %s Chapter %i lecture MCQs", async (lang, chapter) => {
    const teacher = chapter === 4 ? "mohammed-anzi-ch4" : "mohammed-anzi";
    api.rows = [{ ...set, teacher_id: teacher, topic_key: `anzi-${lang}-ch${chapter}-lec1-exam` }];
    window.history.replaceState({}, "", `/teachers?anzi=1&lang=${lang}&ch=${chapter}&lec=1`);
    render(<Teachers language="ar" onBack={() => {}} />);
    await click(lang === "ar" ? "امتحن نفسك" : "Exam yourself");
    fireEvent.click(await screen.findByRole("button", { name: lang === "ar" ? "تدريب" : "Practice" }));
    const dialog = await screen.findByRole("dialog", { name: set.title });
    fireEvent.click(within(dialog).getByRole("button", { name: lang === "ar" ? "التالي" : "Next" }));
    expect(within(dialog).getByRole("heading", { name: "Question 2" })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: lang === "ar" ? "السابق" : "Previous" }));
    expect(within(dialog).getByRole("heading", { name: "Question 1" })).toBeInTheDocument();
  });

  it("preserves the shared Nadia lecture quiz flow", async () => {
    api.rows = [{ ...set, teacher_id: "nadia-al-nuaimy", topic_key: "nadia-ar-ch2-lec1-exam" }];
    render(<NadiaLectureWorkspace language="ar" curriculum="ar" chapter={2} lecture={1} initialTab="mcq" isAdmin={false} />);
    fireEvent.click(await screen.findByRole("button", { name: "تدريب" }));
    await click("التالي");
    expect(screen.getByRole("heading", { name: "Question 2" })).toBeInTheDocument();
  });
});
