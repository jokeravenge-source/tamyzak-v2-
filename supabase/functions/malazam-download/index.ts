import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUser } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { protect } from "../_shared/guard.ts";
import { checkTelegramMembership } from "../_shared/telegram-membership.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const safeDownloadName = (name: string) => `${name.replace(/[\\/:*?"<>|\r\n]+/g, " ").trim().slice(0, 120) || "malzama"}.pdf`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const guard = await protect(req, "malazam-download", { max: 12, windowSeconds: 60 });
  if (!guard.ok) return json({ error: guard.error }, guard.status);

  try {
    const auth = await requireUser(req);
    if (!auth.ok) return json({ error: "unauthenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const malzamaId = String((body as { malzamaId?: unknown }).malzamaId ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(malzamaId)) return json({ error: "invalid_malzama" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [{ data: item }, { data: verification }] = await Promise.all([
      admin.from("malazam").select("id, name, file_path, is_published").eq("id", malzamaId).maybeSingle(),
      admin.from("telegram_verifications").select("telegram_user_id, verified").eq("user_id", auth.userId).maybeSingle(),
    ]);

    if (!item?.is_published) return json({ error: "not_found" }, 404);
    if (!verification?.verified || !verification.telegram_user_id) {
      return json({ error: "not_linked" }, 403);
    }

    const channels = await checkTelegramMembership(Number(verification.telegram_user_id), "malazam");
    const failed = channels.find((channel) => !channel.ok);
    if (failed) {
      const error = failed.error === "bot_not_channel_admin" ? "bot_not_channel_admin" : "membership_check_failed";
      return json({ error, failedChannel: failed.channel, channels }, 503);
    }

    const missingChannels = channels.filter((channel) => !channel.joined).map((channel) => channel.channel);
    if (missingChannels.length) {
      return json({ error: "not_joined", missingChannels, channels }, 403);
    }

    const { data: signed, error: signedError } = await admin.storage
      .from("malazam-files")
      .createSignedUrl(item.file_path, 120, { download: safeDownloadName(item.name) });
    if (signedError || !signed?.signedUrl) throw new Error(signedError?.message ?? "signed_url_failed");

    await admin.from("malazam_downloads").insert({ malzama_id: item.id, user_id: auth.userId });
    return json({ ok: true, downloadUrl: signed.signedUrl, expiresIn: 120 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json({ error: message }, 500);
  }
});
