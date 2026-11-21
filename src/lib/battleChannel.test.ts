import { beforeEach, expect, it, vi } from "vitest";
const api = vi.hoisted(() => ({ rpc: vi.fn(), invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: api.rpc, functions: { invoke: api.invoke } } }));
import { getBattleChannelConfig, joinChannelBattle, parseChannelBattle, publishChannelBattle } from "./battleChannel";
const room = { id: "10000000-0000-4000-8000-000000000001", room_key: "20000000-0000-4000-8000-000000000001", host_name: "Host", subject: "physics", chapter: 2, language: "en", question_count: 10, status: "waiting", expires_at: "2026-11-21T18:03:00Z", server_now: "2026-11-21T18:00:00Z", is_host: true };
beforeEach(() => vi.resetAllMocks());
it("keeps existing battles usable until the optional channel migration is deployed", async () => {
  api.rpc.mockResolvedValue({ error: { message: "function unavailable" } });
  expect(await getBattleChannelConfig()).toEqual({ enabled: false, invite_url: "" });
});
it("sends only selected settings and a retry id, never a client display name or channel destination", async () => {
  api.invoke.mockResolvedValue({ data: { room }, error: null });
  const settings = { subject: "physics", chapter: 2, language: "en" as const, question_count: 10 };
  await publishChannelBattle(room.id, settings);
  expect(api.invoke).toHaveBeenCalledWith("battle-channel", { body: { action: "publish", id: room.id, ...settings } });
});
it("surfaces the server's first-claim rejection and rejects malformed room responses", async () => {
  api.invoke.mockResolvedValue({ data: null, error: { context: { json: async () => ({ error: "ROOM_TAKEN" }) } } });
  await expect(joinChannelBattle(room.id)).rejects.toThrow("ROOM_TAKEN");
  expect(() => parseChannelBattle({ ...room, room_key: undefined })).toThrow("INVALID_ROOM");
  expect(() => parseChannelBattle({ ...room, question_count: 100 })).toThrow("INVALID_ROOM");
});
