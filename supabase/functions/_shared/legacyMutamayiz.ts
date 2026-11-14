const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
/** Compatibility only: old chats now use the same authenticated assistant. */
export async function legacyMutamayiz(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return new Response(null, { status: 405, headers: cors });
  try {
    const text = await req.text();
    if (new TextEncoder().encode(text).length > 512 * 1024) return new Response(JSON.stringify({ error: "payload_too_large" }), { status: 413, headers: cors });
    let body: Record<string, unknown>;
    try { body = JSON.parse(text); } catch { return new Response(JSON.stringify({ error: "invalid_request" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return new Response(JSON.stringify({ error: "invalid_request" }), { status: 400, headers: cors });
    const messages = Array.isArray(body.messages) ? body.messages : [
      ...(Array.isArray(body.history) ? body.history.slice(-16) : []),
      { role: "user", content: body.message },
    ];
    const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/excellence-companion`, {
      method: "POST", headers: { Authorization: req.headers.get("Authorization") ?? "", apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "", "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "unified", language: body.language === "en" ? "en" : "ar", messages,
        ...(typeof body.clientContext === "string" ? { clientContext: body.clientContext.slice(0, 80000) } : {}),
      }),
    });
    return new Response(response.body, { status: response.status, headers: { ...cors, "Content-Type": "application/json" } });
  } catch { return new Response(JSON.stringify({ error: "assistant_unavailable" }), { status: 503, headers: { ...cors, "Content-Type": "application/json" } }); }
}
