import { expect, it, vi } from "vitest";
import { battleChannelMessage, forwardedChannelId, sendBattleChannelPost } from "../../supabase/functions/_shared/battle-channel-message";
const room = { id: "10000000-0000-4000-8000-000000000001", host_name: "Ali <script>&", subject: "physics", chapter: 2, language: "en", question_count: 10, status: "waiting", expires_at: "2026-11-21T18:03:00Z" };
it("posts the selected round details with an escaped name and a direct invite, never answer keys", () => {
  const post = battleChannelMessage(room);
  expect(post.text).toContain("Ali &lt;script&gt;&amp;");
  expect(post.text).toContain("الفيزياء"); expect(post.text).toContain("الفصل 2"); expect(post.text).toContain("10 سؤال MCQ");
  const url = new URL(post.reply_markup.inline_keyboard[0][0].url);
  expect(url.origin).toBe("https://tamyazak.site"); expect(url.searchParams.get("battle")).toBe(room.id); expect(url.searchParams.get("menu")).toBe("liveBattle");
  expect(JSON.stringify(post)).not.toContain("room_key"); expect(JSON.stringify(post)).not.toContain("answer_key");
});
it("removes the join button for full, cancelled, expired and started rooms", () => {
  for (const status of ["claimed", "started", "cancelled", "expired"]) expect(battleChannelMessage({ ...room, status }).reply_markup.inline_keyboard).toEqual([]);
});
it("distinguishes a confirmed post from an uncertain delivery without retrying a second message", async () => {
  const gateway = vi.fn().mockResolvedValueOnce({ ok: true, status: 200, data: { result: { message_id: 123 } }, error: null })
    .mockResolvedValueOnce({ ok: false, status: 0, data: null, error: "timeout" })
    .mockResolvedValueOnce({ ok: false, status: 403, data: null, error: "forbidden" });
  expect(await sendBattleChannelPost(room, "-1001234567890", gateway)).toEqual({ state: "sent", messageId: 123 });
  expect((await sendBattleChannelPost(room, "-1001234567890", gateway)).state).toBe("unknown");
  expect((await sendBattleChannelPost(room, "-1001234567890", gateway)).state).toBe("failed");
  expect(gateway).toHaveBeenCalledTimes(3);
});
it("returns only an authentic forwarded channel id for the admin setup helper", () => {
  expect(forwardedChannelId({ forward_origin: { type: "channel", chat: { id: -1001234567890, type: "channel" } } })).toBe("-1001234567890");
  expect(forwardedChannelId({ text: "-1001234567890" })).toBeNull();
  expect(forwardedChannelId({ forward_origin: { type: "user", chat: { id: -1001234567890, type: "channel" } } })).toBeNull();
});
