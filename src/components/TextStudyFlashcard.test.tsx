import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TextStudyFlashcard } from "./TextStudyFlashcard";

describe("text study flashcards", () => {
  it("reveals selectable answer text without images and resets on navigation", () => {
    const props = { question: "Example question", answerBlocks: [{ type: "text" as const, text: "An example answer." }], index: 0, total: 2, onRate: vi.fn() };
    const { container, rerender } = render(<TextStudyFlashcard {...props} />);
    expect(screen.queryByText("An example answer.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reveal answer" }));
    expect(screen.getByText("An example answer.")).toBeInTheDocument();
    expect(container.querySelectorAll("img, canvas, iframe, object, svg image")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Good" }));
    expect(props.onRate).toHaveBeenCalledWith("good");
    rerender(<TextStudyFlashcard {...props} question="Another question" index={1} />);
    expect(screen.queryByLabelText("Answer")).toBeNull();
    expect(screen.getByRole("button", { name: "Reveal answer" })).toHaveAttribute("aria-expanded", "false");
  });
});
