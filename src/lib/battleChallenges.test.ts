import { beforeEach, expect, it, vi } from "vitest";
import { searchBattleStudents, sendBattleChallenge, respondToBattleChallenge, type BattleInvitation } from "./battleChallenges";
const api = vi.hoisted(() => ({ user: vi.fn(), from: vi.fn(), select: vi.fn(), neq: vi.fn(), ilike: vi.fn(), insert: vi.fn(), eq: vi.fn(), gte: vi.fn(), respond: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: api.user }, from: api.from } }));
beforeEach(() => {
  vi.clearAllMocks(); api.user.mockResolvedValue({ data: { user: { id: "me" } } });
  api.respond.mockResolvedValue({ data: { id: "invite" }, error: null });
  api.from.mockImplementation((table: string) => {
    let updating = false;
    const q = {
      select: (...a: unknown[]) => { api.select(...a); return q; }, neq: (...a: unknown[]) => { api.neq(...a); return q; }, ilike: (...a: unknown[]) => { api.ilike(...a); return q; },
      order: () => q, limit: () => q, eq: (...a: unknown[]) => { api.eq(...a); return q; }, gte: (...a: unknown[]) => { api.gte(...a); return q; },
      insert: (...a: unknown[]) => { api.insert(...a); return q; }, update: () => { updating = true; return q; },
      maybeSingle: async () => updating ? api.respond() : { data: { display_name: "My official name" }, error: null },
      single: async () => ({ data: { id: "invite" }, error: null }),
      abortSignal: async () => ({ data: table === "profiles" ? [{ user_id: "friend", display_name: "Ali" }] : [], error: null }),
    }; return q;
  });
});
it("searches only public names, excludes self and strips wildcard characters", async () => {
  const rows = await searchBattleStudents("Al%_i\\", new AbortController().signal);
  expect(rows[0].display_name).toBe("Ali");
  expect(api.select).toHaveBeenCalledWith("user_id,display_name"); expect(api.neq).toHaveBeenCalledWith("user_id", "me"); expect(api.ilike).toHaveBeenCalledWith("display_name", "%Ali%");
});
it("does not send self-invites and sends the actual bank settings using the saved sender name", async () => {
  const settings = { code: "123456", subject: "english", chapter: 0, language: "en" as const, count: 3 };
  await expect(sendBattleChallenge("me", settings)).rejects.toThrow(); expect(api.insert).not.toHaveBeenCalled();
  expect(await sendBattleChallenge("friend", settings)).toBe("invite");
  expect(api.insert).toHaveBeenCalledWith({ from_user_id: "me", to_user_id: "friend", from_name: "My official name", room_code: "123456", subject: "english", chapter: 0, language: "en", question_count: 3, status: "pending" });
});
it("rejects an expired or already-cancelled invitation instead of accepting an empty update", async () => {
  api.respond.mockResolvedValue({ data: null, error: null });
  await expect(respondToBattleChallenge({ id: "invite" } as BattleInvitation, "recipient", true)).rejects.toThrow("INVITE_EXPIRED");
  expect(api.eq).toHaveBeenCalledWith("to_user_id", "recipient"); expect(api.eq).toHaveBeenCalledWith("status", "pending"); expect(api.gte).toHaveBeenCalledWith("created_at", expect.any(String));
});
