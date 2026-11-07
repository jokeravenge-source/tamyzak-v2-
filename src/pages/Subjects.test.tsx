import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Subjects from "./Subjects";

vi.mock("./MalazamLibrary", () => ({ default: ({ onBack }: { onBack: () => void }) => <section><h1>Independent Al Malazam</h1><button onClick={onBack}>Return home</button></section> }));
vi.mock("react-helmet-async", () => ({ Helmet: () => null }));
vi.mock("@/components/SeoHead", () => ({ default: () => null }));
afterEach(cleanup);

describe("Al Malazam entry", () => {
  it("opens the standalone tool instead of asking for a subject first", async () => {
    const back = vi.fn();
    render(<Subjects language="en" onChangeLanguage={back} onSelectSubject={vi.fn()} mode="malazam" />);
    expect(await screen.findByRole("heading", { name: "Independent Al Malazam" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Return home" }));
    expect(back).toHaveBeenCalledOnce();
  });
  it("keeps the flashcard subject picker working", () => {
    const select = vi.fn();
    render(<Subjects language="en" onChangeLanguage={vi.fn()} onSelectSubject={select} mode="flashcards" />);
    fireEvent.click(screen.getByRole("button", { name: /Physics/ }));
    expect(select).toHaveBeenCalledWith("physics");
  });
});
