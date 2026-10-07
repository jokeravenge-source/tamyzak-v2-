import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Teachers, { NadiaLectureWorkspace } from "./Teachers";

vi.mock("@/integrations/supabase/client", () => {
  const emptyTeacherContentQuery = () => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })),
      })),
    })),
  });

  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: vi.fn(() => emptyTeacherContentQuery()),
      rpc: vi.fn(),
    },
  };
});

describe("Nadia teacher hub", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/teachers");
  });

  it("asks for a chapter before opening the 39 Arabic-curriculum lectures", async () => {
    window.history.replaceState({}, "", "/teachers?nadia=1");
    render(<Teachers language="ar" onBack={vi.fn()} />);

    const combinedTool = screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة/ });
    expect(combinedTool).toBeInTheDocument();

    fireEvent.click(combinedTool);
    const chapters = screen.getAllByRole("button", { name: /^الفصل \d:/ });
    expect(chapters).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: "الفصل 1: الخلية والانقسام" }));

    const lectures = screen.getAllByRole("button", { name: /^المحاضرة \d+$/ });
    expect(lectures).toHaveLength(39);
    expect(screen.getByRole("button", { name: "المحاضرة 1" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "المحاضرة 39" })).toBeEnabled();
  });

  it("limits Arabic chapter 5 to lectures 1 through 24", () => {
    window.history.replaceState({}, "", "/teachers?nadia=1");
    render(<Teachers language="ar" onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة/ }));
    fireEvent.click(screen.getByRole("button", { name: "الفصل 5: الوراثة" }));

    expect(screen.getAllByRole("button", { name: /^المحاضرة \d+$/ })).toHaveLength(24);
    expect(screen.getByRole("button", { name: "المحاضرة 24" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "المحاضرة 25" })).not.toBeInTheDocument();
  });

  it("lets an admin paste a YouTube link and generate lecture notes", async () => {
    render(
      <NadiaLectureWorkspace
        language="ar"
        chapter={1}
        lecture={1}
        isAdmin
      />,
    );

    expect(await screen.findByText("لا توجد محاضرات بعد.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "إضافة محاضرة يوتيوب" }));

    expect(screen.getByLabelText("رابط اليوتيوب")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "توليد الملاحظات" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "بنك الأسئلة" }));
    expect(await screen.findByRole("button", { name: "توليد أسئلة (للمدير)" })).toBeInTheDocument();
  });
});
