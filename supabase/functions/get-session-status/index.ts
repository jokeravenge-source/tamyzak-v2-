import { requireUser } from "../_shared/auth.ts";
import { protect } from "../_shared/guard.ts";
import { adminClient, corsHeaders, json, signedAudioUrl } from "../_shared/podcast.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const guarded = await protect(req, "get-session-status", { max: 80, windowSeconds: 60, maxBytes: 4096 });
  if (!guarded.ok) return json({ error: guarded.error }, guarded.status);
  const user = await requireUser(req);
  if (!user.ok) return json({ error: user.error }, user.status);

  let sessionId: string | undefined;
  try {
    const body = await req.json();
    sessionId = typeof body?.session_id === "string" ? body.session_id : undefined;
  } catch { /* an empty body means list mode */ }

  const admin = adminClient();
  if (!sessionId) {
    const { data, error } = await admin
      .from("podcast_sessions")
      .select("id, youtube_url, title, subject, status, error_message, created_at, completed_at")
      .eq("user_id", user.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return json({ error: "تعذّر تحميل الجلسات السابقة." }, 500);
    return json({ sessions: data ?? [] });
  }

  const { data: session, error: sessionError } = await admin
    .from("podcast_sessions")
    .select("id, youtube_url, title, subject, status, error_message, created_at, completed_at")
    .eq("id", sessionId)
    .eq("user_id", user.userId)
    .maybeSingle();
  if (sessionError || !session) return json({ error: "الجلسة غير موجودة." }, 404);

  const { data: rows, error: segmentsError } = await admin
    .from("podcast_segments")
    .select("id, session_id, segment_order, narration_text, narration_audio_url, checkpoint_prompt, student_answer_text, student_answer_audio_url, verdict, correction_text, correction_audio_url, completed_at")
    .eq("session_id", sessionId)
    .order("segment_order", { ascending: true });
  if (segmentsError) return json({ error: "تعذّر تحميل مقاطع الجلسة." }, 500);

  const segments = await Promise.all((rows ?? []).map(async (segment) => ({
    ...segment,
    narration_audio_url: await signedAudioUrl(admin, segment.narration_audio_url),
    student_answer_audio_url: await signedAudioUrl(admin, segment.student_answer_audio_url),
    correction_audio_url: await signedAudioUrl(admin, segment.correction_audio_url),
  })));
  return json({ session, segments });
});
