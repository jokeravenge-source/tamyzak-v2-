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

  it("combines lectures and the MCQ bank into one tool with five locked chapters", async () => {
    window.history.replaceState({}, "", "/teachers?nadia=1");
    render(<Teachers language="ar" onBack={vi.fn()} />);

    const combinedTool = screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة/ });
    expect(combinedTool).toBeInTheDocument();

    fireEvent.click(combinedTool);
    const lockedChapters = screen.getAllByRole("button", { name: /مغلق حالياً/ });
    expect(lockedChapters).toHaveLength(5);
    lockedChapters.forEach((chapter) => expect(chapter).toBeDisabled());
  });
});
