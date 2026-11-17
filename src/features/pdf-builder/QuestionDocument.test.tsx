import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { QuestionDocument } from "./QuestionDocument";
import type { PdfQuestion, PdfSettings } from "./model";

const settings: PdfSettings = { title: "My physics booklet", student: "Student", subtitle: "Physics · Capacitors", language: "en", template: "revision", fontSize: 16, answers: "end" };
const questions: PdfQuestion[] = [
  { id: "written", kind: "review", origin: "review", question: "Define capacitance", answer: "The secret written answer", source: "cards" },
  { id: "mcq", kind: "mcq", origin: "ministerial", question: "Choose the correct value", answer: "Three farads\nThe secret explanation", choices: ["Two farads", "Three farads"], answerIndex: 1, source: "ministerial" },
];
afterEach(cleanup);
describe("booklet question and answer rendering", () => {
  it("contains no answer key or explanation when questions-only is selected", () => {
    const { container } = render(<QuestionDocument questions={questions} settings={{ ...settings, answers: "none", template: "exam" }} />);
    expect(container.textContent).not.toContain("secret");
    expect(container.querySelector(".pdf-answer")).toBeNull();
    expect(container.querySelectorAll(".pdf-writing-space")).toHaveLength(2);
    expect(container.querySelectorAll(".pdf-choices li")).toHaveLength(2);
  });
  it("keeps answers after the matching questions or in a separately numbered key", () => {
    const { container, rerender } = render(<QuestionDocument questions={questions} settings={{ ...settings, answers: "after" }} />);
    expect(container.querySelectorAll(".pdf-question .pdf-answer")).toHaveLength(2);
    expect(container.querySelector(".pdf-answer-heading")).toBeNull();
    rerender(<QuestionDocument questions={questions} settings={settings} />);
    const heading = container.querySelector(".pdf-answer-heading")!;
    expect(heading.textContent).toBe("Answer key");
    expect(heading.nextElementSibling?.textContent).toContain("Answer 1The secret written answer");
    expect(heading.nextElementSibling?.nextElementSibling?.textContent).toContain("Answer 2Three farads");
    expect(container.querySelector(".pdf-choices")?.textContent).toBe("A. Two faradsB. Three farads");
  });
  it("preserves structured calculation geometry and escapes source text", () => {
    const q: PdfQuestion = { ...questions[0], answerBlocks: [
      { type: "text", text: "<script>alert(1)</script>" },
      { type: "math", width: 200, height: 80, runs: [{ t: "x²", x: 10, y: 20, s: 16, w: 30 }], rules: [[10, 25, 100]] },
    ] };
    const { container } = render(<QuestionDocument questions={[q]} settings={{ ...settings, answers: "after" }} />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("<script>alert(1)</script>");
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 200 80");
    expect(container.querySelector("svg text")?.getAttribute("textLength")).toBe("30");
    expect(container.querySelector("svg path")?.getAttribute("d")).toBe("M10 25h100");
  });
});
