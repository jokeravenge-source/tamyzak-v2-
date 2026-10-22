import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Flashcard } from "./Flashcard";
import { ahmedNadawiChemCh3CardsEn } from "@/data/flashcardsChemCh3AhmedNadawiEn";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Flashcard long-form reading", () => {
  it("enables an internal reading pane for Nadia's long cards", () => {
    render(
      <Flashcard
        question="سؤال طويل"
        answer={"السطر الأول\nالسطر الثاني"}
        index={0}
        total={10}
        direction="right"
        language="ar"
        comfortableScrolling
      />,
    );

    const answer = screen.getByText(/السطر الأول/);
    expect(answer).toHaveClass("whitespace-pre-line");
    expect(answer.parentElement).toHaveClass("flashcard-reading-scroll", "overflow-y-auto", "touch-pan-y");
  });

  it("keeps the compact centered layout for ordinary decks", () => {
    render(
      <Flashcard
        question="Question"
        answer="Answer"
        index={0}
        total={1}
        direction="right"
        language="en"
      />,
    );

    const answerBody = screen.getAllByText("Answer").find((element) => element.tagName === "P");

    expect(answerBody?.parentElement).not.toHaveClass("flashcard-reading-scroll");
  });
});


describe("Ahmed CH3 in the shared flashcard viewer", () => {
  it("retains source working, flip navigation, ratings, and audio controls", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const source = ahmedNadawiChemCh3CardsEn.find(card => card.id === "AN-CH3-EN-015")!;
    const onRate = vi.fn();
    const props = {
      question: source.q, answer: source.a, answerBlocks: source.answerBlocks,
      index: 0, total: ahmedNadawiChemCh3CardsEn.length,
      direction: "right" as const, comfortableScrolling: true, onRate,
      intervalHints: { good: "1 day" },
    };
    const { container, rerender } = render(<Flashcard {...props} />);
    for (const block of source.answerBlocks) {
      if (block.type === "text") expect(container.textContent).toContain(block.text);
      else for (const run of block.runs) expect(container.textContent).toContain(run.t);
    }
    expect(container.querySelector(".flashcard-reading-scroll .space-y-4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record your voice" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hear the answer" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Good/ })).toBeNull();
    const flip = screen.getByRole("button", { name: "Flip card" });
    fireEvent.click(flip);
    expect(flip).toHaveStyle({ transform: "rotateY(180deg)" });
    fireEvent.click(screen.getByRole("button", { name: /Good/ }));
    expect(onRate).toHaveBeenCalledWith("good");
    rerender(<Flashcard {...props} question="Next source question" index={1} />);
    expect(screen.getByRole("button", { name: "Flip card" })).toHaveStyle({ transform: "rotateY(0deg)" });
    expect(screen.queryByRole("button", { name: /Good/ })).toBeNull();
  });
});
