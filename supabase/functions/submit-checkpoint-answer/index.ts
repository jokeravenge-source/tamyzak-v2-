import { requireUser } from "../_shared/auth.ts";
import { protect } from "../_shared/guard.ts";
import {
  adminClient,
  callTutorJson,
  corsHeaders,
  json,
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
  const guarded = await protect(req, "submit-checkpoint-answer", { max: 24, windowSeconds: 600, maxBytes: 16_384 });
  if (!guarded.ok) return json({ error: guarded.error }, guarded.status);
  const user = await requireUser(req);
  if (!user.ok) return json({ error: user.error }, user.status);

  try {
    let body: { segment_id?: unknown; student_answer_text?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ error: "الطلب غير صالح." }, 400);
    }
    const segmentId = typeof body.segment_id === "string" ? body.segment_id : "";
    const studentText = typeof body.student_answer_text === "string"
      ? body.student_answer_text.replace(/\s+/g, " ").trim()
      : "";
    if (!/^[0-9a-f-]{36}$/i.test(segmentId) || studentText.length < 2) {
      return json({ error: "المقطع أو نص الإجابة غير صالح." }, 400);
    }
    if (studentText.length > 5000) return json({ error: "نص الإجابة أطول من الحد المسموح." }, 413);

    const admin = adminClient();
    const { data: segment } = await admin
      .from("podcast_segments")
      .select("id, session_id, segment_order, narration_text, answer_key")
      .eq("id", segmentId)
      .maybeSingle();
    if (!segment) return json({ error: "المقطع غير موجود." }, 404);
    const { data: session } = await admin
      .from("podcast_sessions")
      .select("id, user_id, status")
      .eq("id", segment.session_id)
      .maybeSingle();
    if (!session || session.user_id !== user.userId) return json({ error: "غير مسموح." }, 403);
    if (session.status === "processing" || session.status === "failed") return json({ error: "الجلسة غير جاهزة للإجابة." }, 409);

    const grade = validGrade(await callTutorJson(`
أنت مدرس عراقي تقيّم ملخص طالب بعد مقطع شرح. قيّم المعنى لا التطابق الحرفي، وكن مشجعاً ودقيقاً.
أرجع كائن JSON فقط بلا markdown:
{"verdict":"correct|partial|incorrect","correction_text":null}
إذا كانت الإجابة جزئية أو خاطئة، اجعل correction_text تصحيحاً عربياً منطوقاً قصيراً يذكر الفكرة الناقصة أو يصحح الخطأ بلطف.
إذا كانت صحيحة، اجعل correction_text null.

شرح المقطع: ${segment.narration_text}
مفتاح الإجابة الداخلي: ${segment.answer_key}
إجابة الطالب المنسوخة: ${studentText}
`, 900));

    const completedAt = new Date().toISOString();
    const { error: updateError } = await admin.from("podcast_segments").update({
      student_answer_text: studentText,
      student_answer_audio_url: null,
      verdict: grade.verdict,
      correction_text: grade.correction_text,
      correction_audio_url: null,
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
      correction_audio_url: null,
      session_completed: finished,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "تعذّر تقييم الإجابة." }, 500);
  }
});
