import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DailyReportReview from "./DailyReportReview";
import { describeStudyStartTopics } from "@/lib/studyStart";

const backend = vi.hoisted(() => ({ furtherEq: vi.fn(), focus: vi.fn() }));
vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => ({ userId: "student" }) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: () => table === "my_mistakes" ? { eq: backend.furtherEq } : backend.focus(),
      }),
    }),
  },
}));

beforeEach(() => { backend.furtherEq.mockReset(); backend.focus.mockReset(); });

describe("Daily Report next step", () => {
  it("keeps recorded mistakes separate from the student's self-selected focus", async () => {
    backend.furtherEq.mockReturnValueOnce(Promise.resolve({ count: 5, error: null }))
      .mockReturnValueOnce({ lte: () => Promise.resolve({ count: 2, error: null }) })
      .mockReturnValueOnce({ order: () => ({ limit: () => Promise.resolve({ data: [{ subject: "physics" }, { subject: "physics" }, { subject: "chemistry" }], error: null }) }) });
    const topic = describeStudyStartTopics("physics", "en")[0];
    expect(topic).toBeDefined();
    backend.focus.mockResolvedValue({ data: [{ subject: "physics", topic_keys: [topic.key] }], error: null });
    const onReview = vi.fn();
    render(<DailyReportReview language="en" onReview={onReview} />);
    const mistakes = (await screen.findByRole("heading", { name: "Saved mistakes" })).parentElement!;
    expect(await within(mistakes).findByText(/not yet mastered/)).toHaveTextContent("5 not yet mastered from earlier answers · 2 due now");
    expect(within(mistakes).getByText("Physics:")).toHaveTextContent("Physics: 2");
    const focus = screen.getByRole("heading", { name: "Topics you picked yourself" }).parentElement!;
    expect(await within(focus).findByRole("listitem")).toHaveTextContent(topic.title);
    expect(within(mistakes).queryByText(topic.title)).not.toBeInTheDocument();
    fireEvent.click(within(mistakes).getByRole("button", { name: "Redo your mistakes" }));
    expect(onReview).toHaveBeenCalledOnce();
  });

  it("does not mistake a failed focus read for a student with no selected topics", async () => {
    backend.furtherEq.mockReturnValueOnce(Promise.resolve({ count: 0, error: null }))
      .mockReturnValueOnce({ lte: () => Promise.resolve({ count: 0, error: null }) })
      .mockReturnValueOnce({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) });
    backend.focus.mockResolvedValue({ data: null, error: { code: "missing table fixture" } });
    render(<DailyReportReview language="en" onReview={vi.fn()} />);
    expect(await screen.findByText("Could not load this right now.")).toBeVisible();
    expect(screen.queryByText("You haven’t picked any topics to work on yet.")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Redo your mistakes" })).not.toBeInTheDocument();
  });
});
