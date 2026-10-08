import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { protect } from "../_shared/guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const str = (v: unknown, max: number) => (typeof v === "string" && v.trim().length > 0 && v.length <= max ? v.trim() : null);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const guard = await protect(req, "flashcards-dashboard", { max: 30, windowSeconds: 60 });
  if (!guard.ok) return json({ error: guard.error }, guard.status);
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const expected = Deno.env.get("FLASHCARDS_DASH_PASSWORD") ?? "";
  if (!expected || typeof body.password !== "string" || !safeEqual(body.password, expected)) {
    return json({ error: "wrong_password" }, 401);
  }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const action = body.action;

  try {
    if (action === "login") return json({ ok: true });

    if (action === "stats") {
      const [{ count: cards }, { count: pending }, { count: reviews }, { data: rows }, { data: revRows }] = await Promise.all([
        db.from("custom_flashcards").select("id", { count: "exact", head: true }),
        db.from("custom_flashcards").select("id", { count: "exact", head: true }).eq("approved", false),
        db.from("flashcard_reviews").select("id", { count: "exact", head: true }),
        db.from("custom_flashcards").select("subject, chapter, language").limit(10000),
        db.from("flashcard_reviews").select("subject, user_id").limit(20000),
      ]);
      const decks: Record<string, number> = {};
      for (const r of rows ?? []) {
        const k = `${r.subject} · ${r.chapter} · ${r.language}`;
        decks[k] = (decks[k] ?? 0) + 1;
      }
      const studs: Record<string, Set<string>> = {};
      for (const r of revRows ?? []) (studs[r.subject ?? "?"] ??= new Set()).add(r.user_id);
      return json({
        cards, pending, reviews,
        decks: Object.entries(decks).map(([deck, count]) => ({ deck, count })).sort((a, b) => b.count - a.count),
        students: Object.entries(studs).map(([subject, s]) => ({ subject, students: s.size })).sort((a, b) => b.students - a.students),
      });
    }

    if (action === "list") {
      let q = db.from("custom_flashcards").select("*").order("created_at", { ascending: false }).limit(300);
      const subject = str(body.subject, 100); if (subject) q = q.eq("subject", subject);
      const chapter = str(body.chapter, 200); if (chapter) q = q.eq("chapter", chapter);
      const search = str(body.search, 200); if (search) q = q.ilike("question", `%${search.replace(/[%_]/g, "")}%`);
      if (body.pendingOnly === true) q = q.eq("approved", false);
      const { data, error } = await q;
      if (error) throw error;
      return json({ cards: data });
    }

    if (action === "create" || action === "update") {
      const c = body.card as Record<string, unknown> | undefined;
      const row = {
        subject: str(c?.subject, 100), chapter: str(c?.chapter, 200),
        language: c?.language === "en" ? "en" : "ar",
        question: str(c?.question, 4000), answer: str(c?.answer, 8000),
        approved: c?.approved !== false,
      };
      if (!row.subject || !row.chapter || !row.question || !row.answer) return json({ error: "missing_fields" }, 400);
      if (action === "create") {
        const { error } = await db.from("custom_flashcards").insert(row);
        if (error) throw error;
      } else {
        const id = str(c?.id, 64); if (!id) return json({ error: "missing_id" }, 400);
        const { error } = await db.from("custom_flashcards").update(row).eq("id", id);
        if (error) throw error;
      }
      return json({ ok: true });
    }

    if (action === "delete") {
      const id = str(body.id, 64); if (!id) return json({ error: "missing_id" }, 400);
      const { error } = await db.from("custom_flashcards").delete().eq("id", id);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "server_error" }, 500);
  }
});
