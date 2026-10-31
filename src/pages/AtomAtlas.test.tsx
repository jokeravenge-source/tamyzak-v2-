import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AtomAtlas from "@/pages/AtomAtlas";
import { ELEMENTS } from "@/data/atomAtlas/elements";

const subscription = vi.hoisted(() => ({ isPremium: false, loading: false }));
vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => subscription }));

beforeEach(() => {
  subscription.isPremium = false;
  subscription.loading = false;
});

describe("Atom Atlas", () => {
  it("ships one complete, ordered record for every confirmed element", () => {
    expect(ELEMENTS).toHaveLength(118);
    expect(ELEMENTS.map((element) => element.z)).toEqual(Array.from({ length: 118 }, (_, index) => index + 1));
    expect(new Set(ELEMENTS.map((element) => element.s)).size).toBe(118);
  });

  it("moves between the in-app periodic table, atom explorer and molecule viewer", () => {
    render(<AtomAtlas language="en" onBack={() => undefined} />);
    expect(screen.getByRole("heading", { name: "Atom Atlas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Oganesson, 118" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Atom explorer" }));
    expect(screen.getByText("Simplified shell model")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Molecules" }));
    expect(screen.getByRole("button", { name: /Water/ })).toBeInTheDocument();
    expect(screen.getAllByText("H₂O")).toHaveLength(2);
  });

  it("renders the Arabic experience in RTL", () => {
    render(<AtomAtlas language="ar" onBack={() => undefined} />);
    expect(screen.getByRole("main")).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("heading", { name: "أطلس الذرة" })).toBeInTheDocument();
  });

  it.each(["Dictionary", "Lessons"])("locks the %s section for free students", (section) => {
    render(<AtomAtlas language="en" onBack={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: `${section} — Premium` }));

    expect(screen.getByRole("heading", { name: "This section is for Premium members" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Unlock via Telegram" })).toHaveAttribute("href", "https://t.me/ias404");
  });

  it("opens Dictionary and Lessons for Premium students", () => {
    subscription.isPremium = true;
    render(<AtomAtlas language="en" onBack={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: "Dictionary" }));
    expect(screen.getByPlaceholderText("Search English or Arabic terms…")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Lessons" }));
    expect(screen.getByText("Learning objectives")).toBeInTheDocument();
  });
});
