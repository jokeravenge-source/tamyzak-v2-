import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TeacherLectureVideos from "./TeacherLectureVideos";

const backend = vi.hoisted(() => ({ rows: [] as any[], invoke: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: backend.error } }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  functions: { invoke: backend.invoke },
  from: () => {
    const filters: Array<(row: any) => boolean> = [];
    const result = () => ({ data: backend.rows.filter((row) => filters.every((fn) => fn(row))), error: null });
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => { filters.push((row) => row[key] === value); return query; },
      in: (key: string, values: unknown[]) => { filters.push((row) => values.includes(row[key])); return query; },
      order: async () => result(),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve),
    };
    return query;
  },
} }));

const arabicNotes = "## Review Questions\n1. ما الخلية؟\n\n**الإجابة:** الخلية هي وحدة الحياة.";
const englishNotes = "## Review Questions\n1. What is a cell?\n\n**الإجابة:** الخلية هي وحدة الحياة.";
function row(topic: string, notes = arabicNotes) {
  return { id: `source-${topic}`, teacher_id: "nadia-al-nuaimy", topic_key: topic,
    title: "المصدر العربي", youtube_url: "", video_id: null, approved: true,
    notes_parts: [{ title: "الملاحظات", notes }], created_at: "2026-10-17T00:00:00Z" };
}

beforeEach(() => {
  backend.rows = [];
  backend.invoke.mockReset();
  backend.error.mockReset();
  backend.invoke.mockResolvedValue({ data: { parts: [{ title: "Source title", notes: englishNotes }] }, error: null });
});

describe("English lecture note questions", () => {
  it.each([1, 2, 3, 4, 5])("repairs existing questions in chapter %s and keeps Arabic answers", async (chapter) => {
    const topicKey = `nadia-en-ch${chapter}-lec1-study`;
    backend.rows.push(row(topicKey));
    render(<TeacherLectureVideos teacherId="nadia-al-nuaimy" topicKey={topicKey} language="ar" contentLanguage="en" isAdmin={false} />);
    fireEvent.click(await screen.findByRole("button", { name: "Open notes" }));
    expect(await screen.findByText("What is a cell?")).toBeInTheDocument();
    expect(screen.getByText("الخلية هي وحدة الحياة.")).toBeInTheDocument();
    expect(screen.queryByText("ما الخلية؟")).not.toBeInTheDocument();
    expect(backend.invoke).toHaveBeenCalledWith("english-lecture-questions", {
      body: { topicKey, sourceIds: [`source-${topicKey}`] },
    });
  });

  it("repairs every part of combined Arabic fallback notes while keeping English topic titles", async () => {
    const sourceKeys = ["nadia-ar-ch2-lec3-study", "nadia-ar-ch2-lec4-study"];
    backend.rows.push(...sourceKeys.map((key) => row(key)));
    backend.invoke.mockResolvedValue({ data: { parts: [
      { title: "Arabic source 1", notes: englishNotes }, { title: "Arabic source 2", notes: englishNotes },
    ] }, error: null });
    render(<TeacherLectureVideos teacherId="nadia-al-nuaimy" topicKey="nadia-en-ch2-lec2-study" language="ar" contentLanguage="en" isAdmin={false} />);
    fireEvent.click(await screen.findByRole("button", { name: "Open notes" }));
    expect(await screen.findAllByText("What is a cell?")).toHaveLength(2);
    expect(backend.invoke).toHaveBeenCalledWith("english-lecture-questions", {
      body: { topicKey: "nadia-en-ch2-lec2-study", sourceIds: sourceKeys.map((key) => `source-${key}`) },
    });
    expect(screen.getAllByText("Ground Tissue — Section 1").length).toBeGreaterThan(0);
    expect(screen.queryByText("Arabic source 1")).not.toBeInTheDocument();
  });

  it("does not silently open untranslated notes when repair fails", async () => {
    backend.rows.push(row("nadia-en-ch1-lec1-study"));
    backend.invoke.mockResolvedValue({ data: { parts: [{ title: "Notes", notes: arabicNotes }] }, error: null });
    render(<TeacherLectureVideos teacherId="nadia-al-nuaimy" topicKey="nadia-en-ch1-lec1-study" language="en" contentLanguage="en" isAdmin={false} />);
    fireEvent.click(await screen.findByRole("button", { name: "Open notes" }));
    await waitFor(() => expect(backend.error).toHaveBeenCalled());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open notes" })).toBeEnabled();
  });

  it("opens notes with English questions immediately without AI", async () => {
    backend.rows.push(row("nadia-en-ch1-lec1-study", englishNotes));
    render(<TeacherLectureVideos teacherId="nadia-al-nuaimy" topicKey="nadia-en-ch1-lec1-study" language="en" contentLanguage="en" isAdmin={false} />);
    fireEvent.click(await screen.findByRole("button", { name: "Open notes" }));
    expect(await screen.findByText("What is a cell?")).toBeInTheDocument();
    expect(backend.invoke).not.toHaveBeenCalled();
  });

  it("discards a pending translation after the student changes topics", async () => {
    let finish!: (value: unknown) => void;
    backend.invoke.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    backend.rows.push(row("nadia-en-ch1-lec1-study"), row("nadia-en-ch1-lec2-study", englishNotes));
    const { rerender } = render(<TeacherLectureVideos teacherId="nadia-al-nuaimy" topicKey="nadia-en-ch1-lec1-study" language="en" contentLanguage="en" isAdmin={false} />);
    fireEvent.click(await screen.findByRole("button", { name: "Open notes" }));
    expect(await screen.findByRole("button", { name: "Preparing English questions…" })).toBeDisabled();
    rerender(<TeacherLectureVideos teacherId="nadia-al-nuaimy" topicKey="nadia-en-ch1-lec2-study" language="en" contentLanguage="en" isAdmin={false} />);
    await screen.findByRole("button", { name: "Open notes" });
    finish({ data: { parts: [{ title: "Old notes", notes: englishNotes }] }, error: null });
    await waitFor(() => expect(screen.queryByText("What is a cell?")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Open notes" })).toBeEnabled();
  });

  it("keeps Arabic curriculum questions in Arabic", async () => {
    backend.rows.push(row("nadia-ar-ch1-lec1-study"));
    render(<TeacherLectureVideos teacherId="nadia-al-nuaimy" topicKey="nadia-ar-ch1-lec1-study" language="en" contentLanguage="ar" isAdmin={false} />);
    fireEvent.click(await screen.findByRole("button", { name: "Open notes" }));
    expect(await screen.findByText("ما الخلية؟")).toBeInTheDocument();
    expect(backend.invoke).not.toHaveBeenCalled();
  });
});
