import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TeacherDirectory from "./TeacherDirectory";

vi.mock("@/pages/Teachers", () => ({
  NadiaLectureWorkspace: ({ curriculum }: { curriculum: string }) => <div data-testid="selected-curriculum">{curriculum}</div>,
}));

vi.mock("@/pages/Subjects", () => ({
  SUBJECT_STORAGE_KEY: "app_subject_v1",
  PHYSICS_FLASHCARD_TEACHER_STORAGE_KEY: "physics_flashcard_teacher_v1",
  BIOLOGY_FLASHCARD_TEACHER_STORAGE_KEY: "biology_flashcard_teacher_v1",
  CHEMISTRY_FLASHCARD_TEACHER_STORAGE_KEY: "chemistry_flashcard_teacher_v1",
}));

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
  it("shows Nadia's Arabic chapter 3 by its 33 available topics", async () => {
    render(
      <TeacherDirectory
        language="ar"
        onBack={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    const nadiaCard = await screen.findByRole("button", { name: /نادية النعيمي/ });
    fireEvent.click(nadiaCard);

    const contentTool = screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة.*المنهج العربي/ });
    fireEvent.click(contentTool);

    const chapters = screen.getAllByRole("button", { name: /^الفصل \d:/ });
    expect(chapters).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: "الفصل 3: التكاثر" }));

    expect(screen.getByText("الفصل 3: التكاثر")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "مواضيع الفصل" })).toBeInTheDocument();
    expect(screen.getByText("33 موضوعاً مرتبة حسب محتوى الفصل.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "مقدمة في التكاثر" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "التكاثر العذري والخنثي" })).toBeEnabled();
  });

  it("shows Arabic chapter 5 as genetics topics", async () => {
    render(
      <TeacherDirectory
        language="ar"
        onBack={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: /نادية النعيمي/ }));
    fireEvent.click(screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة.*المنهج العربي/ }));
    fireEvent.click(screen.getByRole("button", { name: "الفصل 5: الوراثة" }));

    expect(screen.getByRole("heading", { name: "مواضيع الفصل" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "علم الوراثة وغريغور مندل" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "الهندسة الوراثية وتطبيقاتها" })).toBeEnabled();
    expect(screen.getByText("21 موضوعاً مرتبة حسب محتوى الفصل.")).toBeInTheDocument();
  });
  it("opens the English curriculum independently of the Arabic interface, then switches back", async () => {
    render(<TeacherDirectory language="ar" onBack={vi.fn()} onSelect={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: /نادية النعيمي/ }));
    expect(screen.getAllByRole("button", { name: /المحاضرات وبنك الأسئلة/ })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة.*المنهج الإنجليزي/ }));
    expect(screen.getByRole("heading", { name: "فصول المنهج الإنجليزي" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "الفصل 1: الخلية والانقسام" }));
    expect(screen.getByRole("heading", { name: "مواضيع الفصل" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "الخلية والنظرية الخلوية" }));
    expect(screen.getByTestId("selected-curriculum")).toHaveTextContent("en");
    fireEvent.click(screen.getByRole("button", { name: "العودة للمحاضرات" }));
    fireEvent.click(screen.getByRole("button", { name: "العودة للفصول" }));
    fireEvent.click(screen.getByRole("button", { name: "العودة لمحتوى الأستاذة" }));
    fireEvent.click(screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة.*المنهج العربي/ }));
    fireEvent.click(screen.getByRole("button", { name: "الفصل 2: الأنسجة" }));
    fireEvent.click(screen.getByRole("button", { name: "مقدمة الأنسجة" }));
    expect(screen.getByTestId("selected-curriculum")).toHaveTextContent("ar");
  });

  it("offers both curricula when the interface is English", async () => {
    render(<TeacherDirectory language="en" onBack={vi.fn()} onSelect={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: /نادية النعيمي/ }));
    expect(screen.getByRole("button", { name: "Lectures & MCQ Bank — Arabic Curriculum" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Lectures & MCQ Bank — English Curriculum" }));
    expect(screen.getByRole("heading", { name: "English Curriculum Chapters" })).toBeInTheDocument();
  });

});

