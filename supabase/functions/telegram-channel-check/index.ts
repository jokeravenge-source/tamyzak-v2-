import { protect } from "../_shared/guard.ts";
import { requireUser } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

// Compatibility for installed clients: Telegram channel membership is no longer required.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const guard = await protect(req, "telegram-channel-check", { max: 20, windowSeconds: 60 });
  if (!guard.ok) return json({ error: guard.error }, guard.status);

  try {
    const auth = await requireUser(req);
    if (!auth.ok) return json({ ok: false, joined: false, error: "unauthenticated" }, 401);
    const body = await req.json().catch(() => ({}));
    const requestedScope = (body as { scope?: unknown }).scope;
    const scope = typeof requestedScope === "string" && ["default", "nadia", "malazam", "dhs"].includes(requestedScope)
      ? requestedScope : "default";
    return json({ ok: true, joined: true, required: false, scope, channels: [], missingChannels: [] });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
