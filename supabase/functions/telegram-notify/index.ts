import { protect } from "../_shared/guard.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";
// Each run sends one batch, then hands the rest to a fresh run, so big
// broadcasts never hit the server time limit.
const BATCH_SIZE = 400;
const CONCURRENCY = 8;
const MAX_HOPS = 30;

async function tgSend(chatId: number, text: string, link?: string | null, photoUrl?: string | null, videoUrl?: string | null) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY")!;
  const endpoint = videoUrl ? "sendVideo" : photoUrl ? "sendPhoto" : "sendMessage";
  const body: Record<string, unknown> = videoUrl
    ? { chat_id: chatId, video: videoUrl, caption: text, parse_mode: "HTML", supports_streaming: true }
    : photoUrl
      ? { chat_id: chatId, photo: photoUrl, caption: text, parse_mode: "HTML" }
      : { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: false };
  if (link) body.reply_markup = { inline_keyboard: [[{ text: "Open", url: link }]] };
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(`${GATEWAY_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429 && attempt === 0) {
      const wait = Math.min(10, Number(data?.parameters?.retry_after ?? 2));
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    return { ok: res.ok && data?.ok, data, status: res.status };
  }
  return { ok: false, data: {}, status: 429 };
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const bearer = authHeader.replace("Bearer ", "").trim();
    const isInternal = bearer.length > 0 && bearer === SERVICE_KEY;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    if (!isInternal) {
      const guard = await protect(req, "telegram-notify", { max: 10, windowSeconds: 60 });
      if (!guard.ok) return json({ error: guard.error }, guard.status);
      const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
      const { data: u, error: uErr } = await userClient.auth.getUser();
      if (uErr || !u?.user) return json({ error: "unauthorized" }, 401);
      const { data: roleRow } = await admin
        .from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      if (!roleRow) return json({ error: "forbidden" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const title = String(body.title ?? "").slice(0, 200).trim();
    const text = String(body.body ?? "").slice(0, 3500).trim();
    const link = body.link ? String(body.link).slice(0, 500) : null;
    const photoUrl = body.photo_url ? String(body.photo_url).slice(0, 1000) : null;
    const videoUrl = body.video_url ? String(body.video_url).slice(0, 1000) : null;
    const audience: "all" | "user" = body.audience === "user" ? "user" : "all";
    const targetUserId = body.target_user_id ? String(body.target_user_id) : null;
    const notificationKey = body.notification_key ? String(body.notification_key).slice(0, 200) : null;
    const offset = isInternal ? Math.max(0, Math.floor(Number(body.offset ?? 0)) || 0) : 0;
    const hop = isInternal ? Math.max(0, Math.floor(Number(body.hop ?? 0)) || 0) : 0;
    if (!title && !text) return json({ error: "empty_message" }, 400);

    let query = admin
      .from("telegram_verifications")
      .select("telegram_user_id, user_id", { count: offset === 0 ? "exact" : undefined })
      .eq("verified", true)
      .not("telegram_user_id", "is", null)
      .order("user_id", { ascending: true })
      .range(offset, offset + BATCH_SIZE - 1);
    if (audience === "user" && targetUserId) query = query.eq("user_id", targetUserId);

    const { data: rows, error: rErr, count } = await query;
    if (rErr) return json({ error: rErr.message }, 500);

    const msg = [title ? `<b>${esc(title)}</b>` : "", text ? esc(text) : ""].filter(Boolean).join("\n\n");
    const ids = (rows ?? []).map((r) => Number((r as { telegram_user_id: number | null }).telegram_user_id)).filter((id) => id);

    let sent = 0, failed = 0, skipped = 0, cursor = 0;
    const worker = async () => {
      while (cursor < ids.length) {
        const id = ids[cursor++];
        let deliveryId: string | null = null;
        if (notificationKey) {
          const { data: ins, error: insErr } = await admin
            .from("telegram_notifications_sent")
            .insert({ notification_key: notificationKey, telegram_user_id: id })
            .select("id").single();
          if (insErr) { skipped++; continue; }
          deliveryId = ins?.id ?? null;
        }
        const res = await tgSend(id, msg, link, photoUrl, videoUrl).catch(() => ({ ok: false, data: {}, status: 0 }));
        if (res.ok) {
          sent++;
          const messageId = Number((res.data as any)?.result?.message_id);
          if (deliveryId && Number.isFinite(messageId) && messageId > 0) {
            await admin.from("telegram_notifications_sent").update({ message_id: messageId }).eq("id", deliveryId);
          }
        } else {
          failed++;
          if (deliveryId) await admin.from("telegram_notifications_sent").delete().eq("id", deliveryId);
        }
        await new Promise((r) => setTimeout(r, 50));
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    const hasMore = audience === "all" && (rows?.length ?? 0) === BATCH_SIZE && hop < MAX_HOPS;
    if (hasMore) {
      const next = fetch(`${SUPABASE_URL}/functions/v1/telegram-notify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, offset: offset + BATCH_SIZE, hop: hop + 1 }),
      }).then((r) => r.text()).catch((e) => console.error("telegram-notify next batch failed", e));
      // deno-lint-ignore no-explicit-any
      const rt = (globalThis as any).EdgeRuntime;
      if (rt?.waitUntil) rt.waitUntil(next); else await next;
    }
    console.log(`telegram-notify hop ${hop} offset ${offset}: sent ${sent}, failed ${failed}, skipped ${skipped}, more ${hasMore}`);

    return json({ sent, failed, skipped, total: count ?? rows?.length ?? 0, continuing: hasMore });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
