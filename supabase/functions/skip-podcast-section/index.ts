import { requireUser } from "../_shared/auth.ts";
import { protect } from "../_shared/guard.ts";
import { adminClient, corsHeaders, json } from "../_shared/podcast.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const user = await requireUser(req);
  if (!user.ok) return json({ error: user.error }, user.status);
  const guarded = await protect(req, "skip-podcast-section", {
    max: 30,
    windowSeconds: 600,
    maxBytes: 4096,
  });
  if (!guarded.ok) return json({ error: guarded.error }, guarded.status);
  try {
    const body = await req.json();
    if (
      typeof body?.segment_id !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(body.segment_id)
    )
      return json({ error: "المقطع غير صالح." }, 400);
    const admin = adminClient();
    const { data: segment, error: readError } = await admin
      .from("podcast_segments")
      .select("id,session_id")
      .eq("id", body.segment_id)
      .maybeSingle();
    if (readError) throw readError;
    if (!segment) return json({ error: "المقطع غير موجود." }, 404);
    const { data: session } = await admin
      .from("podcast_sessions")
      .select("id,user_id,status")
      .eq("id", segment.session_id)
      .maybeSingle();
    if (!session || session.user_id !== user.userId)
      return json({ error: "غير مسموح." }, 403);
    if (session.status === "processing" || session.status === "failed")
      return json({ error: "الجلسة غير جاهزة." }, 409);
    // A completed section without a grading verdict represents an explicit skip.
    // Retried skips cannot replace a section that was already understood.
    const now = new Date().toISOString();
    const { error } = await admin
      .from("podcast_segments")
      .update({ completed_at: now, verdict: null })
      .eq("id", segment.id)
      .is("completed_at", null);
    if (error) throw error;
    const { count, error: countError } = await admin
      .from("podcast_segments")
      .select("id", { count: "exact", head: true })
      .eq("session_id", session.id)
      .is("completed_at", null);
    if (countError) throw countError;
    const finished = count === 0;
    const { error: updateError } = await admin
      .from("podcast_sessions")
      .update({
        status: finished ? "completed" : "in_progress",
        completed_at: finished ? now : null,
        updated_at: now,
      })
      .eq("id", session.id);
    if (updateError) throw updateError;
    return json({ session_completed: finished });
  } catch {
    return json({ error: "تعذّر تخطي الجزء. حاول مرة ثانية." }, 500);
  }
});
