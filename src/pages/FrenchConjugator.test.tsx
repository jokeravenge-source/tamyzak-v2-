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
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "finir" } });
    fireEvent.click(screen.getByRole("button", { name: "Conjugate verb" }));
    expect((await screen.findAllByText("je finis")).length).toBeGreaterThan(0);
    expect(screen.getByText("nous finissons")).toBeInTheDocument();
    expect(screen.getByText("2e groupe")).toBeInTheDocument();
  });

  it("shows live, accent-insensitive suggestions and selects one with the keyboard", async () => {
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    const searchbox = screen.getByRole("combobox", { name: "Example: être, finir, se lever…" });

    fireEvent.change(searchbox, { target: { value: "etr" } });
    expect(screen.getByRole("listbox", { name: "Search suggestions" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "être" })).toBeInTheDocument();

    fireEvent.keyDown(searchbox, { key: "ArrowDown" });
    fireEvent.keyDown(searchbox, { key: "Enter" });
    expect(await screen.findByText("je suis")).toBeInTheDocument();
    expect(searchbox).toHaveValue("être");
    expect(screen.queryByRole("listbox", { name: "Search suggestions" })).not.toBeInTheDocument();
  });

  it("keeps pronominal prefixes in live suggestions", () => {
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    const searchbox = screen.getByRole("combobox", { name: "Example: être, finir, se lever…" });
    fireEvent.change(searchbox, { target: { value: "se lev" } });
    expect(screen.getByRole("option", { name: "se lever" })).toBeInTheDocument();
  });

  it("suggests the intended verb after a small spelling mistake", () => {
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    const searchbox = screen.getByRole("combobox", { name: "Example: être, finir, se lever…" });
    fireEvent.change(searchbox, { target: { value: "avpir" } });
    expect(screen.getByRole("option", { name: "avoir" })).toBeInTheDocument();
  });

  it("handles pronominal verbs with the correct auxiliary", async () => {
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "se lever" } });
    fireEvent.click(screen.getByRole("button", { name: "Conjugate verb" }));
    expect(await screen.findByText("je me lève")).toBeInTheDocument();
    expect(screen.getByText("je me suis levé")).toBeInTheDocument();
    expect(screen.getByText("Pronominal verb")).toBeInTheDocument();
  });

  it("rejects non-French input locally", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "Conjugate verb" }));
    expect(await screen.findByText("Enter a valid French verb")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("filters the responsive conjugation table by mood", async () => {
    render(<FrenchConjugator language="en" onBack={vi.fn()} />);
    const filter = await screen.findByRole("navigation", { name: "Filter conjugation moods" });
    const allButton = screen.getByRole("button", { name: "All" });
    expect(filter).toBeInTheDocument();
    expect(allButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Subjonctif" }));
    expect(screen.getByRole("button", { name: "Subjonctif" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("que je sois")).toBeInTheDocument();
    expect(screen.queryByText("je suis")).not.toBeInTheDocument();
  });
});
