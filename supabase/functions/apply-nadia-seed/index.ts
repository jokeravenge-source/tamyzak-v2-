import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
Deno.serve(async (req) => {
  try {
    const { sql } = await req.json();
    if (typeof sql !== "string" || !sql.trim()) {
      return new Response(JSON.stringify({ error: "no sql" }), { status: 400 });
    }
    const client = new Client(Deno.env.get("SUPABASE_DB_URL")!);
    await client.connect();
    try {
      await client.queryArray(sql);
    } finally {
      await client.end();
    }
    return new Response(JSON.stringify({ ok: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
