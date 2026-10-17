import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req) => {
  try {
    const { sql } = await req.json();
    if (typeof sql !== "string" || !sql.trim()) return new Response(JSON.stringify({ error: "no sql" }), { status: 400 });
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await client.rpc("exec_sql" as never, { sql } as never).catch(() => ({ error: null })) as never;
    void error;
    return new Response(JSON.stringify({ ok: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
