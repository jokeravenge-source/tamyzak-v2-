import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TeacherDirectory from "./TeacherDirectory";

vi.mock("@/integrations/supabase/client", () => {
  const teacherQuery = {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "haydar-diwan",
                name: "حيدر ديوان",
                background_image_url: "/haydar.png",
                tools: ["flashcards"],
                flashcard_list_ids: [],
                sort_order: 1,
              },
            ],
            error: null,
          }),
        })),
      })),
    })),
  };

  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: vi.fn(() => teacherQuery),
      rpc: vi.fn(),
    },
  };
});

describe("Our Teachers Nadia entry", () => {
  it("shows Nadia, lets the student choose a chapter, then opens 39 lectures", async () => {
    render(
      <TeacherDirectory
        language="ar"
        onBack={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    const nadiaCard = await screen.findByRole("button", { name: /نادية النعيمي/ });
    fireEvent.click(nadiaCard);

    const contentTool = screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة/ });
    fireEvent.click(contentTool);

    const chapters = screen.getAllByRole("button", { name: /^الفصل \d:/ });
    expect(chapters).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: "الفصل 3: التكاثر" }));

    expect(screen.getByText("الفصل 3: التكاثر")).toBeInTheDocument();
    const lectures = screen.getAllByRole("button", { name: /المحاضرة \d+ — قريباً/ });
    expect(lectures).toHaveLength(39);
    expect(screen.getByRole("button", { name: "المحاضرة 1 — قريباً" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "المحاضرة 39 — قريباً" })).toBeDisabled();
  });
});
