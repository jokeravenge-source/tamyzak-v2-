import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import PodcastTutor from "./PodcastTutor";
const api = vi.hoisted(() => ({ invoke: vi.fn(), extract: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: api.invoke } },
}));
vi.mock("@/lib/fileText", () => ({
  materializeFile: async (file: File) => file,
  extractStudyMaterial: api.extract,
}));
vi.mock("@/components/PodcastPractice", () => ({
  default: () => <div>Practice offer</div>,
}));
beforeEach(() => {
  vi.clearAllMocks();
  api.invoke.mockImplementation(async (name: string) => ({
    data:
      name === "create-podcast-session"
        ? { session_id: "pdf-session" }
        : { sessions: [] },
    error: null,
  }));
  api.extract.mockResolvedValue({
    text: "PDF scientific source",
    pageImages: ["data:image/jpeg;base64,YQ=="],
  });
});
afterEach(() => vi.restoreAllMocks());

it("uploads a PDF source, including page images, instead of a YouTube link", async () => {
  const view = render(<PodcastTutor language="ar" onBack={vi.fn()} />);
  const file = new File(["test"], "lesson.pdf", { type: "application/pdf" });
  fireEvent.change(screen.getByLabelText(/ملف المراجعة PDF/), {
    target: { files: [file] },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "أنشئ جلستي الصوتية" }).closest("form")!,
  );
  await waitFor(() =>
    expect(api.invoke).toHaveBeenCalledWith("create-podcast-session", {
      body: expect.objectContaining({
        pdf_name: "lesson.pdf",
        pdf_text: "PDF scientific source",
        pdf_images: ["data:image/jpeg;base64,YQ=="],
      }),
    }),
  );
  expect(api.extract).toHaveBeenCalledWith(file, {
    maxPages: 20,
    maxChars: 90000,
    complete: true,
  });
  const body = api.invoke.mock.calls.find(
    (call) => call[0] === "create-podcast-session",
  )![1].body;
  expect(body).not.toHaveProperty("youtube_url");
  view.unmount();
});

it("keeps the same section after a partial answer and returns to the understanding check", async () => {
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    window.setTimeout(() => this.onended?.call(this, new Event("ended")), 0);
    return Promise.resolve();
  });
  const session = {
    id: "review",
    title: "Test PDF",
    subject: "الفيزياء",
    status: "ready",
    created_at: "2026-11-20",
    completed_at: null,
    youtube_url: "",
  };
  const sections = Array.from({ length: 3 }, (_, i) => ({
    id: `section-${i}`,
    session_id: "review",
    segment_order: i + 1,
    narration_text: "شرح علمي واضح",
    checkpoint_prompt: `سؤال فهم ${i}`,
    student_answer_text: null,
    verdict: null,
    correction_text: null,
    narration_audio_url: null,
    completed_at: null,
  }));
  api.invoke.mockImplementation(
    async (name: string, options: { body?: { session_id?: string } }) => {
      if (name === "get-session-status")
        return {
          data: options?.body?.session_id
            ? { session, segments: sections }
            : { sessions: [session] },
          error: null,
        };
      if (name === "tts-speak")
        return { data: { audio: "YQ==", mime: "audio/mp3" }, error: null };
      return {
        data: {
          student_answer_text: "ملخص ناقص",
          verdict: "partial",
          correction_text: "تذكر العلاقة بين الأفكار",
          session_completed: false,
        },
        error: null,
      };
    },
  );
  const view = render(<PodcastTutor language="ar" onBack={vi.fn()} />);
  fireEvent.click((await screen.findByText("Test PDF")).closest("button")!);
  fireEvent.click(
    await screen.findByRole("button", { name: "تشغيل الشرح الصوتي" }),
  );
  const input = await screen.findByRole("textbox");
  expect(api.invoke).toHaveBeenCalledWith("tts-speak", {
    body: expect.objectContaining({ purpose: "podcast", voice: "onyx", speed: 1 }),
  });
  fireEvent.change(input, { target: { value: "ملخص ناقص" } });
  fireEvent.click(screen.getByRole("button", { name: "أرسل الإجابة" }));
  await screen.findByText("تذكر العلاقة بين الأفكار");
  await screen.findByRole("button", { name: "أرسل الإجابة" });
  expect(screen.getByText("سؤال فهم 0")).toBeInTheDocument();
  expect(
    api.invoke.mock.calls.filter(
      (call) => call[0] === "get-session-status" && call[1]?.body?.session_id,
    ),
  ).toHaveLength(1);
  view.unmount();
});
