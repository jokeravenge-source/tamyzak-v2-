import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Teachers, { NadiaLectureWorkspace } from "./Teachers";

const backend = vi.hoisted(() => ({
  reads: [] as Array<{ table: string; filters: Record<string, string> }>,
  writes: [] as Array<{ table: string; row: Record<string, unknown> }>,
  videos: [] as Array<Record<string, unknown>>,
  mcqs: [] as Array<Record<string, unknown>>,
  invoke: vi.fn(),
}));

vi.mock("@/lib/fileText", () => ({
  extractStudyMaterial: vi.fn().mockResolvedValue({ text: "Study material with sufficient detail to generate a question for this lecture." }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    rpc: vi.fn(),
    functions: { invoke: backend.invoke },
    from: vi.fn((table: string) => {
      const filters: Record<string, string> = {};
      let inserted: Record<string, unknown> | null = null;
      const query = {
        select: vi.fn(() => query),
        eq: vi.fn((column: string, value: string) => { filters[column] = value; return query; }),
        order: vi.fn(async () => {
          backend.reads.push({ table, filters: { ...filters } });
          const rows = table === "teacher_topic_videos" ? backend.videos : backend.mcqs;
          return { data: rows.filter((row) => Object.entries(filters).every(([key, value]) => row[key] === value)), error: null };
        }),
        insert: vi.fn((row: Record<string, unknown>) => {
          inserted = row;
          backend.writes.push({ table, row });
          return query;
        }),
        single: vi.fn(async () => ({ data: { ...inserted, id: "saved-row", created_at: "2026-10-12T00:00:00Z" }, error: null })),
      };
      return query;
    }),
  },
}));

beforeEach(() => {
  window.history.replaceState({}, "", "/teachers");
  backend.reads.length = 0;
  backend.writes.length = 0;
  backend.videos.length = 0;
  backend.mcqs.length = 0;
  backend.invoke.mockReset();
  backend.invoke.mockImplementation(async (name: string) => ({
    error: null,
    data: name === "generate-mcq"
      ? { questions: [{ question: "Which answer is correct?", choices: ["A", "B", "C", "D"], answer_index: 1 }] }
      : { parts: [{ title: "Lecture notes", notes: "Notes for this curriculum" }], transcript: "Lecture transcript" },
  }));
});

describe("Nadia teacher hub", () => {
  it("offers separate curricula before opening the Arabic chapter and lecture list", () => {
    window.history.replaceState({}, "", "/teachers?nadia=1");
    render(<Teachers language="ar" onBack={vi.fn()} />);
    expect(screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة.*المنهج الإنجليزي/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة.*المنهج العربي/ }));
    expect(screen.getAllByRole("button", { name: /^الفصل \d:/ })).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: "الفصل 1: الخلية والانقسام" }));
    expect(screen.getAllByRole("button", { name: /^المحاضرة \d+$/ })).toHaveLength(39);
  });

  it("keeps Arabic chapter 5 limited to 25 lectures", () => {
    window.history.replaceState({}, "", "/teachers?nadia=1");
    render(<Teachers language="ar" onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /المحاضرات وبنك الأسئلة.*المنهج العربي/ }));
    fireEvent.click(screen.getByRole("button", { name: "الفصل 5: الوراثة" }));
    expect(screen.getAllByRole("button", { name: /^المحاضرة \d+$/ })).toHaveLength(25);
    expect(screen.queryByRole("button", { name: "المحاضرة 26" })).not.toBeInTheDocument();
  });

  it("loads only the selected curriculum's videos and MCQs", async () => {
    for (const curriculum of ["ar", "en"]) {
      backend.videos.push({
        id: `video-${curriculum}`, teacher_id: "nadia-al-nuaimy", topic_key: `nadia-${curriculum}-ch1-lec1-study`,
        title: `${curriculum} lecture`, youtube_url: "https://youtu.be/abcdefghijk", video_id: "abcdefghijk", approved: true,
        notes_parts: [{ title: "Notes", notes: "Lecture content" }],
      });
      backend.mcqs.push({
        id: `mcq-${curriculum}`, teacher_id: "nadia-al-nuaimy", topic_key: `nadia-${curriculum}-ch1-lec1-exam`,
        title: `${curriculum} questions`, questions: [{ question: "A question", choices: ["A", "B", "C", "D"], answer_index: 0 }], created_at: "2026-10-12T00:00:00Z",
      });
    }
    const { rerender } = render(<NadiaLectureWorkspace language="ar" curriculum="en" chapter={1} lecture={1} isAdmin={false} />);
    expect(await screen.findByText("en lecture")).toBeInTheDocument();
    expect(screen.queryByText("ar lecture")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "بنك الأسئلة" }));
    expect(await screen.findByText("en questions")).toBeInTheDocument();
    expect(screen.queryByText("ar questions")).not.toBeInTheDocument();
    rerender(<NadiaLectureWorkspace language="en" curriculum="ar" chapter={1} lecture={1} isAdmin={false} />);
    expect(screen.queryByText("en questions")).not.toBeInTheDocument();
    expect(await screen.findByText("ar questions")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Video & notes" }));
    expect(await screen.findByText("ar lecture")).toBeInTheDocument();
    expect(screen.queryByText("en lecture")).not.toBeInTheDocument();
  });

  it.each(["ar", "en"] as const)("generates and saves %s lectures in their own curriculum", async (curriculum) => {
    render(<NadiaLectureWorkspace language="ar" curriculum={curriculum} chapter={1} lecture={2} isAdmin />);
    expect(await screen.findByText("لا توجد محاضرات بعد.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "إضافة محاضرة يوتيوب" }));
    fireEvent.change(screen.getByLabelText("رابط اليوتيوب"), { target: { value: "https://youtu.be/abcdefghijk" } });
    fireEvent.click(screen.getByRole("button", { name: "توليد الملاحظات" }));
    fireEvent.click(await screen.findByRole("button", { name: "اعتماد ونشر" }));
    await waitFor(() => expect(backend.writes).toContainEqual(expect.objectContaining({
      table: "teacher_topic_videos", row: expect.objectContaining({ topic_key: `nadia-${curriculum}-ch1-lec2-study` }),
    })));
    expect(backend.invoke).toHaveBeenCalledWith("video-notes", expect.objectContaining({ body: expect.objectContaining({ language: curriculum }) }));
  });

  it.each(["ar", "en"] as const)("generates and saves %s MCQs in their own curriculum", async (curriculum) => {
    const { container } = render(<NadiaLectureWorkspace language="en" curriculum={curriculum} chapter={3} lecture={4} isAdmin />);
    fireEvent.click(screen.getByRole("button", { name: "MCQ bank" }));
    fireEvent.click(await screen.findByRole("button", { name: "Generate MCQs (Admin)" }));
    const fileInput = container.querySelector('input[type="file"]')!;
    fireEvent.change(fileInput, { target: { files: [new File(["PDF source"], "lecture.pdf", { type: "application/pdf" })] } });
    fireEvent.click(screen.getByRole("button", { name: "Generate & Save" }));
    await waitFor(() => expect(backend.writes).toContainEqual(expect.objectContaining({
      table: "teacher_topic_mcqs", row: expect.objectContaining({ topic_key: `nadia-${curriculum}-ch3-lec4-exam` }),
    })));
    expect(backend.invoke).toHaveBeenCalledWith("generate-mcq", expect.objectContaining({ body: expect.objectContaining({ language: curriculum }) }));
  });
});
