import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StudyRace from "./StudyRace";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => {
      const query = {
        select: () => query,
        eq: () => query,
        order: () => query,
        limit: () => query,
        abortSignal: async () => ({ data: [], error: null }),
      };
      return query;
    },
  },
}));

describe("StudyRace", () => {
  it("loads the existing bank, pauses and completes a round with review attempts", async () => {
    render(<StudyRace language="ar" onBack={vi.fn()} />);
    const start = await screen.findByRole("button", { name: "ابدأ السباق" });
    fireEvent.click(start);
    fireEvent.click(screen.getByRole("button", { name: "إيقاف أو استئناف" }));
    expect(screen.getByText("السباق متوقف")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "كمّل السباق" }));
    let turns = 0;
    while (!screen.queryByText("وصلت للنهاية!")) {
      fireEvent.click(screen.getByRole("button", { name: "تأكيد المسار" }));
      const choices = document.querySelectorAll(".race-lanes button");
      expect(choices).toHaveLength(3);
      expect(document.querySelectorAll(".race-lanes .right")).toHaveLength(1);
      expect(choices[0]).toBeDisabled();
      fireEvent.click(
        screen.getByRole("button", { name: /^(كمّل|شوف نتيجتك)$/ }),
      );
      turns++;
      expect(turns).toBeLessThanOrEqual(24);
    }
    expect(turns).toBeGreaterThanOrEqual(12);
    expect(
      screen.getByText(/إجابة صحيحة من المحاولة الأولى/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "غيّر المادة والفصل" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "ابدأ السباق" })).toBeEnabled(),
    );
  });
});
