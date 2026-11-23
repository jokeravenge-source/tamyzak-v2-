import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { botCanPostBattle, resolvedBattleChatId, telegramGroupTarget } from "../_shared/battle-group-target.ts";
import { makeSessionNotice, type SessionTopic } from "../_shared/session-notice.ts";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";
import { callTelegramGateway, TAMAYZAK_BOT_USERNAME } from "../_shared/telegram-gateway.ts";

Deno.serve(async (req) => {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const url = Deno.env.get("SUPABASE_URL");
  if (req.method !== "POST") return Response.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405 });
  const denied = authenticateCronRequest(req);
  if (denied) return denied;
  if (!key || !url) return Response.json({ error: "SERVER_CONFIG" }, { status: 500 });
  const admin = createClient(url, key);
  try {
    const now = Date.now();
    const { data: slot, error: slotError } = await admin.rpc("_royale_slot", { _at: new Date(now).toISOString() });
    if (slotError || !slot) throw new Error("SLOT_UNAVAILABLE");
    const elapsed = now - Date.parse(slot);
    if (elapsed >= 5 * 60_000) return Response.json({ due: false });
    let kind: "session" | "battle" = "session";
    let winner: SessionTopic | undefined;
    if (elapsed >= 3 * 60_000) {
      kind = "battle";
      const { data: roundId, error } = await admin.rpc("_royale_finalize", { _slot: slot });
      if (error) throw error;
      if (!roundId) return Response.json({ due: false });
      const round = await admin.from("session_royales").select("subject,chapter,language").eq("id", roundId).single();
      if (round.error || !round.data) throw new Error("WINNER_UNAVAILABLE");
      winner = round.data as SessionTopic;
    }
    const { data: config, error: configError } = await admin.from("battle_channel_settings").select("enabled,chat_id,invite_url").eq("id", true).single();
    if (configError) throw new Error("BATTLE_GROUP_CONFIG_UNAVAILABLE");
    const target = config.enabled ? telegramGroupTarget(config.chat_id, config.invite_url ?? "") : null;
    if (!target) return Response.json({ due: true, delivery: "destination_not_configured" });
    const { count, error: lookupError } = await admin.from("session_telegram_posts")
      .select("slot", { count: "exact", head: true }).eq("slot", slot).eq("kind", kind);
    if (lookupError) throw lookupError;
    if (count) return Response.json({ due: true, delivery: "already_reserved" });
    const [me, chat] = await Promise.all([callTelegramGateway("getMe", {}), callTelegramGateway("getChat", { chat_id: target })]);
    const bot = me.data?.result as { id?: number; username?: string } | undefined;
    const destination = chat.data?.result;
    const chatId = resolvedBattleChatId(destination);
    if (!me.ok || !bot?.id || bot.username?.toLowerCase() !== TAMAYZAK_BOT_USERNAME || !chat.ok || !chatId) {
      return Response.json({ error: "BOT_OR_GROUP_UNAVAILABLE" }, { status: 409 });
    }
    const member = await callTelegramGateway("getChatMember", { chat_id: chatId, user_id: bot.id });
    if (!member.ok || !botCanPostBattle(destination, member.data?.result)) return Response.json({ error: "BOT_POST_PERMISSION_REQUIRED" }, { status: 409 });
    const message = makeSessionNotice(slot, Deno.env.get("PUBLIC_SITE_URL") || "https://tamyazak.site", winner);
    if (Date.now() >= Date.parse(slot) + (kind === "battle" ? 5 : 3) * 60_000) return Response.json({ due: false });
    const { data: reservation, error: reserveError } = await admin.from("session_telegram_posts")
      .upsert({ slot, kind }, { onConflict: "slot,kind", ignoreDuplicates: true }).select("slot").maybeSingle();
    if (reserveError) throw reserveError;
    if (!reservation) return Response.json({ due: true, delivery: "already_reserved" });
    const result = await callTelegramGateway("sendMessage", { chat_id: chatId, ...message });
    const messageId = (result.data?.result as { message_id?: number } | undefined)?.message_id;
    const state = result.ok && messageId ? "sent" : result.status >= 400 && result.status < 500 ? "failed" : "unknown";
    const { error } = await admin.from("session_telegram_posts").update({ state, telegram_message_id: messageId ? String(messageId) : null }).eq("slot", slot).eq("kind", kind);
    if (error) throw error;
    return Response.json({ due: true, delivery: state });
  } catch (error) {
    console.error("session-telegram", error);
    return Response.json({ error: "SESSION_POST_FAILED" }, { status: 500 });
  }
});
