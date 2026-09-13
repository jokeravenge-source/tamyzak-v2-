import { requireUser } from "../_shared/auth.ts";
import { protect } from "../_shared/guard.ts";
import {
  adminClient,
  corsHeaders,
  extractYouTubeId,
  fetchVideoTitle,
  generateScript,
  json,
  transcriptFor,
} from "../_shared/podcast.ts";

async function processSession(
  sessionId: string,
  youtubeUrl: string,
  videoId: string,
  subject: string | undefined,
) {
  const admin = adminClient();
  try {
    const [title, transcript] = await Promise.all([
      fetchVideoTitle(youtubeUrl),
      transcriptFor(youtubeUrl, videoId),
    ]);
    const segments = await generateScript(transcript, subject);
    const rows = [];
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      rows.push({
        session_id: sessionId,
        segment_order: index + 1,
        narration_text: segment.narration_text,
        narration_audio_url: null,
        checkpoint_prompt: segment.checkpoint_prompt,
        answer_key: segment.answer_key,
      });
    }
    const { error: insertError } = await admin.from("podcast_segments").insert(rows);
    if (insertError) throw insertError;
    const { error: updateError } = await admin
      .from("podcast_sessions")
      .update({ status: "ready", title: title ?? "محاضرة يوتيوب", updated_at: new Date().toISOString() })
      .eq("id", sessionId);
    if (updateError) throw updateError;
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذّر تجهيز الجلسة.";
    await admin
      .from("podcast_sessions")
      .update({ status: "failed", error_message: message.slice(0, 500), updated_at: new Date().toISOString() })
      .eq("id", sessionId);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const guarded = await protect(req, "create-podcast-session", { max: 4, windowSeconds: 3600, maxBytes: 16_384 });
  if (!guarded.ok) return json({ error: guarded.error }, guarded.status);

  const user = await requireUser(req);
  if (!user.ok) return json({ error: user.error, code: "AUTH_REQUIRED" }, user.status);

  // Point redemptions create a normal active subscription, so paid and
  // points-based Premium are intentionally handled by the same server gate.
  const admin = adminClient();
  const { data: subscriptions, error: subscriptionError } = await admin
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.userId)
    .in("status", ["active", "trialing", "past_due"]);
  if (subscriptionError) return json({ error: "تعذّر التحقق من الاشتراك." }, 500);
  const now = Date.now();
  const hasPremium = (subscriptions ?? []).some((item) =>
    !item.current_period_end || new Date(item.current_period_end).getTime() > now
  );
  if (!hasPremium) return json({
    error: "المعلّم الصوتي متاح للمشتركين المميزين. يمكنك تفعيل الاشتراك بالنقاط.",
    code: "PREMIUM_REQUIRED",
  }, 403);

  let body: { youtube_url?: unknown; subject?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "الطلب غير صالح." }, 400);
  }
  const youtubeUrl = typeof body.youtube_url === "string" ? body.youtube_url.trim() : "";
  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId || videoId.length > 32) return json({ error: "أدخل رابط يوتيوب صالحاً." }, 400);
  const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 80) : undefined;
  const { data: session, error } = await admin
    .from("podcast_sessions")
    .insert({
      user_id: user.userId,
      youtube_url: youtubeUrl,
      subject: subject || null,
      status: "processing",
      voice_id: "browser-arabic",
    })
    .select("id, status")
    .single();
  if (error || !session) return json({ error: "تعذّر إنشاء الجلسة." }, 500);

  const work = processSession(session.id, youtubeUrl, videoId, subject);
  const edgeRuntime = (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (promise: Promise<unknown>) => void } }).EdgeRuntime;
  if (edgeRuntime?.waitUntil) edgeRuntime.waitUntil(work);
  else await work;

  return json({ session_id: session.id, status: "processing" }, 202);
});
