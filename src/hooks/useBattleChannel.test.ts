import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useBattleChannel } from "./useBattleChannel";
import type { ChannelBattle } from "@/lib/battleChannel";
const api = vi.hoisted(() => ({ config: vi.fn(), get: vi.fn(), publish: vi.fn(), join: vi.fn(), close: vi.fn(), sync: vi.fn(), channel: vi.fn(), remove: vi.fn() }));
vi.mock("@/lib/battleChannel", () => ({ getBattleChannelConfig: api.config, getChannelBattle: api.get, publishChannelBattle: api.publish, joinChannelBattle: api.join, closeChannelBattle: api.close, syncChannelBattle: api.sync }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { channel: api.channel, removeChannel: api.remove } }));
const room: ChannelBattle = { id: "10000000-0000-4000-8000-000000000001", room_key: "20000000-0000-4000-8000-000000000001", host_name: "Host", subject: "physics", chapter: 2, language: "en", question_count: 10, status: "waiting", expires_at: "2026-11-21T18:03:00Z", server_now: "2026-11-21T18:00:00Z", is_host: true };
beforeEach(() => {
  vi.useFakeTimers(); vi.spyOn(crypto, "randomUUID").mockReturnValue(room.id as ReturnType<typeof crypto.randomUUID>); vi.setSystemTime(new Date(room.server_now)); vi.clearAllMocks();
  api.config.mockResolvedValue({ enabled: true, invite_url: "https://t.me/+test" }); api.publish.mockResolvedValue(room); api.get.mockResolvedValue(room);
  api.join.mockResolvedValue({ ...room, status: "claimed", is_host: false }); api.close.mockResolvedValue({ ...room, status: "cancelled" }); api.sync.mockResolvedValue(undefined);
  api.channel.mockImplementation(() => { const channel = { on: vi.fn(() => channel), subscribe: vi.fn(() => channel) }; return channel; });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });
const settings = { subject: "physics", chapter: 2, language: "en" as const, question_count: 10 };
it("keeps the host alive even when read polls coincide with heartbeat times, and connects once on claim", async () => {
  const connect = vi.fn(); const view = renderHook(() => useBattleChannel(connect, vi.fn()));
  await act(async () => { await view.result.current.publish(settings); });
  expect(connect).not.toHaveBeenCalled();
  await act(async () => vi.advanceTimersByTimeAsync(10000));
  expect(api.get.mock.calls.filter((args) => args[1] === true).length).toBeGreaterThanOrEqual(2);
  api.get.mockResolvedValue({ ...room, status: "claimed" });
  await act(async () => vi.advanceTimersByTimeAsync(5000));
  expect(connect).toHaveBeenCalledOnce();
  await act(async () => vi.advanceTimersByTimeAsync(10000));
  expect(connect).toHaveBeenCalledOnce();
  act(() => view.result.current.cancel()); expect(api.close).toHaveBeenCalledWith(room.id);
});
it("joins the exact room as guest and never cancels the host's invitation on guest exit", async () => {
  const connect = vi.fn(); const view = renderHook(() => useBattleChannel(connect, vi.fn()));
  await act(async () => { await view.result.current.join(room.id); });
  expect(api.join).toHaveBeenCalledWith(room.id); expect(connect).toHaveBeenCalledWith(expect.objectContaining({ room_key: room.room_key, is_host: false }));
  view.unmount(); expect(api.close).not.toHaveBeenCalled();
});
it("closes a host request that finishes publishing after cancellation without reconnecting", async () => {
  let resolve!: (value: ChannelBattle) => void;
  api.publish.mockReturnValue(new Promise<ChannelBattle>((done) => { resolve = done; }));
  const connect = vi.fn(); const view = renderHook(() => useBattleChannel(connect, vi.fn()));
  act(() => { void view.result.current.publish(settings); });
  act(() => view.result.current.cancel());
  await act(async () => resolve(room));
  expect(view.result.current.room).toBeNull(); expect(connect).not.toHaveBeenCalled(); expect(api.close).toHaveBeenCalledWith(room.id);
});
it("closes expired waiting screens and asks the server to remove the join button", async () => {
  const unavailable = vi.fn(); const view = renderHook(() => useBattleChannel(vi.fn(), unavailable));
  await act(async () => { await view.result.current.publish(settings); });
  api.get.mockResolvedValue({ ...room, status: "expired" });
  await act(async () => vi.advanceTimersByTimeAsync(5000));
  expect(unavailable).toHaveBeenCalledOnce(); expect(view.result.current.room).toBeNull(); expect(api.sync).toHaveBeenCalledWith(room.id);
});
