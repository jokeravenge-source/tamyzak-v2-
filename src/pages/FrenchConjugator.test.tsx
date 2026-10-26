import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FrenchConjugator from "./FrenchConjugator";

describe("FrenchConjugator", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("credits الأستاذ محمد علي الكناني as the creator", async () => {
    render(<FrenchConjugator language="ar" onBack={vi.fn()} />);
    expect(screen.getByText("أداة من إعداد الأستاذ محمد علي الكناني")).toBeInTheDocument();
    expect(await screen.findByText("je suis")).toBeInTheDocument();
  });

  it("loads complete conjugations locally without any network request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    expect(await screen.findByText("je suis")).toBeInTheDocument();
    expect(screen.getByText("j’étais")).toBeInTheDocument();
    expect(screen.getByText("que je sois")).toBeInTheDocument();
    expect(screen.queryByText("Works without an internet connection")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("conjugates a regular verb entered by the student", async () => {
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "finir" } });
    fireEvent.click(screen.getByRole("button", { name: "Conjugate verb" }));
    expect((await screen.findAllByText("je finis")).length).toBeGreaterThan(0);
    expect(screen.getByText("nous finissons")).toBeInTheDocument();
    expect(screen.getByText("2e groupe")).toBeInTheDocument();
  });

  it("handles pronominal verbs with the correct auxiliary", async () => {
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "se lever" } });
    fireEvent.click(screen.getByRole("button", { name: "Conjugate verb" }));
    expect(await screen.findByText("je me lève")).toBeInTheDocument();
    expect(screen.getByText("je me suis levé")).toBeInTheDocument();
    expect(screen.getByText("Pronominal verb")).toBeInTheDocument();
  });

  it("rejects non-French input locally", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "Conjugate verb" }));
    expect(await screen.findByText("Enter a valid French verb")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
