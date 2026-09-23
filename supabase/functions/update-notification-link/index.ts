import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

function cleanLink(value: unknown): string | null {
  const link = String(value ?? "").trim().slice(0, 500);
  if (!link) return null;
  const parsed = new URL(link);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("invalid_link");
  return parsed.toString();
}

async function editTelegramButton(chatId: number, messageId: number, link: string | null) {
  const res = await fetch(`${GATEWAY_URL}/editMessageReplyMarkup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")!}`,
      "X-Connection-Api-Key": Deno.env.get("TELEGRAM_API_KEY")!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      reply_markup: link ? { inline_keyboard: [[{ text: "Open", url: link }]] } : { inline_keyboard: [] },
    }),
  });
  const data = await res.json().catch(() => ({}));
  return res.ok && data?.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return json({ error: auth.error }, auth.status);

    const body = await req.json().catch(() => ({}));
    const notificationId = String(body.notification_id ?? "").trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(notificationId)) {
      return json({ error: "invalid_notification_id" }, 400);
    }

    let link: string | null;
    try {
      link = cleanLink(body.link);
    } catch {
      return json({ error: "Link must start with http:// or https://" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: notification, error: readError } = await admin
      .from("notifications")
      .select("id, title, body, telegram_sent, push_sent")
      .eq("id", notificationId)
      .maybeSingle();
    if (readError) return json({ error: readError.message }, 500);
    if (!notification) return json({ error: "notification_not_found" }, 404);

    const { error: updateError } = await admin
      .from("notifications")
      .update({ link, link_updated_at: new Date().toISOString() })
      .eq("id", notificationId);
    if (updateError) return json({ error: updateError.message }, 500);

    let telegramEdited = 0;
    let telegramFailed = 0;
    let telegramLegacy = 0;
    if (notification.telegram_sent) {
      const { data: deliveries, error: deliveriesError } = await admin
        .from("telegram_notifications_sent")
        .select("telegram_user_id, message_id")
        .eq("notification_key", `notif:${notificationId}`);
      if (deliveriesError) return json({ error: deliveriesError.message }, 500);
      for (const delivery of deliveries ?? []) {
        const chatId = Number(delivery.telegram_user_id);
        const messageId = Number(delivery.message_id);
        if (!Number.isFinite(messageId) || messageId <= 0) {
          telegramLegacy++;
          continue;
        }
        try {
          if (await editTelegramButton(chatId, messageId, link)) telegramEdited++;
          else telegramFailed++;
        } catch {
          telegramFailed++;
        }
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
    }

    let push: unknown = null;
    let pushError: string | null = null;
    if (notification.push_sent) {
      const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: notification.title,
          body: notification.body,
          link,
          message_id: notificationId,
          replace_existing: true,
        }),
      });
      push = await pushResponse.json().catch(() => ({ error: "push_response_invalid" }));
      if (!pushResponse.ok) pushError = "The link was saved, but the corrected push could not be delivered.";
    }

    return json({
      ok: true,
      link,
      telegram: { edited: telegramEdited, failed: telegramFailed, legacy: telegramLegacy },
      push,
      push_error: pushError,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
