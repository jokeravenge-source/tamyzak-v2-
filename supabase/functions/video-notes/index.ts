import { protect } from "../_shared/guard.ts";
import { requireUser } from "../_shared/auth.ts";
import { claimFeature } from "../_shared/entitlement.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import type {} from "./generated/models.d.ts";
import { generateChatCompletion, GatewayError } from "npm:@lovable.dev/ai-gateway@0.1.11";
import { hasArabicLectureQuestions } from "../_shared/lecture-question-language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const parseJsonMaybe = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const getRetryAfterSeconds = (payload: any) => {
  const retryInfo = payload?.error?.details?.find?.((d: any) => String(d?.["@type"] || "").includes("RetryInfo"));
  const rawDelay = retryInfo?.retryDelay || payload?.retryDelay;
  if (typeof rawDelay === "string") {
    const seconds = Number.parseFloat(rawDelay.replace("s", ""));
    if (Number.isFinite(seconds)) return Math.ceil(seconds);
  }
  const message = payload?.error?.message || payload?.message || "";
  const match = String(message).match(/retry in\s+([\d.]+)s/i);
  return match ? Math.ceil(Number.parseFloat(match[1])) : 0;
};

const isDailyOrDisabledQuota = (payload: any) => {
  const text = JSON.stringify(payload || {});
  return text.includes("PerDay") || text.includes("limit: 0");
};

const hasArabicLetters = (value: string) => /[\u0600-\u06ff]/.test(value);

const formatEnglishCurriculumParts = (input: any[], englishLabelsOnly = false) => {
  const formatted: { title: string; notes: string }[] = [];
  for (const part of input) {
    const questions = Array.isArray(part?.review_questions)
      ? part.review_questions.map((q: unknown) => String(q || "").trim()).filter(Boolean)
      : [];
    // Never save an English-curriculum result unless every review question
    // has actually been returned in English.
    if (questions.length < 3 || questions.some(hasArabicLetters)) return null;
    if (englishLabelsOnly && hasArabicLectureQuestions(String(part?.notes || ""))) return null;
    if (englishLabelsOnly && (hasArabicLetters(String(part?.title || "")) || String(part?.notes || "").split(/\r?\n/).some((line) => (/^#{1,6}\s/.test(line.trim()) || /[؟?]/.test(line)) && hasArabicLetters(line)))) return null;

    let insideReviewSection = false;
    const cleanNotes = String(part?.notes || "")
      .split(/\r?\n/)
      .flatMap((line) => {
        const trimmed = line.trim();
        if (/^#{1,4}\s+.*(?:Review Questions|أسئلة مراجعة)/i.test(trimmed)) {
          if (/خلاصة/.test(trimmed)) return ["## 🧠 الخلاصة"];
          insideReviewSection = true;
          return [];
        }
        if (insideReviewSection && /^#{1,4}\s+/.test(trimmed)) insideReviewSection = false;
        if (insideReviewSection) return [];
        // Only drop numbered question lines; keep headings/explanations that merely contain "؟".
        if (/^(?:[-*]\s*)?(?:س|سؤال)\s*\d*\s*[:.)-]/.test(trimmed)) return [];
        return [line];
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    formatted.push({
      title: String(part?.title || "Lecture notes"),
      notes: `${cleanNotes}\n\n### Review Questions\n${questions.map((question: string, index: number) => `${index + 1}. ${question}`).join("\n")}`,
    });
  }
  return formatted.length ? formatted : null;
};

const extractYouTubeId = (value: string) => {
  try {
    const parsed = new URL(value);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1).split("/")[0] || "";
    if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2] || "";
    return parsed.searchParams.get("v") || "";
  } catch {
    return "";
  }
};

const decodeHtml = (value: string) => value
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

const fetchYouTubeTranscript = async (videoUrl: string, language: "ar" | "en") => {
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) return "";

  const watch = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&hl=${language}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Tamayzak/1.0)" },
  });
  if (!watch.ok) return "";
  const html = await watch.text();
  const marker = '"captionTracks":';
  const markerAt = html.indexOf(marker);
  if (markerAt < 0) return "";

  const arrayStart = markerAt + marker.length;
  const arrayEnd = html.indexOf('],"audioTracks"', arrayStart);
  if (arrayEnd < 0) return "";

  let tracks: any[] = [];
  try {
    tracks = JSON.parse(html.slice(arrayStart, arrayEnd + 1));
  } catch (error) {
    console.error("YouTube caption metadata parse failed", error);
    return "";
  }

  const track = tracks.find((item) => item?.languageCode === language && item?.kind !== "asr")
    || tracks.find((item) => item?.languageCode === language)
    || tracks.find((item) => item?.kind !== "asr")
    || tracks[0];
  if (!track?.baseUrl) return "";

  const captions = await fetch(`${decodeHtml(track.baseUrl)}&fmt=json3`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Tamayzak/1.0)" },
  });
  if (!captions.ok) return "";
  const payload = await captions.json().catch(() => null);
  const transcript = payload?.events
    ?.flatMap((event: any) => event?.segs || [])
    .map((segment: any) => segment?.utf8 || "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return typeof transcript === "string" ? transcript : "";
};

const fetchSupadataTranscript = async (videoUrl: string, language: "ar" | "en") => {
  const key = Deno.env.get("SUPADATA_API_KEY");
  if (!key) return "";
  try {
    const endpoint = `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(videoUrl)}&lang=${language}&text=true`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    const res = await fetch(endpoint, { headers: { "x-api-key": key }, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error("Supadata transcript failed", res.status, (await res.text()).slice(0, 300));
      return "";
    }
    const data = await res.json().catch(() => null);
    if (typeof data?.content === "string") return data.content.replace(/\s+/g, " ").trim();
    if (Array.isArray(data?.content)) {
      return data.content.map((c: any) => c?.text || "").join(" ").replace(/\s+/g, " ").trim();
    }
    return "";
  } catch (error) {
    console.error("Supadata transcript error", error);
    return "";
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const guard = await protect(req, "video-notes", { max: 6, windowSeconds: 60 });
  if (!guard.ok) return new Response(JSON.stringify({ error: guard.error }), { status: guard.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const auth = await requireUser(req);
  if (!auth.ok) return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const { url, language, mode, transcript: providedTranscript, count, adminGeneration, notesStyle } = await req.json();
    const lang0 = language === "en" ? "en" : "ar";
    const nadiaEnglishStyle = lang0 === "en" && notesStyle === "nadia-english-arabic-explanations";
    const arabicEnglishCurriculum = lang0 === "en" && (notesStyle === "arabic-explanation-english-curriculum" || nadiaEnglishStyle);
    const runMode: "notes" | "flashcards" = mode === "flashcards" ? "flashcards" : "notes";
    if ((!url || typeof url !== "string") && !providedTranscript) {
      return jsonResponse({ error: "Missing url" }, 400);
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!LOVABLE_API_KEY && !GEMINI_API_KEY) {
      return jsonResponse({ error: "No AI API key configured" }, 500);
    }

    // YouTube page URLs are not video files and cannot be passed to Gemini as
    // fileData. Read the video's public captions first, then use Gemini to turn
    // that faithful transcript into notes.
    let transcriptText = typeof providedTranscript === "string" ? providedTranscript : "";
    if (!transcriptText && url) {
      transcriptText = await fetchSupadataTranscript(url.trim(), lang0);
      if (!transcriptText) transcriptText = await fetchYouTubeTranscript(url.trim(), lang0);
    }

    // Admin publishing uses a verified role; student AI access uses Premium.
    if (adminGeneration === true) {
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      );
      const { data: adminRole } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", auth.userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!adminRole) return jsonResponse({ error: "Forbidden." }, 403);
    } else {
      const ent = await claimFeature(req, "video-notes");
      if (!ent.ok) {
        return jsonResponse({ error: ent.error, upgrade: ent.status === 403 || ent.status === 429 }, ent.status);
      }
    }

    // Never silently remove the end of a lecture to fit the input budget.
    if (transcriptText.length > 1_000_000) {
      return jsonResponse({ error: lang0 === "ar"
        ? "نص المحاضرة طويل جداً. قسّمه إلى أجزاء متتابعة للحصول على ملاحظات كاملة."
        : "This lecture transcript is too long. Split it into consecutive parts to get complete notes.", retryable: false }, 413);
    }

    // Cache: the same video is never paid for twice.
    const cacheClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );
    const vid = url ? extractYouTubeId(url.trim()) : "";
    const cacheKey = runMode === "notes" && vid && !providedTranscript
      ? `${vid}|${lang0}|${nadiaEnglishStyle ? "nadia-en-labels" : arabicEnglishCurriculum ? "encur" : "std"}|full-v3-argon`
      : "";
    if (cacheKey) {
      const { data: cached } = await cacheClient
        .from("video_notes_cache").select("notes, parts").eq("cache_key", cacheKey).maybeSingle();
      if (cached?.notes) return jsonResponse({ notes: cached.notes, parts: cached.parts, transcript: transcriptText, cached: true });
    }

    // ===== Flashcards mode (tool-call structured output) =====
    if (runMode === "flashcards") {
      if (!transcriptText) {
        return jsonResponse({ error: lang0 === "ar" ? "تعذّر تفريغ هذا الفيديو لإنشاء بطاقات." : "Could not transcribe this video for flashcards." });
      }
      if (!LOVABLE_API_KEY) {
        return jsonResponse({ error: "LOVABLE_API_KEY not configured" }, 500);
      }
      const n = Math.max(6, Math.min(40, Number(count) || 15));
      const langName = lang0 === "ar" ? "Arabic" : "English";
      const sys = `You generate concise study flashcards from a YouTube transcript. Produce exactly ${n} flashcards in ${langName}. Each card: a clear question on the front, and a complete but short answer on the back (1-3 sentences). Cover the most exam-worthy ideas, definitions, formulas, and examples. Use ONLY content present in the transcript. Return via the submit_flashcards tool.`;
      const userMsg = `TRANSCRIPT:\n${transcriptText}\n\nGenerate ${n} flashcards.`;
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": LOVABLE_API_KEY,
          "X-Lovable-AIG-SDK": "vercel-ai-sdk",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-lite",
          messages: [{ role: "system", content: sys }, { role: "user", content: userMsg }],
          tools: [{
            type: "function",
            function: {
              name: "submit_flashcards",
              description: "Submit generated flashcards",
              parameters: {
                type: "object",
                properties: {
                  cards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { q: { type: "string" }, a: { type: "string" } },
                      required: ["q", "a"], additionalProperties: false,
                    },
                  },
                },
                required: ["cards"], additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "submit_flashcards" } },
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        if (res.status === 429) return jsonResponse({ error: lang0 === "ar" ? "الذكاء الاصطناعي مشغول. حاول مجدداً." : "AI busy. Try again.", retryable: true }, 429);
        if (res.status === 402) return jsonResponse({ error: lang0 === "ar" ? "نفدت رصيد الذكاء الاصطناعي." : "AI credits exhausted." }, 402);
        return jsonResponse({ error: `AI error: ${txt}` }, 500);
      }
      const data = await res.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        return jsonResponse({ error: "No flashcards generated", retryable: true }, 502);
      }
      const parsed = JSON.parse(toolCall.function.arguments);
      return jsonResponse({ cards: parsed.cards || [], transcript: transcriptText });
    }

    const curriculumLanguageRules = nadiaEnglishStyle
      ? `
NADIA ENGLISH CURRICULUM LANGUAGE RULES (mandatory, overriding conflicting instructions below):
- Write all titles, headings, section names, labels, scientific terms, definitions' term names, example labels, diagram labels and questions in English only. Preserve English scientific terminology from the source.
- Write explanatory prose and answers in clear Arabic. Retain scientific terms in English within Arabic explanations. Equations, numerical values and symbols remain as in the source.
- All questions, including embedded examples, practice, review questions and question-form headings, must be English only; their explanations and answers may be Arabic.
- Use these English section headings: Overview, Key Concepts, Definitions, Formulas and Rules, Worked Examples, Important Notes, Summary. Use English titles for each part.
- Return 3–6 English-only review questions in review_questions, never in notes. Do not add unsupported facts.
`
      : arabicEnglishCurriculum
      ? `
قواعد اللغة الخاصة بالمنهج الإنجليزي (إلزامية):
- الطالب يدرس المنهج باللغة الإنجليزية لكنه يتحدث العربية؛ لذلك اكتب الشرح العام، التوضيح، الأمثلة، التنبيهات، والخلاصة باللغة العربية الفصحى الواضحة.
- اكتب كل مصطلح علمي أو أحيائي باللغتين معاً في كل مرة يظهر فيها، بهذه الصيغة حصراً: الاسم العربي (English Term). لا تكتب مصطلحاً علمياً بالعربية وحدها أو بالإنجليزية وحدها داخل الشرح.
- استعمل المصطلح الإنجليزي نفسه الوارد في نص المحاضرة أو منهج الأحياء، ولا تستبدله بمرادف ولا تنشئ ترجمة أو مصطلحاً جديداً من عندك.
- لا تضف أي مصطلح أو معلومة أو مثال غير موجود في المصدر. إذا لم يذكر المصدر مقابلاً إنجليزياً موثوقاً لمصطلح ما، فاكتب: (المقابل الإنجليزي غير مذكور في المصدر) بدلاً من التخمين.
- ترجم أسئلة المراجعة المستخرجة من محتوى الملاحظات إلى الإنجليزية فقط، مع المحافظة على المصطلحات الإنجليزية نفسها المستعملة في الشرح ومن دون إدخال فكرة أو مصطلح خارجي. ضعها تحت عنوان: ### Review Questions
- لا تضع أسئلة المراجعة داخل حقل notes. أعدها حصراً في مصفوفة review_questions، ويجب أن تحتوي على 3–6 أسئلة إنجليزية خالية تماماً من الحروف العربية.
- لا تجعل فقرات الشرح العامة إنجليزية، ولا تجعل أسئلة المراجعة عربية.
`
      : "";

    const systemPrompt = `أنت كاتب ملاحظات دراسية خبير ومتقن. مهمتك تحويل الفيديو بأكمله من بدايته حتى نهايته إلى ملاحظات دراسية موجزة وشاملة لجميع موضوعاته. ${nadiaEnglishStyle ? "Apply the mandatory Nadia English curriculum language rules below to all output, including headings and questions." : "اكتب باللغة العربية الفصحى دائماً (تَرجِم إذا لزم الأمر، بغض النظر عن لغة المصدر)."}
${curriculumLanguageRules}

القواعد الصارمة:
1) اقرأ المصدر كاملاً أولاً وحدّد جميع موضوعاته بالترتيب، بما فيها موضوعات الربع الأخير والخاتمة. وزّع مساحة الملاحظات على جميع الموضوعات قبل التوسّع في أي منها. لا تستهلك المخرجات في شرح بداية الفيديو وتترك نهايته.
2) اذكر الأفكار والتعريفات والقواعد والاستثناءات والأمثلة من جميع أجزاء الفيديو بإيجاز دون حذف موضوع كامل. احتفظ بأرقام الأمثلة ومعادلاتها وخطواتها الأساسية ونتائجها، واحذف التكرار والحشو فقط. تغطية الفيديو كاملاً أهم من التفصيل في جزء منه.
2.أ) إذا كان المثال رياضياً أو علمياً: اكتب المعطيات، ثم القانون/الصيغة، ثم خطوات الحل، ثم النتيجة النهائية مع الوحدة.
2.ب) الرياضيات والمعادلات: ممنوع منعاً باتاً استخدام LaTeX أو علامات $ أو أوامر مثل \\frac أو \\sqrt أو ^{ } أو _{ }. اكتب المعادلات نصاً عادياً مقروءاً بالرموز الموحدة فقط: x² و x³ و √x و ∛x و a/b و × و ÷ و ± و ≤ و ≥ و ≠ و ≈ و π و θ و ∞ و ∫ و Σ و sin(x) و log(x). ضع كل معادلة على سطر مستقل.
3) ${nadiaEnglishStyle ? "Use source-backed English scientific terms in every part of the notes." : arabicEnglishCurriculum ? "اكتب كل مصطلح تقني بالاسم العربي ثم الاسم الإنجليزي المطابق للمصدر بين قوسين في كل ظهور، مثل: التمثيل الضوئي (Photosynthesis). لا تستخدم مرادفات أو مصطلحات من خارج نص المحاضرة ومنهج الأحياء." : "احتفظ بكل المصطلحات التقنية مع ذكر مقابلها بالإنجليزية بين قوسين عند أول ظهور، مثل: التمثيل الضوئي (Photosynthesis)."}
4) احتفظ بالتسلسل المنطقي الذي اتبعه المتحدث، ووضّح الانتقالات بين الأفكار.
5) أبرز التحذيرات، الأخطاء الشائعة، النصائح، الحيل، النقاط التي قال عنها المتحدث "مهم"، "انتبه"، "يأتي بالامتحان"، أو ما شابه — ضعها في مربع تنبيه ⚠️.
6) لا تُضِف معلومات من عندك غير موجودة في الفيديو، ولا تَفتَرِض. إن كان شيء غير واضح، اكتب: "(غير موضّح في الفيديو)".
7) اكتب الملاحظات بأسلوب طالب يستذكر للامتحان: واضح، منظّم، قابل للحفظ.

${nadiaEnglishStyle ? `Output structure (Markdown), using English headings and labels and Arabic explanatory prose:
# Lecture title
## Overview
## Key Concepts
## Definitions
## Formulas and Rules
## Worked Examples
## Important Notes
## Summary
Put English-only questions in review_questions, not in notes.` : `بنية المخرجات (Markdown):
# العنوان الرئيسي للفيديو
## 🧭 نظرة عامة سريعة
فقرة 3–5 أسطر تشرح الموضوع وأهميته.

## 📚 المفاهيم الأساسية
لكل مفهوم: عنوان فرعي + شرح موجز واضح.

## 📖 التعريفات المهمة
قائمة: **المصطلح:** التعريف الكامل كما ورد.

## 🔢 القوانين / الصيغ / القواعد
اذكرها كلها بصيغتها الكاملة مع شرح كل رمز.

## 🧪 الأمثلة المحلولة
مثال 1: ... (المعطيات، الحل خطوة بخطوة، النتيجة)
مثال 2: ...
(أدرج كل مثال ورد في الفيديو دون استثناء)

## ⚠️ نقاط مهمة وتحذيرات
- ...

## 🧠 خلاصة وأسئلة مراجعة سريعة
- نقاط الخلاصة.
- ${arabicEnglishCurriculum ? "اكتب نقاط الخلاصة بالعربية، ثم اكتب 3–6 أسئلة مراجعة باللغة الإنجليزية فقط تحت عنوان ### Review Questions." : "3–6 أسئلة قصيرة يمكن للطالب اختبار نفسه بها."}

لا تكتب أي شيء خارج هذه البنية. ${arabicEnglishCurriculum ? "استخدم العربية في الشرح العام، واستخدم الإنجليزية داخل أسماء المصطلحات الثنائية وفي نص أسئلة Review Questions فقط." : "لا تستخدم لغة غير العربية في الشرح (المصطلحات الإنجليزية مسموحة فقط بين قوسين)."}`}

تقسيم إجباري: قسّم الفيديو كاملاً إلى أجزاء موضوعية متتابعة تشمل البداية والمنتصف والنهاية دون فجوات، ولا تفرض عدداً ثابتاً من الأجزاء. البنية أعلاه دليل تنظيم، وليست أقساماً يجب تكرارها كاملة في كل جزء؛ استخدم فقط الأقسام المناسبة للمحتوى لتوفير المساحة. لا تكرّر النظرة العامة أو الخلاصة بين الأجزاء. استخدم شرحاً واضحاً ومتكاملاً، وامنح كل موضوع وأمثلة الحل مساحة كافية دون حد مختصر مصطنع. قبل التسليم تحقّق أن آخر موضوع وآخر مثال في المصدر موجودان في الملاحظات. أعد المخرجات عبر استدعاء الأداة submit_video_notes فقط.`;
    // Use the frontier video-capable model for both complete transcripts and videos.
    const notesModel = "google/gemini-4-argon";
    let lastGeminiError: any = null;
    let parts: { title: string; notes: string }[] = [];
    let notes = "";

    const userPrompt = transcriptText
      ? `Read the ENTIRE transcript through its final sentence before writing. Cover every topic from beginning to end in consecutive parts, including the final topic and worked example. Give every topic and worked example enough detail; omit repetition, not source coverage. Do not repeat empty headings. Call submit_video_notes with all parts.\n\nTRANSCRIPT:\n${transcriptText}\n\nEND OF COMPLETE TRANSCRIPT. Check that your notes include the content immediately before this marker.`
      : `Watch the ENTIRE YouTube video from start to finish. Cover all topics in consecutive parts, including the final topic and worked example. Give every topic and worked example enough detail; omit repetition, not source coverage. Do not limit viewing to an opening segment. Call submit_video_notes with all parts.`;

    const partsTool = {
      type: "function" as const,
      function: {
        name: "submit_video_notes",
        description: "Submit segmented study notes for the video.",
        parameters: {
          type: "object",
          properties: {
            parts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Short title for this segment" },
                  notes: { type: "string", description: "Detailed markdown notes for this segment" },
                  review_questions: {
                    type: "array",
                    description: arabicEnglishCurriculum
                      ? "Three to six review questions written in English only. Do not use any Arabic letters."
                      : "Optional review questions.",
                    items: { type: "string" },
                    minItems: arabicEnglishCurriculum ? 3 : 0,
                    maxItems: 6,
                  },
                },
                required: arabicEnglishCurriculum
                  ? ["title", "notes", "review_questions"]
                  : ["title", "notes"],
                additionalProperties: false,
              },
            },
          },
          required: ["parts"], additionalProperties: false,
        },
      },
    };

    // One SDK-managed generation: never replay a potentially billed request on another model.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), transcriptText ? 60_000 : 140_000);
    try {
      const payload = await generateChatCompletion({
        model: notesModel,
        messages: transcriptText
          ? [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }]
          : [
              { role: "system", content: systemPrompt },
              { role: "user", content: [
                { type: "text", text: userPrompt },
                { type: "video_url", video_url: { url: url.trim() } },
              ] },
            ],
        tools: [partsTool],
        tool_choice: { type: "function", function: { name: "submit_video_notes" } },
      }, { signal: controller.signal });
      if (["length", "max_tokens", "MAX_TOKENS"].includes(payload.choices?.[0]?.finish_reason || "")) {
        return jsonResponse({ error: lang0 === "ar"
          ? "توقفت الملاحظات قبل اكتمال الفيديو، لذلك لم يتم حفظها كملاحظات كاملة. جرّب تقسيم المحاضرة إلى أجزاء."
          : "The notes stopped before covering the whole video and were not saved as complete. Try splitting the lecture into parts.", retryable: false }, 502);
      }
      const toolCall = payload.choices?.[0]?.message?.tool_calls?.find(call => call.type === "function" && call.function.name === "submit_video_notes");
      if (toolCall?.type === "function") {
        const args = JSON.parse(toolCall.function.arguments);
        if (Array.isArray(args?.parts) && args.parts.length) {
          const candidateParts = args.parts.filter((p: any) => p?.title && p?.notes);
          const checkedParts = arabicEnglishCurriculum
            ? formatEnglishCurriculumParts(candidateParts, nadiaEnglishStyle)
            : candidateParts;
          if (!checkedParts) {
            return jsonResponse({ error: "Could not generate English review questions. Please try again.", retryable: false }, 422);
          }
          parts = checkedParts;
          notes = parts.map(p => `# ${p.title}\n\n${p.notes}`).join("\n\n---\n\n");
        }
      }
    } catch (error) {
      if (error instanceof GatewayError) {
        console.error("Video notes generation failed", { code: error.code, status: error.httpStatus, ids: error.ids });
        lastGeminiError = { status: error.httpStatus ?? 500, payload: null };
      } else {
        console.error("Video notes response failed", String(error));
        lastGeminiError = { status: 500, payload: null };
      }
    } finally {
      clearTimeout(timeout);
    }

    if (!notes.trim() && lastGeminiError) {
      const quota = lastGeminiError.status === 429 || lastGeminiError.payload?.error?.status === "RESOURCE_EXHAUSTED";
      const overloaded = lastGeminiError.status === 503 || lastGeminiError.payload?.error?.status === "UNAVAILABLE";
      const paymentRequired = lastGeminiError.status === 402;
      const retryAfter = getRetryAfterSeconds(lastGeminiError.payload);
      const disabledOrDaily = isDailyOrDisabledQuota(lastGeminiError.payload);
      const friendly = paymentRequired
        ? (lang0 === "ar"
          ? "نفد رصيد الذكاء الاصطناعي في هذا التطبيق. يرجى إبلاغ المسؤول لإعادة الشحن."
          : "The app's AI credits have run out. Please contact the owner to top up.")
        : overloaded
        ? (lang0 === "ar"
          ? "الذكاء الاصطناعي مزدحم حالياً. حاول مرة أخرى بعد قليل."
          : "The AI is overloaded right now. Please try again in a moment.")
        : quota
        ? (lang0 === "ar"
          ? "تم الوصول إلى حد استخدام الذكاء الاصطناعي للفيديو حالياً. جرّب لاحقاً أو فعّل حصة أعلى لمفتاح Gemini."
          : "The video AI quota is currently exhausted. Try again later or increase the Gemini API quota.")
        : (lang0 === "ar"
          ? "تعذّر إنشاء الملاحظات من هذا الفيديو. تأكد من الرابط أو جرّب فيديو آخر."
          : "Could not generate notes from this video. Check the link or try another video.");

      return jsonResponse({
        error: friendly,
        retryable: overloaded || (quota && !disabledOrDaily && retryAfter > 0),
        retryAfter,
        quota,
      }, paymentRequired ? 402 : quota ? 429 : overloaded ? 503 : 500);
    }

    if (!notes.trim()) {
      return jsonResponse({ error: "Empty response from model", retryable: true }, 502);
    }
    if (cacheKey) {
      await cacheClient.from("video_notes_cache")
        .upsert({ cache_key: cacheKey, notes, parts }).then(() => {}, (e) => console.error("cache save failed", e));
    }
    return jsonResponse({ notes, parts, transcript: transcriptText });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});
