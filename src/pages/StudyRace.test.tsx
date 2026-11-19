import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StudyRace from "./StudyRace";
import { getBuiltInBiologyChapter2 } from "@/lib/biologyChapter2Mcqs";
vi.mock("@/lib/racePoints", () => ({
  saveRaceReward: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/components/StudyRunner", () => ({
  default: ({
    active,
    onQuestion,
    lives,
  }: {
    active: boolean;
    onQuestion: () => void;
    lives: number;
  }) => (
    <>
      <span>Lives {lives}</span>
      <button disabled={!active} onClick={onQuestion}>
        Run ten seconds
      </button>
    </>
  ),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => {
      const query = {
        select: () => query,
        eq: () => query,
        order: () => query,
        range: () => query,
        abortSignal: async () => ({
          data: [
            {
              id: "chem-test",
              subject: "chemistry",
              chapter: 1,
              question: "Two-choice question",
              choices: ["Yes", "No"],
              answer_index: 1,
              explanation: null,
            },
          ],
          error: null,
        }),
      };
      return query;
    },
  },
}));

describe("StudyRace", () => {
  it("plays a newly loaded subject with two-choice keyboard selection", async () => {
    const view = render(<StudyRace language="en" onBack={vi.fn()} />);
    await screen.findByRole("button", { name: "Start race" });
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "chemistry" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Start race" }));
    fireEvent.click(screen.getByRole("button", { name: "Run ten seconds" }));
    expect(document.querySelectorAll(".race-lanes button")).toHaveLength(2);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(
      document.querySelectorAll('.race-lanes button[aria-pressed="true"]'),
    ).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Confirm lane" }));
    expect(document.querySelector(".race-feedback")).toBeInTheDocument();
    view.unmount();
  });
  it("loads the existing bank, pauses and completes a round with review attempts", async () => {
    const previousOverflow = document.body.style.overflow;
    const view = render(<StudyRace language="ar" onBack={vi.fn()} />);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.querySelector(".study-race")?.parentElement).toBe(
      document.body,
    );
    const start = await screen.findByRole("button", { name: "ابدأ السباق" });
    fireEvent.click(start);
    fireEvent.click(screen.getByRole("button", { name: "إيقاف أو استئناف" }));
    expect(screen.getByText("السباق متوقف")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "كمّل السباق" }));
    let turns = 0;
    while (!screen.queryByText("وصلت للنهاية!")) {
      expect(
        screen.queryByRole("button", { name: "تأكيد المسار" }),
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Run ten seconds" }));
      const question = getBuiltInBiologyChapter2("ar").find(
        (q) =>
          q.question ===
          document.querySelector(".race-question h1")?.textContent,
      )!;
      const options = Array.from(
        document.querySelectorAll<HTMLButtonElement>(".race-lanes button"),
      );
      const selected = options.find((button) =>
        turns === 0
          ? button.textContent !== question.choices[question.answer_index]
          : button.textContent === question.choices[question.answer_index],
      )!;
      fireEvent.click(selected);
      fireEvent.click(screen.getByRole("button", { name: "تأكيد المسار" }));
      expect(screen.getByText("Lives 2")).toBeInTheDocument();
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
    expect(screen.getByText("120 نقطة بالسباق")).toBeInTheDocument();
    expect(
      screen.getByText(/إجابة صحيحة من المحاولة الأولى/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "غيّر المادة والفصل" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "ابدأ السباق" })).toBeEnabled(),
    );
    view.unmount();
    expect(document.body.style.overflow).toBe(previousOverflow);
  });
});
