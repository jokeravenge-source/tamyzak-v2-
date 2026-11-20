import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { speechPhrases, usePodcastSpeech } from "./usePodcastSpeech";
const api = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: api.invoke } },
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

it("keeps every word when splitting speech into short phrases", () => {
  const text = "شرح عراقي طويل للمراجعة ".repeat(50).trim();
  const parts = speechPhrases(text);
  expect(parts.join(" ")).toBe(text);
  expect(parts.every((part) => part.length <= 220)).toBe(true);
});

it("pauses during preparation and resumes the same audio position without a new generation", async () => {
  let resolve!: (value: unknown) => void;
  api.invoke.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const hook = renderHook(() => usePodcastSpeech());
  act(() =>
    hook.result.current.play("نراجع الفكرة خطوة خطوة", {
      onEnd: vi.fn(),
      onError: vi.fn(),
    }),
  );
  act(() => hook.result.current.pause());
  await act(async () => {
    resolve({ data: { audio: "YQ==" }, error: null });
  });
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  await act(async () => hook.result.current.resume());
  const audio = vi.mocked(HTMLMediaElement.prototype.play).mock
    .instances[0] as unknown as HTMLMediaElement;
  audio.currentTime = 7;
  act(() => hook.result.current.pause());
  expect(hook.result.current.phrase).toBe("نراجع الفكرة خطوة خطوة");
  await act(async () => hook.result.current.resume());
  expect(audio.currentTime).toBe(7);
  expect(api.invoke).toHaveBeenCalledTimes(1);
  expect(vi.mocked(HTMLMediaElement.prototype.play).mock.instances[1]).toBe(
    audio,
  );
  hook.unmount();
});

it("ignores a late audio response after skipping or stopping", async () => {
  let resolve!: (value: unknown) => void;
  api.invoke.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const end = vi.fn();
  const hook = renderHook(() => usePodcastSpeech());
  act(() => hook.result.current.play("شرح", { onEnd: end, onError: vi.fn() }));
  act(() => hook.result.current.stop());
  await act(async () => {
    resolve({ data: { audio: "YQ==" }, error: null });
  });
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  expect(end).not.toHaveBeenCalled();
  expect(hook.result.current.active).toBe(false);
  hook.unmount();
});

it("advances highlighting with each played audio phrase", async () => {
  api.invoke.mockResolvedValue({ data: { audio: "YQ==" }, error: null });
  const hook = renderHook(() => usePodcastSpeech());
  act(() =>
    hook.result.current.play("فكرة متكررة ".repeat(40), {
      onEnd: vi.fn(),
      onError: vi.fn(),
    }),
  );
  await waitFor(() =>
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1),
  );
  const audio = vi.mocked(HTMLMediaElement.prototype.play).mock
    .instances[0] as unknown as HTMLMediaElement;
  await act(async () => audio.onended?.call(audio, new Event("ended")));
  await waitFor(() => expect(hook.result.current.offset).toBeGreaterThan(0));
  expect(api.invoke).toHaveBeenCalledTimes(3);
  hook.unmount();
});
