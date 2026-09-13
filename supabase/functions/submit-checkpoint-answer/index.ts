import { requireUser } from "../_shared/auth.ts";
import { protect } from "../_shared/guard.ts";
import {
  adminClient,
  callClaudeJson,
  corsHeaders,
  json,
  signedAudioUrl,
  textToSpeech,
  transcribeAudio,
  uploadPodcastAudio,
} from "../_shared/podcast.ts";

type Grade = { verdict: "correct" | "partial" | "incorrect"; correction_text: string | null };

function validGrade(input: unknown): Grade {
  const value = input as Record<string, unknown>;
  const verdict = value?.verdict;
  if (verdict !== "correct" && verdict !== "partial" && verdict !== "incorrect") {
    throw new Error("تعذّر تقييم الإجابة. حاول مرة أخرى.");
  }
  const correction = typeof value.correction_text === "string" ? value.correction_text.trim() : null;
  return { verdict, correction_text: verdict === "correct" ? null : correction };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const guarded = await protect(req, "submit-checkpoint-answer", { max: 24, windowSeconds: 600, maxBytes: 26 * 1024 * 1024 });
  if (!guarded.ok) return json({ error: guarded.error }, guarded.status);
  const user = await requireUser(req);
  if (!user.ok) return json({ error: user.error }, user.status);

  try {
    const form = await req.formData();
    const segmentId = String(form.get("segment_id") ?? "");
    const recording = form.get("audio");
    if (!/^[0-9a-f-]{36}$/i.test(segmentId) || !(recording instanceof File) || recording.size === 0) {
      return json({ error: "التسجيل أو المقطع غير صالح." }, 400);
    }
    if (recording.size > 25 * 1024 * 1024) return json({ error: "التسجيل أكبر من الحد المسموح." }, 413);

    const admin = adminClient();
    const { data: segment } = await admin
      .from("podcast_segments")
      .select("id, session_id, segment_order, narration_text, answer_key")
      .eq("id", segmentId)
      .maybeSingle();
    if (!segment) return json({ error: "المقطع غير موجود." }, 404);
    const { data: session } = await admin
      .from("podcast_sessions")
      .select("id, user_id, status, voice_id")
      .eq("id", segment.session_id)
      .maybeSingle();
    if (!session || session.user_id !== user.userId) return json({ error: "غير مسموح." }, 403);
    if (session.status === "processing" || session.status === "failed") return json({ error: "الجلسة غير جاهزة للإجابة." }, 409);

    const audioPath = await uploadPodcastAudio(
      admin,
      user.userId,
      session.id,
      `segment-${segment.segment_order}-answer-${Date.now()}.webm`,
      recording,
      recording.type || "audio/webm",
    );
    const studentText = await transcribeAudio(recording, recording.name || "answer.webm");
    const grade = validGrade(await callClaudeJson(`
أنت مدرس عراقي تقيّم ملخص طالب بعد مقطع شرح. قيّم المعنى لا التطابق الحرفي، وكن مشجعاً ودقيقاً.
أرجع كائن JSON فقط بلا markdown:
{"verdict":"correct|partial|incorrect","correction_text":null}
إذا كانت الإجابة جزئية أو خاطئة، اجعل correction_text تصحيحاً عربياً منطوقاً قصيراً يذكر الفكرة الناقصة أو يصحح الخطأ بلطف.
إذا كانت صحيحة، اجعل correction_text null.

شرح المقطع: ${segment.narration_text}
مفتاح الإجابة الداخلي: ${segment.answer_key}
إجابة الطالب المنسوخة: ${studentText}
`, 900));

    let correctionPath: string | null = null;
    if (grade.verdict !== "correct" && grade.correction_text) {
      const correctionAudio = await textToSpeech(grade.correction_text, session.voice_id);
      correctionPath = await uploadPodcastAudio(
        admin,
        user.userId,
        session.id,
        `segment-${segment.segment_order}-correction-${Date.now()}.mp3`,
        correctionAudio,
        "audio/mpeg",
      );
    }
    const completedAt = new Date().toISOString();
    const { error: updateError } = await admin.from("podcast_segments").update({
      student_answer_text: studentText,
      student_answer_audio_url: audioPath,
      verdict: grade.verdict,
      correction_text: grade.correction_text,
      correction_audio_url: correctionPath,
      completed_at: completedAt,
    }).eq("id", segment.id);
    if (updateError) throw updateError;

    const { count: remaining } = await admin
      .from("podcast_segments")
      .select("id", { count: "exact", head: true })
      .eq("session_id", session.id)
      .is("completed_at", null);
    const finished = remaining === 0;
    await admin.from("podcast_sessions").update({
      status: finished ? "completed" : "in_progress",
      updated_at: completedAt,
      completed_at: finished ? completedAt : null,
    }).eq("id", session.id);

    return json({
      student_answer_text: studentText,
      verdict: grade.verdict,
      correction_text: grade.correction_text,
      correction_audio_url: await signedAudioUrl(admin, correctionPath),
      session_completed: finished,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "تعذّر تقييم الإجابة." }, 500);
  }
});
