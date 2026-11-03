import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminFrenchFlashcardsTab from "./AdminFrenchFlashcardsTab";

const backend = vi.hoisted(() => ({
  customCards: [{
    id: "custom-1",
    chapter: "2",
    language: "ar",
    question: "سؤال إضافي",
    answer: "جواب إضافي",
    approved: true,
    created_at: "2026-11-03T00:00:00.000Z",
  }],
}));

vi.mock("@/integrations/supabase/client", () => {
  const query = (data: unknown[]) => {
    const builder = {
      select: () => builder,
      eq: () => builder,
      order: () => builder,
      then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve({ data, error: null }).then(resolve),
    };
    return builder;
  };
  return {
    supabase: {
      from: (table: string) => query(table === "custom_flashcards" ? backend.customCards : []),
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "admin-1" } } })) },
    },
  };
});

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

describe("AdminFrenchFlashcardsTab", () => {
  it("opens on the complete built-in French library and keeps additions separate", async () => {
    render(<AdminFrenchFlashcardsTab />);

    expect(screen.getByRole("heading", { name: "French Flashcards" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Built-in library (180)" })).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(screen.getAllByText(/Deck 1: Negation · النفي/)).toHaveLength(16));
    expect(screen.queryByText("سؤال إضافي")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Additional cards (1)" }));
    expect(await screen.findByText("سؤال إضافي")).toBeInTheDocument();
    expect(screen.getByText("جواب إضافي")).toBeInTheDocument();
  });
});
