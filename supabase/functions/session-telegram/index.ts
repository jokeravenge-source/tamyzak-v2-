import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { botCanPostBattle, resolvedBattleChatId, telegramGroupTarget } from "../_shared/battle-group-target.ts";
import { dueSessionPosts, makeSessionNotice, type SessionNotice, type SessionTopic } from "../_shared/session-notice.ts";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";
import { callTelegramGateway, TAMAYZAK_BOT_USERNAME } from "../_shared/telegram-gateway.ts";

function hasScheduledServiceBearer(req: Request, key: string) {
  // The checked-in pg_cron job uses the service-role key. The platform-managed
  // scheduler can still authenticate with the rotating cron secret.
  const authorization = req.headers.get("authorization") ?? "";
  const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();
  return timingSafeEqual(digest(authorization), digest(`Bearer ${key}`));
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return Response.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405 });
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const url = Deno.env.get("SUPABASE_URL");
  const denied = authenticateCronRequest(req);
  if (denied && !(key && hasScheduledServiceBearer(req, key))) return denied;
  if (!key || !url) return Response.json({ error: "SERVER_CONFIG" }, { status: 500 });

  const admin = createClient(url, key);
  try {
    const now = Date.now();
    const { data: slot, error: slotError } = await admin.rpc("_royale_slot", { _at: new Date(now).toISOString() });
    if (slotError || !slot) throw new Error("SLOT_UNAVAILABLE");
    const slotTime = Date.parse(slot);
    const due = dueSessionPosts(slotTime, now);
    if (!due.length) return Response.json({ due: false });

    const lookup = await admin.from("session_telegram_posts").select("kind").eq("slot", slot).in("kind", due);
    if (lookup.error) throw lookup.error;
    const reserved = new Set(lookup.data?.map((row) => row.kind));
    const pending = due.filter((kind) => !reserved.has(kind));
    if (!pending.length) return Response.json({ due: true, delivery: "already_reserved" });

    const battleDue = pending.includes("battle");
    let winner: SessionTopic | undefined;
    if (battleDue) {
      const { data: roundId, error } = await admin.rpc("_royale_finalize", { _slot: slot });
      if (error) throw error;
      if (!roundId) return Response.json({ due: false });
      const round = await admin.from("session_royales").select("subject,chapter,language").eq("id", roundId).single();
      if (round.error || !round.data) throw new Error("WINNER_UNAVAILABLE");
      winner = round.data as SessionTopic;
    }

    const sessionsChannel = battleDue ? "" : Deno.env.get("SESSION_TELEGRAM_CHAT_ID")?.trim();
    let target: string | null;
    if (sessionsChannel) {
      target = telegramGroupTarget(sessionsChannel, "");
    } else {
      const { data: config, error } = await admin.from("battle_channel_settings").select("enabled,chat_id,invite_url").eq("id", true).single();
      if (error || !config) throw new Error("BATTLE_GROUP_CONFIG_UNAVAILABLE");
      target = config.enabled ? telegramGroupTarget(config.chat_id, config.invite_url ?? "") : null;
    }
    if (!target) return Response.json({ due: true, delivery: "destination_not_configured" });

    const [me, chat] = await Promise.all([callTelegramGateway("getMe", {}), callTelegramGateway("getChat", { chat_id: target })]);
    const bot = me.data?.result as { id?: number; username?: string } | undefined;
    const destination = chat.data?.result;
    const chatId = resolvedBattleChatId(destination);
    if (!me.ok || !bot?.id || bot.username?.toLowerCase() !== TAMAYZAK_BOT_USERNAME || !chat.ok || !chatId) {
      return Response.json({ error: "BOT_OR_GROUP_UNAVAILABLE" }, { status: 409 });
    }
    const member = await callTelegramGateway("getChatMember", { chat_id: chatId, user_id: bot.id });
    if (!member.ok || !botCanPostBattle(destination, member.data?.result)) return Response.json({ error: "BOT_POST_PERMISSION_REQUIRED" }, { status: 409 });

    if (!dueSessionPosts(slotTime, Date.now()).includes(pending[0])) return Response.json({ due: false });
    let studentCount = 0;
    if (!battleDue) {
      const count = await admin.rpc("session_telegram_room_count");
      if (count.error || typeof count.data !== "number" || !Number.isSafeInteger(count.data) || count.data < 0) {
        throw new Error("ROOM_COUNT_UNAVAILABLE");
      }
      studentCount = count.data;
    }

    const origin = Deno.env.get("PUBLIC_SITE_URL") || "https://tamyazak.site";
    const notices: SessionNotice[] = winner
      ? [{ kind: "battle", winner }]
      : pending.flatMap((kind) => kind === "battle" ? [] : [{ kind, studentCount }]);
    const deliveries: Record<string, string> = {};
    for (const notice of notices) {
      const { kind } = notice;
      if (!dueSessionPosts(slotTime, Date.now()).includes(kind)) break;
      const message = makeSessionNotice(slot, origin, notice);
      const reservation = await admin.from("session_telegram_posts")
        .upsert({ slot, kind }, { onConflict: "slot,kind", ignoreDuplicates: true }).select("slot").maybeSingle();
      if (reservation.error) throw reservation.error;
      if (!reservation.data) {
        deliveries[kind] = "already_reserved";
        continue;
      }

      const result = await callTelegramGateway("sendMessage", { chat_id: chatId, ...message });
      const messageId = (result.data?.result as { message_id?: number } | undefined)?.message_id;
      const state = result.ok && messageId ? "sent" : result.status >= 400 && result.status < 500 ? "failed" : "unknown";
      const { error } = await admin.from("session_telegram_posts").update({ state, telegram_message_id: messageId ? String(messageId) : null }).eq("slot", slot).eq("kind", kind);
      if (error) throw error;
      deliveries[kind] = state;
    }
    return Response.json({ due: true, deliveries });
  } catch (error) {
    console.error("session-telegram", error);
    return Response.json({ error: "SESSION_POST_FAILED" }, { status: 500 });
  }
});
