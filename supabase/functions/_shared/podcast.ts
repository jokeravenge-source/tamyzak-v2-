import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export type PodcastScriptSegment = {
  narration_text: string;
  checkpoint_prompt: string;
  answer_key: string;
};

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export function extractYouTubeId(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
    if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/);
      return match?.[1] ?? null;
    }
  } catch { /* invalid URL */ }
  return null;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function fetchVideoTitle(youtubeUrl: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`);
    if (!response.ok) return null;
    const payload = await response.json();
    return typeof payload?.title === "string" ? payload.title.slice(0, 200) : null;
  } catch {
    return null;
  }
}

export async function fetchCaptionTranscript(videoId: string): Promise<string | null> {
  const watch = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!watch.ok) throw new Error("تعذّر الوصول إلى فيديو يوتيوب. تأكد من أن الفيديو عام وغير مقيّد.");
  const html = await watch.text();
  const marker = '"captionTracks":';
  const start = html.indexOf(marker);
  if (start < 0) return null;
  const arrayStart = start + marker.length;
  const arrayEnd = html.indexOf('],"audioTracks"', arrayStart);
  if (arrayEnd < 0) return null;

  let tracks: Array<{ baseUrl?: string; languageCode?: string }> = [];
  try {
    tracks = JSON.parse(html.slice(arrayStart, arrayEnd + 1));
  } catch {
    return null;
  }
  const track = tracks.find((item) => item.languageCode?.startsWith("ar")) ?? tracks[0];
  if (!track?.baseUrl) return null;
  const captionUrl = decodeHtml(track.baseUrl) + "&fmt=json3";
  const captions = await fetch(captionUrl);
  if (!captions.ok) return null;
  const data = await captions.json();
  const transcript = (data?.events ?? [])
    .flatMap((event: { segs?: Array<{ utf8?: string }> }) => event.segs ?? [])
    .map((segment: { utf8?: string }) => segment.utf8 ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return transcript.length >= 80 ? transcript : null;
}

/** Uses the same Supadata YouTube transcript API and secret as Video to Notes. */
export async function fetchSupadataTranscript(youtubeUrl: string): Promise<string | null> {
  const apiKey = Deno.env.get("SUPADATA_API_KEY");
  if (!apiKey) return null;
  try {
    const endpoint = `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(youtubeUrl)}&lang=ar&text=true`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    const response = await fetch(endpoint, {
      headers: { "x-api-key": apiKey },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      console.error("Supadata podcast transcript failed", response.status, (await response.text()).slice(0, 300));
      return null;
    }
    const data = await response.json().catch(() => null);
    const transcript = typeof data?.content === "string"
      ? data.content
      : Array.isArray(data?.content)
        ? data.content.map((item: { text?: unknown }) => typeof item?.text === "string" ? item.text : "").join(" ")
        : "";
    const cleaned = transcript.replace(/\s+/g, " ").trim();
    return cleaned.length >= 80 ? cleaned : null;
  } catch (error) {
    console.error("Supadata podcast transcript error", error);
    return null;
  }
}

async function getFallbackAudio(youtubeUrl: string, videoId: string): Promise<Blob> {
  const extractorUrl = Deno.env.get("YOUTUBE_AUDIO_EXTRACTOR_URL");
  if (!extractorUrl) {
    throw new Error("لا تتوفر ترجمة لهذا الفيديو، وخدمة تحويل الصوت الاحتياطية غير مهيأة حالياً.");
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const extractorKey = Deno.env.get("YOUTUBE_AUDIO_EXTRACTOR_KEY");
  if (extractorKey) headers.Authorization = `Bearer ${extractorKey}`;
  const extraction = await fetch(extractorUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ youtube_url: youtubeUrl, video_id: videoId, format: "audio" }),
  });
  if (!extraction.ok) throw new Error("تعذّر تجهيز صوت الفيديو. قد يكون الفيديو خاصاً أو مقيّداً.");
  const result = await extraction.json();
  if (typeof result?.audio_url !== "string") throw new Error("لم تُرجع خدمة الصوت ملفاً صالحاً.");
  const audio = await fetch(result.audio_url);
  if (!audio.ok) throw new Error("تعذّر تنزيل صوت الفيديو للنسخ.");
  const maxBytes = 25 * 1024 * 1024;
  const size = Number(audio.headers.get("content-length") ?? "0");
  if (size > maxBytes) throw new Error("صوت الفيديو أكبر من الحد المسموح. جرّب محاضرة أقصر.");
  const blob = await audio.blob();
  if (blob.size > maxBytes) throw new Error("صوت الفيديو أكبر من الحد المسموح. جرّب محاضرة أقصر.");
  return blob;
}

export async function transcribeAudio(audio: Blob, filename = "answer.webm"): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("خدمة تحويل الصوت إلى نص غير مهيأة.");
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", Deno.env.get("WHISPER_MODEL") ?? "whisper-1");
  form.append("language", "ar");
  form.append("response_format", "json");
  form.append("prompt", "تفريغ عربي لمحاضرة علمية لطلاب السادس العلمي في العراق.");
  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!response.ok) throw new Error("تعذّر تحويل التسجيل إلى نص. حاول التسجيل مرة أخرى.");
  const result = await response.json();
  const text = typeof result?.text === "string" ? result.text.trim() : "";
  if (!text) throw new Error("لم نتمكن من سماع إجابتك بوضوح. حاول التسجيل مرة أخرى.");
  return text;
}

export async function transcriptFor(youtubeUrl: string, videoId: string): Promise<string> {
  // Keep caption extraction consistent with Video to Notes: use the project's
  // existing Supadata integration first, then YouTube's direct caption track.
  const supadata = await fetchSupadataTranscript(youtubeUrl);
  if (supadata) return supadata;
  const captions = await fetchCaptionTranscript(videoId);
  if (captions) return captions;
  const audio = await getFallbackAudio(youtubeUrl, videoId);
  return await transcribeAudio(audio, `${videoId}.mp3`);
}

function parseJsonOnly(raw: string): unknown {
  const clean = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(clean);
}

export async function callClaudeJson(prompt: string, maxTokens = 3500): Promise<unknown> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("خدمة إعداد الشرح غير مهيأة.");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: Deno.env.get("CLAUDE_MODEL") ?? "claude-sonnet-4-5-20250929",
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) throw new Error("تعذّر إعداد الشرح الذكي لهذه المحاضرة.");
  const payload = await response.json();
  const raw = payload?.content?.find((part: { type?: string }) => part.type === "text")?.text;
  if (typeof raw !== "string") throw new Error("استجابة الشرح غير مكتملة.");
  try {
    return parseJsonOnly(raw);
  } catch {
    throw new Error("تعذّر تنظيم الشرح إلى مقاطع. حاول مرة أخرى.");
  }
}

export async function generateScript(transcript: string, subject?: string): Promise<PodcastScriptSegment[]> {
  const limited = transcript.slice(0, 90000);
  const result = await callClaudeJson(`
أنت مدرس عراقي خبير لطلاب السادس العلمي. حوّل نص المحاضرة التالي إلى شرح صوتي عربي واضح، تعليمي، ودقيق.
قسّم المحتوى إلى 3 إلى 5 مقاطع فقط عند حدود المفاهيم الطبيعية، لا حسب الزمن.
لا تترجم حرفياً ولا تنسخ النص؛ أعد صياغته كمدرس يشرح الفكرة بأسلوب محادثة مناسب للصوت.
كل النصوص التي سيسمعها الطالب يجب أن تكون بالعربية فقط.
المادة الاختيارية: ${subject || "غير محددة"}

أرجع مصفوفة JSON فقط بلا markdown أو مقدمة. كل عنصر بالشكل:
{"narration_text":"شرح عربي منطوق","checkpoint_prompt":"لخّص لي بما فهمته حتى الآن","answer_key":"المفاهيم الأساسية المطلوبة، بالعربية"}

النص الخام:
${limited}
`);
  if (!Array.isArray(result) || result.length < 3 || result.length > 5) {
    throw new Error("لم ينتج الشرح عدداً مناسباً من المقاطع. حاول مرة أخرى.");
  }
  return result.map((value) => {
    const item = value as Record<string, unknown>;
    const narration_text = typeof item.narration_text === "string" ? item.narration_text.trim() : "";
    const checkpoint_prompt = typeof item.checkpoint_prompt === "string" ? item.checkpoint_prompt.trim() : "";
    const answer_key = typeof item.answer_key === "string" ? item.answer_key.trim() : "";
    if (!narration_text || !checkpoint_prompt || !answer_key) throw new Error("أحد مقاطع الشرح غير مكتمل.");
    return { narration_text, checkpoint_prompt, answer_key };
  });
}

export async function uploadPodcastAudio(
  admin: SupabaseClient,
  userId: string,
  sessionId: string,
  filename: string,
  bytes: Blob | Uint8Array,
  contentType: string,
): Promise<string> {
  const path = `${userId}/${sessionId}/${filename}`;
  const { error } = await admin.storage.from("podcast-audio").upload(path, bytes, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error("تعذّر حفظ ملف الصوت.");
  return path;
}

export async function signedAudioUrl(admin: SupabaseClient, path: string | null): Promise<string | null> {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const { data, error } = await admin.storage.from("podcast-audio").createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}

export async function fallbackTranscriptFor(youtubeUrl: string, videoId: string): Promise<string> {
  const audio = await getFallbackAudio(youtubeUrl, videoId);
  return await transcribeAudio(audio, `${videoId}.mp3`);
}
