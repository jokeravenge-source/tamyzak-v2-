import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";
import { protect } from "../_shared/guard.ts";
import { callTelegramGateway, verifyTamayzakBotConnection } from "../_shared/telegram-gateway.ts";

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const guard = await protect(req, "study-challenge-notify", { max: 10, windowSeconds: 60, maxBytes: 2048 });
  if (!guard.ok) return json({ error: guard.error }, guard.status);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey || !anonKey) return json({ error: "Server configuration is missing" }, 500);

    const authorization = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: auth, error: authError } = await userClient.auth.getUser();
    if (authError || !auth.user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const challengeId = String(body.challengeId ?? "");
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(challengeId)) return json({ error: "Invalid challenge" }, 400);

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: challenge, error: challengeError } = await admin.from("study_challenges")
      .select("id,title,creator_id,ends_at,status,challenge_type,wager_points,room_state").eq("id", challengeId).maybeSingle();
    if (challengeError) return json({ error: challengeError.message }, 500);
    if (!challenge || challenge.creator_id !== auth.user.id) return json({ error: "Challenge not found" }, 404);
    if (challenge.status !== "active" || new Date(challenge.ends_at).getTime() <= Date.now()) return json({ error: "Challenge is not active" }, 409);

    const [{ data: creator }, { data: members, error: memberError }] = await Promise.all([
      admin.from("profiles").select("display_name").eq("user_id", auth.user.id).maybeSingle(),
      admin.from("study_challenge_members").select("user_id").eq("challenge_id", challengeId).eq("status", "pending"),
    ]);
    if (memberError) return json({ error: memberError.message }, 500);
    const inviteeIds = [...new Set((members ?? []).map((member) => String(member.user_id)).filter((id) => id !== auth.user.id))];
    if (inviteeIds.length === 0) return json({ sent: 0, reason: "no_pending_invitees" });

    const creatorName = String(creator?.display_name ?? "A friend").slice(0, 80);
    const challengeTitle = String(challenge.title).slice(0, 80);
    const stakeLine = challenge.challenge_type === "all_or_nothing"
      ? ` Accepting reserves ${Number(challenge.wager_points) || 0} points. | القبول يحجز ${Number(challenge.wager_points) || 0} نقطة من رصيدك.`
      : "";
    let pushOk = false;
    let pushResult: Record<string, unknown> = {};
    try {
      const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: challenge.challenge_type === "all_or_nothing"
            ? "All or Nothing 🔥 | تحدي الكل أو لا شيء"
            : "New study challenge ⚔️ | تحدي دراسة جديد",
          body: `${creatorName} invited you to “${challengeTitle}”.${stakeLine} Open Tamayzak to accept or decline. | ${creatorName} دعاك لتحدي «${challengeTitle}». افتح تميزك للقبول أو الرفض.`,
          link: "/?menu=sessions",
          target_user_ids: inviteeIds,
          message_id: `study-challenge-${challengeId}`,
          replace_existing: true,
        }),
      });
      pushResult = await pushResponse.json().catch(() => ({}));
      pushOk = pushResponse.ok;
    } catch (error) {
      pushResult = { error: error instanceof Error ? error.message : String(error) };
    }

    let telegramSent = 0;
    let telegramFailed = 0;
    let telegramSkipped = 0;
    const bot = await verifyTamayzakBotConnection();
    if (bot.ok) {
      const { data: telegramLinks, error: telegramError } = await admin.from("telegram_verifications")
        .select("user_id,telegram_user_id")
        .in("user_id", inviteeIds)
        .eq("verified", true)
        .not("telegram_user_id", "is", null);

      if (telegramError) {
        telegramFailed = inviteeIds.length;
      } else {
        const linkedIds = new Set((telegramLinks ?? []).map((row) => String(row.user_id)));
        telegramSkipped = inviteeIds.filter((id) => !linkedIds.has(id)).length;
        const safeCreator = escapeHtml(creatorName);
        const safeTitle = escapeHtml(challengeTitle);
        const modeLine = challenge.challenge_type === "all_or_nothing"
          ? `\n🔥 <b>All or Nothing | الكل أو لا شيء</b>\n🪙 ${Number(challenge.wager_points) || 0} points will be reserved when you accept.\nراح تنحجز ${Number(challenge.wager_points) || 0} نقطة من رصيدك عند القبول.`
          : "";
        const message = `⚔️ <b>New Tamayzak study challenge</b>\n<b>تحدي دراسة جديد من تميزك</b>${modeLine}\n\n${safeCreator} invited you to “${safeTitle}”.\n${safeCreator} دعاك لتحدي «${safeTitle}».\n\nOpen Tamayzak to accept or decline.\nافتح تميزك حتى تقبل أو ترفض الدعوة.`;

        for (const link of telegramLinks ?? []) {
          const chatId = Number(link.telegram_user_id);
          if (!Number.isFinite(chatId)) { telegramSkipped++; continue; }
          const { data: delivery, error: reserveError } = await admin
            .from("telegram_notifications_sent")
            .insert({ notification_key: `study-challenge:${challengeId}`, telegram_user_id: chatId })
            .select("id")
            .single();
          if (reserveError || !delivery) { telegramSkipped++; continue; }

          const telegram = await callTelegramGateway("sendMessage", {
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: { inline_keyboard: [[{
              text: "Open Tamayzak | افتح تميزك",
              url: "https://tamyazak.site/?menu=sessions",
            }]] },
          });
          const messageId = Number((telegram.data?.result as { message_id?: unknown } | undefined)?.message_id);
          if (telegram.ok) {
            telegramSent++;
            if (Number.isFinite(messageId) && messageId > 0) {
              await admin.from("telegram_notifications_sent").update({ message_id: messageId }).eq("id", delivery.id);
            }
          } else {
            telegramFailed++;
            await admin.from("telegram_notifications_sent").delete().eq("id", delivery.id);
          }
        }
      }
    } else {
      telegramFailed = inviteeIds.length;
    }

    const response = {
      recipients: inviteeIds.length,
      push: { ok: pushOk, ...pushResult },
      telegram: { sent: telegramSent, failed: telegramFailed, skipped: telegramSkipped, bot: bot.actualUsername },
    };
    if (!pushOk && telegramSent === 0) return json({ error: "Challenge notifications could not be delivered", ...response }, 502);
    return json(response);
  } catch (error) {
    console.error("study-challenge-notify:", error instanceof Error ? error.message : error);
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
