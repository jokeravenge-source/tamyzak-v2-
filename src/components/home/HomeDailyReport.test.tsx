import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomeDailyReport from "./HomeDailyReport";
import { baghdadReportBounds, baghdadReportDate } from "../../../supabase/functions/_shared/baghdadReportDay";

const backend = vi.hoisted(() => ({ eq: vi.fn(), gte: vi.fn(), lt: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ select: () => ({ eq: backend.eq }) }) },
}));

beforeEach(() => {
  backend.eq.mockReset().mockReturnValue({ gte: backend.gte });
  backend.gte.mockReset().mockReturnValue({ lt: backend.lt });
  backend.lt.mockReset();
});

describe("the Home Daily Report preview", () => {
  it("uses only the current student's saved sessions in today’s Baghdad interval", async () => {
    backend.lt.mockResolvedValue({ data: [{ duration_seconds: 180 }, { duration_seconds: 600 }], error: null });
    const onOpen = vi.fn();
    render(<HomeDailyReport language="en" userId="student" onOpen={onOpen} />);
    expect(await screen.findByText("13 focus min · 2 sessions")).toBeVisible();
    const { start, end } = baghdadReportBounds(baghdadReportDate());
    expect(backend.eq).toHaveBeenCalledWith("user_id", "student");
    expect(backend.gte).toHaveBeenCalledWith("created_at", start);
    expect(backend.lt).toHaveBeenCalledWith("created_at", end);
    fireEvent.click(screen.getByRole("button", { name: "My Daily Report" }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("shows a real empty result separately from a failed read", async () => {
    backend.lt.mockResolvedValueOnce({ data: [], error: null });
    const step = render(<HomeDailyReport language="en" userId="empty" onOpen={vi.fn()} />);
    expect(await screen.findByText("No study sessions saved today yet.")).toBeVisible();
    backend.lt.mockResolvedValueOnce({ data: null, error: { code: "fixture" } });
    step.rerender(<HomeDailyReport language="en" userId="failed" onOpen={vi.fn()} />);
    expect(await screen.findByText("Today's study summary is unavailable.")).toBeVisible();
    expect(screen.queryByText("No study sessions saved today yet.")).not.toBeInTheDocument();
  });
});
