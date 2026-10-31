import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SubjectsHub from "@/pages/SubjectsHub";

vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => ({ isPremium: false, loading: false }) }));
vi.mock("@/lib/analytics", () => ({ trackFeature: vi.fn(), trackFeatureUnlocked: vi.fn() }));

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("app_subject_focus_v1", "chemistry");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Atom Atlas navigation", () => {
  it.each(["en", "ar"] as const)("shows the free Chemistry tool and opens it inside Tamayzak in %s", async (language) => {
    const onSelect = vi.fn();
    await act(async () => {
      render(<SubjectsHub language={language} onBack={vi.fn()} onSelect={onSelect} />);
    });

    const tool = screen.getByRole("button", { name: /Atom Atlas|أطلس الذرة/ });
    expect(tool).toHaveTextContent(language === "ar" ? "أطلس الذرة" : "Atom Atlas");
    expect(tool).toHaveTextContent(language === "ar" ? "مجاني" : "FREE");

    fireEvent.click(tool);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("atomAtlas");
  });
});
