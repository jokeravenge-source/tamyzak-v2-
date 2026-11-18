import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUser } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { protect } from "../_shared/guard.ts";

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

    const { data: item } = await admin.from("malazam")
      .select("id, name, file_path, is_published").eq("id", malzamaId).maybeSingle();

    if (!item?.is_published) return json({ error: "not_found" }, 404);
    const { data: signed, error: signedError } = await admin.storage
      .from("malazam-files")
      .createSignedUrl(item.file_path, 120);
    if (signedError || !signed?.signedUrl) throw new Error(signedError?.message ?? "signed_url_failed");
    // supabase-js double-encodes the download name, so append it once ourselves.
    const downloadUrl = `${signed.signedUrl}&download=${encodeURIComponent(safeDownloadName(item.name))}`;

    await admin.from("malazam_downloads").insert({ malzama_id: item.id, user_id: auth.userId });
    return json({ ok: true, downloadUrl, expiresIn: 120 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json({ error: message }, 500);
  }
});
