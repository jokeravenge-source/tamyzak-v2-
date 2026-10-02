import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Flashcard } from "./Flashcard";

afterEach(cleanup);

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
