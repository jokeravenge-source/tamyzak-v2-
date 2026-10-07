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

  it("shows MCQ Bank and Lectures with five locked chapters each", async () => {
    window.history.replaceState({}, "", "/teachers?nadia=1");
    render(<Teachers language="ar" onBack={vi.fn()} />);

    expect(screen.getByRole("button", { name: /بنك الأسئلة/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /المحاضرات/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /بنك الأسئلة/ }));
    const lockedChapters = screen.getAllByRole("button", { name: /مغلق حالياً/ });
    expect(lockedChapters).toHaveLength(5);
    lockedChapters.forEach((chapter) => expect(chapter).toBeDisabled());
  });
});
