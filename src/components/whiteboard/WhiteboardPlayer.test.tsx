import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { capacitorLesson } from "../../../supabase/functions/_shared/whiteboardCapacitors";
import MutamayizChat from "@/pages/MutamayizChat";
import { setAssistantOwner } from "@/lib/mutamayizConversation";
import { drawingFrame } from "./BoardDrawing";
import WhiteboardPlayer from "./WhiteboardPlayer";

const backend = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: backend.invoke },
    auth: {
      getUser: async () => ({ data: { user: { id: "student-fixture" } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  },
}));

class AudioClip {
  static clips: AudioClip[] = [];
  src = "";
  preload = "";
  currentTime = 0;
  duration = 10;
  paused = true;
  ended = false;
  onplaying: (() => void) | null = null;
  onpause: (() => void) | null = null;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() { AudioClip.clips.push(this); }
  play = vi.fn(async () => {
    this.paused = false;
    this.onplaying?.();
  });
  pause() {
    this.paused = true;
    this.onpause?.();
  }
  removeAttribute(name: string) { if (name === "src") this.src = ""; }
}

const frames = new Map<number, FrameRequestCallback>();
const lesson = capacitorLesson();
const input = { question: "اشرح سعة المتسعة ذات اللوحين", language: "ar" } as const;

beforeEach(() => {
  backend.invoke.mockReset();
  setAssistantOwner(null);
  AudioClip.clips = [];
  frames.clear();
  let frame = 0;
  vi.stubGlobal("Audio", AudioClip);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const handle = ++frame;
    frames.set(handle, callback);
    return handle;
  });
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => frames.delete(handle));
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function tick(audio: AudioClip, time: number) {
  act(() => {
    audio.currentTime = time;
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach(callback => callback(time * 1000));
  });
}

describe("whiteboard playback", () => {
  it("plays the full pilot from signed-in chat, pauses for a question, and returns to the conversation", async () => {
    const reference = lesson.steps[1].reference;
    const studyReply = "خل نشرح شلون المسافة تأثر على سعة المتسعة.";
    backend.invoke.mockImplementation(async (name: string, { body }) => {
      if (name === "tts-speak") return { data: { audio: "YQ==" }, error: null };
      if (body.mode === "whiteboard_lesson") return { data: { lesson }, error: null };
      if (body.mode === "whiteboard_question") {
        return { data: { answer: { reply: "كبر المسافة يزيد المقام ويصغّر السعة.", reference, highlight: "distance" } }, error: null };
      }
      return { data: { reply: studyReply, studyTopic: lesson.title }, error: null };
    });
    render(<MutamayizChat language="ar" />);
    const chatInput = screen.getByRole("textbox", { name: "احچي ويا متميز…" });
    await waitFor(() => expect(chatInput).toBeEnabled());
    fireEvent.change(chatInput, { target: { value: input.question } });
    fireEvent.click(screen.getByRole("button", { name: "إرسال" }));
    fireEvent.click(await screen.findByRole("button", { name: "اشرحلي عالسبورة" }));
    const board = within(await screen.findByRole("dialog", { name: "سبورة متميّز" }));
    fireEvent.click(await board.findByText(/بنك وزاريات تميّزك/));
    expect(board.getByText(reference.quote)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "شغّل الشرح" }));
    await waitFor(() => expect(AudioClip.clips[0].play).toHaveBeenCalledOnce());
    expect(screen.queryByRole("img", { name: /لوحان متوازيان/ })).toBeNull();
    tick(AudioClip.clips[0], 3);
    expect(screen.getByRole("img", { name: "لوحان متوازيان" })).toBeVisible();
    expect(backend.invoke.mock.calls.find(([name]) => name === "tts-speak")).toEqual(["tts-speak", expect.objectContaining({
      body: { text: lesson.steps[0].narration, language: "ar", voice: "fable", speed: 1, purpose: "podcast" },
    })]);

    fireEvent.click(screen.getByRole("button", { name: "الخطوة التالية" }));
    expect(AudioClip.clips[0].paused).toBe(true);
    expect(screen.getByRole("math", { name: "C = εA/d" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "أعِد الخطوة" }));
    await waitFor(() => expect(AudioClip.clips[1].play).toHaveBeenCalledOnce());
    expect(screen.queryByRole("math")).toBeNull();
    const second = AudioClip.clips[1];
    tick(second, 7);
    const equation = screen.getByRole("math", { name: "C = εA/d" });
    expect(equation).toHaveClass("ring-2");

    fireEvent.click(screen.getByRole("button", { name: "إيقاف مؤقت" }));
    expect(second.paused).toBe(true);
    expect(second.currentTime).toBe(7);
    fireEvent.click(screen.getByRole("button", { name: "كمّل الشرح" }));
    expect(second.paused).toBe(false);

    fireEvent.change(screen.getByRole("textbox", { name: "اسأل عن هاي الخطوة" }), { target: { value: "ما فهمت هاي" } });
    fireEvent.click(screen.getByRole("button", { name: "دزّ السؤال" }));
    expect(second.paused).toBe(true);
    const answer = await screen.findByText("كبر المسافة يزيد المقام ويصغّر السعة.");
    expect(equation).not.toHaveClass("ring-2");
    const action = backend.invoke.mock.calls.find(([, params]) => params.body.mode === "whiteboard_question");
    expect(action?.[1].body).toMatchObject({ board: input, step: lesson.steps[1], stepIndex: 1, question: "ما فهمت هاي", visible: expect.arrayContaining(["distance", "equation"]) });
    fireEvent.click(within(answer.closest("section")!).getByRole("button", { name: "كمّل الشرح" }));
    expect(second.paused).toBe(false);
    expect(second.currentTime).toBe(7);

    fireEvent.click(screen.getByRole("button", { name: "الخطوة التالية" }));
    expect(screen.getByRole("img", { name: /المسافة 2d/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "ضعف السعة الأصلية" }));
    expect(screen.getByText(/جرّب مرة ثانية/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "نص السعة الأصلية" }));
    expect(screen.getByText("C₂ = εA/(2d) = C/2")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "الخطوة السابقة" }));
    expect(screen.getByRole("img", { name: /المسافة d/ })).toBeVisible();
    expect(screen.queryByText("C₂ = εA/(2d) = C/2")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "رجوع للمحادثة" }));
    expect(await screen.findByText(studyReply)).toBeVisible();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("preserves all diagrams and the transcript when speech fails", async () => {
    backend.invoke.mockResolvedValue({ data: null, error: new Error("Unavailable") });
    render(<WhiteboardPlayer lesson={lesson} input={input} language="ar" />);
    fireEvent.click(screen.getByRole("button", { name: "شغّل الشرح" }));
    expect(await screen.findByText(/الصوت تعذّر/)).toBeVisible();
    expect(screen.getByText(lesson.steps[0].narration)).toBeVisible();
    expect(screen.getByRole("img", { name: /لوحان متوازيان/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "الخطوة التالية" }));
    expect(screen.getByRole("math", { name: "C = εA/d" })).toBeVisible();
  });

  it("ignores an old pending narration after moving to another step", async () => {
    let ready!: (value: unknown) => void;
    backend.invoke.mockImplementationOnce(() => new Promise(resolve => { ready = resolve; }));
    render(<WhiteboardPlayer lesson={lesson} input={input} language="ar" />);
    fireEvent.click(screen.getByRole("button", { name: "شغّل الشرح" }));
    fireEvent.click(screen.getByRole("button", { name: "الخطوة التالية" }));
    await act(async () => ready({ data: { audio: "YQ==" }, error: null }));
    expect(AudioClip.clips[0].play).not.toHaveBeenCalled();
    expect(screen.getByRole("math", { name: "C = εA/d" })).toBeVisible();
  });

  it("moves only the gap as the audio reaches the doubling cue", () => {
    const before = drawingFrame(lesson, 2, 0.3);
    const moving = drawingFrame(lesson, 2, 0.48);
    const after = drawingFrame(lesson, 2, 1);
    expect(before.gap).toBe(0);
    expect(moving.gap).toBeGreaterThan(0);
    expect(moving.gap).toBeLessThan(1);
    expect(after.gap).toBe(1);
    expect(after.visible).toEqual(before.visible);
    expect(after.equation).toBe(before.equation);
  });
});
