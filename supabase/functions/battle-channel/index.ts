import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { requireAdmin, requireUser } from "../_shared/auth.ts";
import { protect } from "../_shared/guard.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { callTelegramGateway, TAMAYZAK_BOT_USERNAME, verifyTamayzakBotConnection } from "../_shared/telegram-gateway.ts";
import { botCanPostToGroup, isTelegramGroupLink, resolvedGroupId, telegramGroupTarget } from "../_shared/battle-group-target.ts";
import { battleChannelMessage, sendBattleChannelPost } from "../_shared/battle-channel-message.ts";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  const auth = await requireUser(req);
  if (!auth.ok) return json({ error: "AUTH_REQUIRED" }, auth.status);
  const guard = await protect(req, "battle-channel", { max: 30, windowSeconds: 60, maxBytes: 4096 });
  if (!guard.ok) return json({ error: "RATE_LIMIT" }, guard.status);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const caller = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization")! } } });
  const origin = Deno.env.get("PUBLIC_SITE_URL") || "https://tamyazak.site";
  const syncPost = async (id: string) => {
    const { data: room } = await admin.from("channel_battles").select("*").eq("id", id).maybeSingle();
    if (!room || room.telegram_state !== "sent" || !room.telegram_message_id || room.status === "waiting" || room.telegram_synced_status === room.status) return;
    const result = await callTelegramGateway("editMessageText", { chat_id: room.telegram_chat_id, message_id: room.telegram_message_id, ...battleChannelMessage(room, origin) });
    if (result.ok || result.error?.includes("message is not modified")) await admin.from("channel_battles").update({ telegram_synced_status: room.status }).eq("id", id);
  };
  try {
    const body = await req.json();
    if (["admin_get", "configure"].includes(body.action)) {
      const permission = await requireAdmin(req);
      if (!permission.ok) return json({ error: "ADMIN_REQUIRED" }, permission.status);
      if (body.action === "admin_get") {
        const { data, error } = await admin.from("battle_channel_settings").select("enabled,chat_id,invite_url").eq("id", true).single();
        if (error) throw new Error("CONFIG_UNAVAILABLE");
        return json({ ...data, bot_username: TAMAYZAK_BOT_USERNAME });
      }
      const enabled = body.enabled === true;
      const chatId = String(body.chat_id ?? "").trim();
      const invite = String(body.invite_url ?? "").trim();
      const target = telegramGroupTarget(chatId, invite);
      if (enabled && !target) return json({ error: "INVALID_GROUP_ID" }, 400);
      if (invite && !isTelegramGroupLink(invite)) return json({ error: "INVALID_GROUP_LINK" }, 400);
      let destination = target || chatId;
      if (enabled) {
        const bot = await verifyTamayzakBotConnection();
        if (!bot.ok) return json({ error: bot.error }, 503);
        const me = await callTelegramGateway("getMe", {});
        const user = me.data?.result as { id?: number } | undefined;
        const chat = await callTelegramGateway("getChat", { chat_id: target });
        if (!chat.ok) return json({ error: "GROUP_UNAVAILABLE" }, 409);
        const groupId = resolvedGroupId(chat.data?.result);
        if (!groupId) return json({ error: "GROUP_REQUIRED" }, 409);
        const member = await callTelegramGateway("getChatMember", { chat_id: groupId, user_id: user?.id });
        if (!member.ok || !botCanPostToGroup(chat.data?.result, member.data?.result)) return json({ error: "BOT_GROUP_PERMISSION_REQUIRED" }, 409);
        destination = groupId;
      }
      const { error } = await admin.from("battle_channel_settings").update({ enabled, chat_id: destination, invite_url: invite, updated_at: new Date().toISOString() }).eq("id", true);
      if (error) throw new Error("CONFIG_SAVE_FAILED");
      return json({ ok: true });
    }
    const id = String(body.id ?? "");
    if (!uuid.test(id)) return json({ error: "INVALID_ROOM" }, 400);
    if (body.action === "publish") {
      const { data: config, error: configError } = await admin.from("battle_channel_settings").select("enabled,chat_id").eq("id", true).single();
      if (configError || !config?.enabled || !config.chat_id) return json({ error: "CHANNEL_UNAVAILABLE" }, 409);
      // Resolve the stored destination before posting: group permissions are not
      // channel can_post_messages rights, and private chats are never accepted.
      const chat = await callTelegramGateway("getChat", { chat_id: config.chat_id });
      if (!chat.ok) return json({ error: "GROUP_UNAVAILABLE" }, 409);
      const groupId = resolvedGroupId(chat.data?.result);
      if (!groupId) return json({ error: "GROUP_REQUIRED" }, 409);
      if (groupId !== config.chat_id) await admin.from("battle_channel_settings").update({ chat_id: groupId }).eq("id", true).eq("chat_id", config.chat_id);
      const { data: room, error } = await caller.rpc("create_channel_battle", { _id: id, _subject: body.subject, _chapter: body.chapter, _language: body.language, _question_count: body.question_count });
      if (error) return json({ error: error.message }, 409);
      if (room.status !== "waiting") return json({ error: "ROOM_EXPIRED" }, 409);
      const { data: reservation, error: reservationError } = await admin.from("channel_battles").update({ telegram_state: "sending", telegram_chat_id: groupId }).eq("id", id).eq("host_user_id", auth.userId).eq("telegram_state", "pending").eq("status", "waiting").select("id").maybeSingle();
      if (reservationError) throw new Error("PUBLISH_FAILED");
      if (!reservation) {
        const { data: previous } = await admin.from("channel_battles").select("telegram_state").eq("id", id).eq("host_user_id", auth.userId).single();
        return previous?.telegram_state === "sent" ? json({ room }) : json({ error: "PUBLISH_UNCONFIRMED" }, 409);
      }
      const delivery = await sendBattleChannelPost(room, groupId, callTelegramGateway, origin);
      const { error: saveError } = await admin.from("channel_battles").update({ telegram_state: delivery.state, telegram_message_id: delivery.messageId }).eq("id", id);
      if (saveError || delivery.state !== "sent") {
        await caller.rpc("close_channel_battle", { _id: id });
        return json({ error: delivery.state === "unknown" || saveError ? "PUBLISH_UNCONFIRMED" : "PUBLISH_FAILED" }, 503);
      }
      await syncPost(id);
      return json({ room });
    }
    if (body.action === "join") {
      const { data: room, error } = await caller.rpc("claim_channel_battle", { _id: id });
      if (error) {
        // Settle an expired room on behalf of its owner only when it is stale.
        const { data: expired } = await admin.from("channel_battles").update({ status: "expired" }).eq("id", id).in("status", ["waiting", "claimed"]).or(`expires_at.lte.${new Date().toISOString()},host_seen_at.lt.${new Date(Date.now() - 35000).toISOString()}`).select("id").maybeSingle();
        if (expired) await syncPost(id);
        return json({ error: error.message }, 409);
      }
      await syncPost(id);
      return json({ room });
    }
    if (["close", "sync"].includes(body.action)) {
      const { data: room, error } = body.action === "close" ? await caller.rpc("close_channel_battle", { _id: id, _started: body.started === true }) : await caller.rpc("get_channel_battle", { _id: id });
      if (error) return json({ error: error.message }, 409);
      await syncPost(id);
      return json({ room });
    }
    return json({ error: "INVALID_ACTION" }, 400);
  } catch {
    return json({ error: "CHANNEL_REQUEST_FAILED" }, 500);
  }
});
