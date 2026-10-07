import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Teachers from "./Teachers";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  },
}));

describe("Nadia teacher hub", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/teachers");
  });

  it("asks for a chapter before opening the 39 Arabic-curriculum lectures", async () => {
    window.history.replaceState({}, "", "/teachers?nadia=1");
    render(<Teachers language="ar" onBack={vi.fn()} />);

    const combinedTool = screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة/ });
    expect(combinedTool).toBeInTheDocument();

    fireEvent.click(combinedTool);
    const chapters = screen.getAllByRole("button", { name: /^الفصل \d:/ });
    expect(chapters).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: "الفصل 1: الخلية والانقسام" }));

    const lectures = screen.getAllByRole("button", { name: /المحاضرة \d+ — قريباً/ });
    expect(lectures).toHaveLength(39);
    expect(screen.getByRole("button", { name: "المحاضرة 1 — قريباً" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "المحاضرة 39 — قريباً" })).toBeDisabled();
  });
});
