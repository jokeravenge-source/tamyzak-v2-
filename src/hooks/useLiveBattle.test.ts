import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useLiveBattle } from "./useLiveBattle";
import type { LiveBattleQuestion } from "@/lib/liveBattleBank";

const api = vi.hoisted(() => ({ channel: vi.fn(), remove: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { channel: api.channel, removeChannel: api.remove } }));
type Fake = { room: string; id: string; tracked: boolean; name: string; handlers: { type: string; event: string; fn: (payload?: unknown) => void }[]; track: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; on: ReturnType<typeof vi.fn>; subscribe: ReturnType<typeof vi.fn>; presenceState: () => Record<string, { name: string }[]> };
let channels: Fake[];
const sync = (room: string) => channels.filter((c) => c.room === room && c.tracked).forEach((c) => c.handlers.filter((h) => h.type === "presence").forEach((h) => h.fn()));
beforeEach(() => {
  vi.useFakeTimers(); vi.clearAllMocks(); channels = [];
  api.channel.mockImplementation((room, options) => {
    const ch: Fake = {
      room, id: options.config.presence.key, tracked: false, name: "", handlers: [],
      presenceState: () => Object.fromEntries(channels.filter((c) => c.room === room && c.tracked).map((c) => [c.id, [{ name: c.name }]])),
      on: vi.fn((type, filter, fn) => { ch.handlers.push({ type, event: filter.event, fn }); return ch; }),
      track: vi.fn(async ({ name }) => { ch.name = name; ch.tracked = true; sync(room); }),
      subscribe: vi.fn((fn) => { void fn("SUBSCRIBED"); return ch; }),
      send: vi.fn(async ({ event, payload }) => {
        channels.filter((other) => other !== ch && other.room === room && other.tracked).forEach((other) => other.handlers.filter((h) => h.type === "broadcast" && h.event === event).forEach((h) => h.fn({ payload })));
        return "ok";
      }),
    };
    channels.push(ch); return ch;
  });
  api.remove.mockImplementation(async (ch: Fake) => { ch.tracked = false; sync(ch.room); });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });
const questions: LiveBattleQuestion[] = Array.from({ length: 3 }, (_, i) => ({ id: `q-${i}`, q: `Original ${i}`, choices: ["Yes", "No"], answer: i % 2, subject: "physics" }));
async function pair() {
  const host = renderHook(() => useLiveBattle("Host"));
  const guest = renderHook(() => useLiveBattle("Guest"));
  await act(async () => { host.result.current.connect("123456", true, questions); guest.result.current.connect("123456", false); });
  expect(host.result.current.phase).toBe("countdown"); expect(guest.result.current.phase).toBe("countdown");
  act(() => vi.advanceTimersByTime(3000));
  expect(host.result.current.phase).toBe("playing"); expect(guest.result.current.phase).toBe("playing");
  return { host, guest };
}
it("gives both students the host's bank questions and advances once after both answer", async () => {
  const { host, guest } = await pair();
  expect(guest.result.current.questions).toEqual(questions);
  act(() => { expect(host.result.current.answer(0)).toBe(true); expect(guest.result.current.answer(1)).toBe(false); });
  expect(host.result.current.scores).toEqual(guest.result.current.scores);
  expect(host.result.current.scores[host.result.current.meId]).toBe(1);
  act(() => vi.advanceTimersByTime(800));
  expect(host.result.current.index).toBe(1); expect(guest.result.current.index).toBe(1);
  act(() => sync("battle:123456"));
  expect(host.result.current.phase).toBe("playing"); expect(host.result.current.index).toBe(1);
  // A repeated answer for the previous question cannot score or advance the new one.
  await act(async () => { await channels[1].send({ event: "answer", payload: { playerId: guest.result.current.meId, qIdx: 0, choice: 0 } }); });
  expect(host.result.current.scores[guest.result.current.meId] ?? 0).toBe(0);
  act(() => { expect(host.result.current.answer(1)).toBe(true); expect(host.result.current.answer(1)).toBeNull(); expect(guest.result.current.answer(1)).toBe(true); });
  act(() => vi.advanceTimersByTime(800));
  expect(host.result.current.index).toBe(2); expect(guest.result.current.index).toBe(2);
  act(() => { host.result.current.answer(0); guest.result.current.answer(0); });
  act(() => vi.advanceTimersByTime(800));
  expect(host.result.current.phase).toBe("done"); expect(guest.result.current.phase).toBe("done");
  expect(host.result.current.scores[host.result.current.meId]).toBe(3);
  expect(host.result.current.scores[guest.result.current.meId]).toBe(2);
});
it("advances on timeout without allowing a late answer", async () => {
  const { host, guest } = await pair();
  act(() => vi.advanceTimersByTime(25000));
  act(() => { expect(host.result.current.answer(0)).toBeNull(); });
  act(() => vi.advanceTimersByTime(800));
  expect(host.result.current.index).toBe(1); expect(guest.result.current.index).toBe(1);
});
it("ends a disconnected match without declaring a win and cancels scheduled advancement", async () => {
  const { host, guest } = await pair();
  act(() => { host.result.current.answer(0); guest.result.current.answer(0); });
  await act(async () => { guest.unmount(); });
  expect(host.result.current.phase).toBe("disconnected");
  act(() => vi.advanceTimersByTime(1000));
  expect(host.result.current.index).toBe(0);
});

it("does not skip a question when both answers and the expiry timer race", async () => {
  const { host, guest } = await pair();
  act(() => vi.advanceTimersByTime(24500));
  act(() => { host.result.current.answer(0); guest.result.current.answer(0); });
  act(() => vi.advanceTimersByTime(1500));
  expect(host.result.current.index).toBe(1); expect(guest.result.current.index).toBe(1);
});
it("accepts the previous answer message during a cached-client rollout", async () => {
  const { host, guest } = await pair();
  act(() => host.result.current.answer(0));
  await act(async () => { await channels[1].send({ event: "answer", payload: { playerId: guest.result.current.meId, qIdx: 0, correct: true } }); });
  expect(host.result.current.scores[guest.result.current.meId]).toBe(1);
  expect(channels[0].send).toHaveBeenCalledWith(expect.objectContaining({ event: "answer", payload: expect.objectContaining({ choice: 0, correct: true }) }));
  act(() => vi.advanceTimersByTime(800));
  expect(host.result.current.index).toBe(1);
});
