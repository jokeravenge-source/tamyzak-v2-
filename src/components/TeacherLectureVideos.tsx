import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Youtube, Plus, Loader2, Sparkles, CheckCircle2, Trash2, X, Play,
  BookOpen, Download, ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AppLanguage } from "@/components/LanguageGate";
import { getCuratedTeacherLectureNote } from "@/data/teacherLectureNotes";
import { getNadiaArabicLectureNoteSourceKeys } from "@/data/nadiaLectureNoteSources";
import { getNadiaTopicTitle, type NadiaChapterNumber } from "@/data/nadiaTeacherContent";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type NotePart = { title: string; notes: string };
type LectureVideo = {
  id: string;
  teacher_id: string;
  topic_key: string;
  youtube_url: string;
  video_id: string | null;
  title: string | null;
  transcript: string | null;
  notes_parts: NotePart[];
  approved: boolean;
  created_at: string;
};

type PrettyBlock = {
  type: "h1" | "h2" | "h3" | "text" | "bullet" | "numbered" | "todo" | "quote" | "divider";
  text: string;
};
type PrettyImage = { prompt: string; dataUrl: string };

const usesArabicExplanationEnglishCurriculum = (
  teacherId: string,
  contentLanguage: AppLanguage,
) => contentLanguage === "en"
  && (teacherId === "nadia-al-nuaimy" || teacherId.startsWith("mohammed-anzi"));

const L = {
  en: {
    videos: "Lectures & notes",
    addVideo: "Add YouTube lecture",
    ytUrl: "YouTube URL",
    optionalTitle: "Title (optional)",
    generate: "Generate notes",
    generating: "Generating notes…",
    preview: "Preview & approve",
    approve: "Approve & publish",
    publishVideoOnly: "Publish video only",
    saving: "Saving…",
    discard: "Discard",
    noVideos: "No lectures yet.",
    watch: "Watch",
    openNotes: "Open notes",
    delete: "Delete",
    confirmDelete: "Delete this video?",
    pending: "Pending approval",
    close: "Close",
    badUrl: "Please enter a valid YouTube URL",
    saved: "Lecture published",
    makePretty: "Beautiful notes",
    prettyIntro: "Generate a beautifully designed version with illustrations, then export as PDF.",
    prettyGenerate: "Generate beautiful notes",
    prettyGenerating: "Designing…",
    exportPdf: "Download PDF",
    illustrations: "Illustrations",
  },
  ar: {
    videos: "المحاضرات والملاحظات",
    addVideo: "إضافة محاضرة يوتيوب",
    ytUrl: "رابط اليوتيوب",
    optionalTitle: "العنوان (اختياري)",
    generate: "توليد الملاحظات",
    generating: "جاري توليد الملاحظات…",
    preview: "معاينة واعتماد",
    approve: "اعتماد ونشر",
    publishVideoOnly: "نشر الفيديو فقط",
    saving: "جاري الحفظ…",
    discard: "إلغاء",
    noVideos: "لا توجد محاضرات بعد.",
    watch: "مشاهدة",
    openNotes: "فتح الملاحظات",
    delete: "حذف",
    confirmDelete: "حذف هذا الفيديو؟",
    pending: "بانتظار الاعتماد",
    close: "إغلاق",
    badUrl: "أدخل رابط يوتيوب صحيح",
    saved: "تم نشر المحاضرة",
    makePretty: "ملاحظات مصممة",
    prettyIntro: "أنشئ نسخة أنيقة مع رسوم توضيحية، ثم صدّرها كملف PDF.",
    prettyGenerate: "توليد ملاحظات مصممة",
    prettyGenerating: "جاري التصميم…",
    exportPdf: "تحميل PDF",
    illustrations: "رسوم توضيحية",
  },
} as const;

function extractYouTubeId(url: string) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v")!;
    const m = u.pathname.match(/\/(embed|shorts)\/([\w-]+)/);
    if (m) return m[2];
    return null;
  } catch { return null; }
}

async function getFunctionError(error: any, fallback: string) {
  const response = error?.context;
  if (response && typeof response.clone === "function") {
    try {
      const payload = await response.clone().json();
      return String(payload?.error || payload?.message || fallback);
    } catch { /* use fallback below */ }
  }
  return /non-2xx/i.test(String(error?.message || "")) ? fallback : String(error?.message || fallback);
}

function renderInline(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-extrabold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index} dir="ltr" className="mx-1 inline-block rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[0.9em] text-primary">{part.slice(1, -1)}</code>;
      }
      return <span key={index}>{part}</span>;
    });
}

// ---- Safe, lightweight markdown renderer for lecture summaries --------
function renderMd(md: string, isRTL: boolean) {
  const lines = md.split(/\r?\n/);
  const out: JSX.Element[] = [];
  let buf: string[] = [];
  const flush = (key: string) => {
    if (!buf.length) return;
    out.push(
      <p key={key} className="my-2 min-w-0 whitespace-pre-line break-words text-[15px] leading-8 text-foreground/85 [overflow-wrap:anywhere]">
        {renderInline(buf.join("\n"))}
      </p>,
    );
    buf = [];
  };
  lines.forEach((raw, i) => {
    const line = raw.replace(/\s+$/, "");
    if (/^#{3,6}\s+/.test(line)) {
      flush(`p${i}`);
      out.push(<h4 key={i} dir="auto" className="mb-2 mt-6 break-words text-lg font-extrabold text-foreground">{renderInline(line.replace(/^#{3,6}\s+/, ""))}</h4>);
    } else if (/^##\s+/.test(line)) {
      flush(`p${i}`);
      out.push(<h3 key={i} dir="auto" className="mb-3 mt-7 border-s-4 border-primary ps-3 text-xl font-extrabold text-primary">{renderInline(line.replace(/^##\s+/, ""))}</h3>);
    } else if (/^#\s+/.test(line)) {
      flush(`p${i}`);
      out.push(<h2 key={i} className="mb-4 mt-2 break-words text-2xl font-black leading-tight text-primary md:text-3xl">{renderInline(line.replace(/^#\s+/, ""))}</h2>);
    } else if (/^---+$/.test(line)) {
      flush(`p${i}`);
      out.push(<hr key={i} className="my-5 border-border" />);
    } else if (/^[-*•]\s+/.test(line)) {
      flush(`p${i}`);
      out.push(
        <div key={i} className="my-2 flex min-w-0 items-start gap-3 rounded-xl bg-secondary/45 px-3 py-2.5 text-[15px] leading-7 text-foreground/90">
          <span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <p className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">{renderInline(line.replace(/^[-*•]\s+/, ""))}</p>
        </div>,
      );
    } else if (/^\d+[.)]\s+/.test(line)) {
      flush(`p${i}`);
      const match = line.match(/^(\d+)[.)]\s+(.*)$/);
      out.push(
        <div key={i} className="my-2 flex min-w-0 items-start gap-3 rounded-xl border border-border/70 px-3 py-2.5 text-[15px] leading-7 text-foreground/90">
          <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-lg bg-primary/10 px-1 text-xs font-bold text-primary">{match?.[1]}</span>
          <p dir="auto" className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">{renderInline(match?.[2] || line)}</p>
        </div>,
      );
    } else if (!line.trim()) {
      flush(`p${i}`);
    } else {
      buf.push(line);
    }
  });
  flush("p-end");
  return <div dir={isRTL ? "rtl" : "ltr"} className="min-w-0 max-w-full overflow-hidden text-start">{out}</div>;
}

// ---- Main component ----------------------------------------------------
export default function TeacherLectureVideos({
  teacherId, topicKey, language, contentLanguage = language, isAdmin,
}: {
  teacherId: string;
  topicKey: string;
  language: AppLanguage;
  contentLanguage?: AppLanguage;
  isAdmin: boolean;
}) {
  const englishNadia = teacherId === "nadia-al-nuaimy" && contentLanguage === "en";
  const notesLanguage = englishNadia ? "en" : language;
  const T = L[notesLanguage];
  const topicMatch = englishNadia ? topicKey.match(/^nadia-en-ch([1-5])-lec(\d+)-study$/) : null;
  const englishTopicTitle = topicMatch ? getNadiaTopicTitle("en", Number(topicMatch[1]) as NadiaChapterNumber, Number(topicMatch[2]), "en") : undefined;
  const isRTL = language === "ar";
  const usesArabicEnglishCurriculumStyle =
    usesArabicExplanationEnglishCurriculum(teacherId, contentLanguage);
  const [videos, setVideos] = useState<LectureVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [openVideo, setOpenVideo] = useState<LectureVideo | null>(null);
  const [playingVideo, setPlayingVideo] = useState<LectureVideo | null>(null);
  const curatedNote = useMemo(
    () => getCuratedTeacherLectureNote(teacherId, topicKey),
    [teacherId, topicKey],
  );
  const arabicFallbackTopicKeys = useMemo(
    () => teacherId === "nadia-al-nuaimy"
      ? getNadiaArabicLectureNoteSourceKeys(topicKey)
      : [],
    [teacherId, topicKey],
  );

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("teacher_topic_videos")
      .select("*")
      .eq("teacher_id", teacherId)
      .eq("topic_key", topicKey)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else {
      const savedVideos = (data ?? []) as unknown as LectureVideo[];
      const curatedVideo: LectureVideo[] = curatedNote ? [{
        id: `curated:${teacherId}:${topicKey}`,
        teacher_id: teacherId,
        topic_key: topicKey,
        youtube_url: "",
        video_id: null,
        title: curatedNote.title,
        transcript: null,
        notes_parts: [{ title: curatedNote.title, notes: curatedNote.notes }],
        approved: true,
        created_at: curatedNote.createdAt,
      }] : [];
      const hasEnglishNotes = [...curatedVideo, ...savedVideos].some((video) =>
        Array.isArray(video.notes_parts)
        && video.notes_parts.some((part) => typeof part?.notes === "string" && part.notes.trim().length > 0),
      );

      let arabicFallbackVideo: LectureVideo[] = [];
      if (!hasEnglishNotes && arabicFallbackTopicKeys.length > 0) {
        const { data: sourceRows, error: sourceError } = await supabase
          .from("teacher_topic_videos")
          .select("*")
          .eq("teacher_id", teacherId)
          .in("topic_key", arabicFallbackTopicKeys)
          .eq("approved", true);

        if (sourceError) {
          toast.error(sourceError.message);
        } else {
          const orderedSources = ((sourceRows ?? []) as unknown as LectureVideo[])
            .sort((a, b) =>
              arabicFallbackTopicKeys.indexOf(a.topic_key)
              - arabicFallbackTopicKeys.indexOf(b.topic_key),
            );
          const fallbackParts = orderedSources.flatMap((source) => source.notes_parts ?? []);

          if (fallbackParts.some((part) => typeof part?.notes === "string" && part.notes.trim().length > 0)) {
            arabicFallbackVideo = [{
              id: `arabic-fallback:${teacherId}:${topicKey}`,
              teacher_id: teacherId,
              topic_key: topicKey,
              youtube_url: "",
              video_id: null,
              title: contentLanguage === "en"
                ? "Lecture notes — Arabic curriculum source"
                : "ملاحظات المحاضرة — من محتوى المنهج العربي",
              transcript: null,
              notes_parts: fallbackParts,
              approved: true,
              created_at: orderedSources[0]?.created_at ?? new Date(0).toISOString(),
            }];
          }
        }
      }

      const rows = curatedNote && savedVideos.length ? savedVideos.map((row) => ({ ...row, notes_parts: [{ title: curatedNote.title, notes: curatedNote.notes }] })) : [...curatedVideo, ...savedVideos, ...arabicFallbackVideo];
      setVideos(englishTopicTitle ? rows.map((row) => ({ ...row, title: englishTopicTitle, notes_parts: row.notes_parts.map((part, index) => ({ ...part, title: row.notes_parts.length === 1 ? englishTopicTitle : `${englishTopicTitle} — Section ${index + 1}` })) })) : rows);
    }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [teacherId, topicKey, curatedNote, arabicFallbackTopicKeys]);

  const remove = async (id: string) => {
    if (!confirm(T.confirmDelete)) return;
    const { error } = await supabase.from("teacher_topic_videos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setVideos((v) => v.filter((x) => x.id !== id));
    if (playingVideo?.id === id) setPlayingVideo(null);
  };

  return (
    <section className="mt-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Youtube className="w-4 h-4 text-red-500" /> {T.videos}
        </h2>
        {isAdmin && !showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20"
          >
            <Plus className="w-3.5 h-3.5" /> {T.addVideo}
          </button>
        )}
      </div>

      {isAdmin && showAdd && (
        <AdminAddVideo
          teacherId={teacherId} topicKey={topicKey} language={language} contentLanguage={contentLanguage} T={T}
          onCancel={() => setShowAdd(false)}
          onSaved={(row) => { setVideos((v) => [row, ...v]); setShowAdd(false); }}
        />
      )}

      {playingVideo?.video_id && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="flex items-center gap-3 border-b border-border px-3 py-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/10 text-red-500">
              <Youtube className="h-4 w-4" />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-bold">{playingVideo.title || T.videos}</p>
            <button
              type="button"
              onClick={() => setPlayingVideo(null)}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label={T.close}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="aspect-video bg-black">
            <iframe
              key={playingVideo.video_id}
              src={`https://www.youtube-nocookie.com/embed/${playingVideo.video_id}?autoplay=1&rel=0&modestbranding=1`}
              title={playingVideo.title || T.videos}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full"
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
      ) : videos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{T.noVideos}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {videos.map((v) => (
            <li key={v.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="relative aspect-video bg-black">
                {v.video_id ? (
                  <button type="button" onClick={() => setPlayingVideo(v)} className="group/video relative block h-full w-full">
                    <img
                      src={`https://i.ytimg.com/vi/${v.video_id}/hqdefault.jpg`}
                      alt={v.title || ""}
                      className="h-full w-full object-cover opacity-90"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 grid place-items-center bg-black/10 transition group-hover/video:bg-black/30">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-red-600 text-white shadow-xl">
                        <Play className="h-5 w-5 fill-current" />
                      </span>
                    </span>
                  </button>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-5 text-center text-white">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/25 backdrop-blur">
                      <BookOpen className="h-7 w-7" />
                    </span>
                    <span className="text-sm font-black">
                      {language === "ar" ? "ملاحظات المحاضرة" : "Lecture notes"}
                    </span>
                  </div>
                )}
                {!v.approved && (
                  <span className="absolute top-2 start-2 text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-yellow-500/90 text-black font-semibold">
                    {T.pending}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{v.title || v.youtube_url}</p>
                <div className="mt-2 flex items-center gap-2">
                  {v.notes_parts?.some((part) => part.notes?.trim()) && (
                    <button
                      onClick={() => setOpenVideo(v)}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> {T.openNotes}
                    </button>
                  )}
                  {v.youtube_url && (
                    <button
                      type="button"
                      onClick={() => setPlayingVideo(v)}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-border text-xs hover:bg-secondary"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-500" /> {T.watch}
                    </button>
                  )}
                  {isAdmin
                    && !v.id.startsWith("curated:")
                    && !v.id.startsWith("arabic-fallback:")
                    && (
                    <button
                      onClick={() => remove(v.id)}
                      className="ms-auto h-8 w-8 grid place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10"
                      aria-label={T.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {openVideo && (
          <VideoNotesModal
            video={openVideo}
            language={notesLanguage}
            contentLanguage={contentLanguage}
            usesArabicEnglishCurriculumStyle={usesArabicEnglishCurriculumStyle}
            T={T}
            onClose={() => setOpenVideo(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ---- Admin add + generate ---------------------------------------------
function AdminAddVideo({
  teacherId, topicKey, language, contentLanguage, T, onCancel, onSaved,
}: {
  teacherId: string;
  topicKey: string;
  language: AppLanguage;
  contentLanguage: AppLanguage;
  T: (typeof L)[AppLanguage];
  onCancel: () => void;
  onSaved: (v: LectureVideo) => void;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState<"idle" | "gen" | "save">("idle");
  const [parts, setParts] = useState<NotePart[] | null>(null);
  const [transcript, setTranscript] = useState("");

  const generate = async () => {
    const vid = extractYouTubeId(url);
    if (!vid) return toast.error(T.badUrl);
    setBusy("gen");
    try {
      const { data, error } = await supabase.functions.invoke("video-notes", {
        body: {
          url,
          language: contentLanguage,
          mode: "notes",
          adminGeneration: true,
          notesStyle: usesArabicExplanationEnglishCurriculum(teacherId, contentLanguage)
            ? (teacherId === "nadia-al-nuaimy" ? "nadia-english-arabic-explanations" : "arabic-explanation-english-curriculum")
            : "default",
        },
      });
      if (error) throw new Error(await getFunctionError(error, language === "ar" ? "تعذّر توليد الملاحظات. حاول مجدداً." : "Failed to generate notes. Please try again."));
      if (data?.error) throw new Error(data.error);
      const p: NotePart[] = data?.parts || (data?.notes ? [{ title: T.videos, notes: data.notes }] : []);
      if (!p.length) throw new Error("No notes generated");
      setParts(p);
      setTranscript(data?.transcript || "");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate");
    } finally { setBusy("idle"); }
  };

  const publishVideoOnly = async () => {
    const vid = extractYouTubeId(url);
    if (!vid) return toast.error(T.badUrl);
    setBusy("save");
    try {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("teacher_topic_videos")
        .insert({
          teacher_id: teacherId,
          topic_key: topicKey,
          youtube_url: url.trim(),
          video_id: vid,
          title: title.trim() || (language === "ar" ? "محاضرة YouTube" : "YouTube lecture"),
          transcript: null,
          notes_parts: [],
          approved: true,
          created_by: u.user?.id,
        })
        .select("*")
        .single();
      if (error) throw error;
      toast.success(T.saved);
      onSaved(data as unknown as LectureVideo);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setBusy("idle");
    }
  };

  const approve = async () => {
    if (!parts) return;
    const vid = extractYouTubeId(url);
    setBusy("save");
    try {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("teacher_topic_videos")
        .insert({
          teacher_id: teacherId,
          topic_key: topicKey,
          youtube_url: url.trim(),
          video_id: vid,
          title: title.trim() || parts[0]?.title || null,
          transcript: transcript || null,
          notes_parts: parts as any,
          approved: true,
          created_by: u.user?.id,
        })
        .select("*")
        .single();
      if (error) throw error;
      toast.success(T.saved);
      onSaved(data as unknown as LectureVideo);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally { setBusy("idle"); }
  };

  return (
    <div className="mb-4 p-4 rounded-2xl border border-primary/30 bg-secondary/40 backdrop-blur">
      <div className="grid gap-3">
        <label className="text-xs text-muted-foreground">
          {T.ytUrl}
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          {T.optionalTitle}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border text-sm"
          />
        </label>

        {!parts ? (
          <div className="flex flex-wrap gap-2 justify-end">
            <button onClick={onCancel} className="h-10 px-4 rounded-lg border border-border text-sm hover:bg-secondary">{T.discard}</button>
            <button
              onClick={publishVideoOnly}
              disabled={!url || busy !== "idle"}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-primary/40 bg-primary/10 text-primary text-sm font-semibold disabled:opacity-50"
            >
              {busy === "save" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
              {busy === "save" ? T.saving : T.publishVideoOnly}
            </button>
            <button
              onClick={generate}
              disabled={!url || busy !== "idle"}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
            >
              {busy === "gen" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {busy === "gen" ? T.generating : T.generate}
            </button>
          </div>
        ) : (
          <>
            <div className="text-xs uppercase tracking-widest text-muted-foreground pt-2">{T.preview}</div>
            <div className="max-h-64 overflow-auto rounded-xl border border-border p-3 bg-background/50">
              {parts.map((p, i) => (
                <div key={i} className="mb-4">
                  <h4 className="text-sm font-bold text-primary mb-1">{p.title}</h4>
                  {renderMd(p.notes, contentLanguage === "ar")}
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setParts(null); setTranscript(""); }} className="h-10 px-4 rounded-lg border border-border text-sm hover:bg-secondary">{T.discard}</button>
              <button
                onClick={approve}
                disabled={busy === "save"}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90"
              >
                {busy === "save" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {busy === "save" ? T.saving : T.approve}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Notes viewer + beautiful/PDF export ------------------------------
function VideoNotesModal({
  video, language, contentLanguage, usesArabicEnglishCurriculumStyle, T, onClose,
}: {
  video: LectureVideo;
  language: AppLanguage;
  contentLanguage: AppLanguage;
  usesArabicEnglishCurriculumStyle: boolean;
  T: (typeof L)[AppLanguage];
  onClose: () => void;
}) {
  const isRTL = contentLanguage === "ar" || usesArabicEnglishCurriculumStyle;
  const [pretty, setPretty] = useState<{ blocks: PrettyBlock[]; images: PrettyImage[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [noteQuery, setNoteQuery] = useState("");
  const prettyRef = useRef<HTMLDivElement>(null);
  const isNadia = video.teacher_id === "nadia-al-nuaimy";
  const visibleParts = video.notes_parts.map((part, index) => ({ part, index })).filter(({ part }) =>
    !noteQuery.trim() || `${part.title} ${part.notes}`.toLocaleLowerCase().includes(noteQuery.trim().toLocaleLowerCase()),
  );

  const rawText = useMemo(
    () => video.notes_parts.map((p) => `# ${p.title}\n\n${p.notes}`).join("\n\n---\n\n"),
    [video],
  );

  const generatePretty = async () => {
    setBusy(true);
    try {
      const source = (video.transcript?.trim() || rawText).slice(0, 7500);
      const { data, error } = await supabase.functions.invoke("ai-notes-generate", {
        body: {
          topic: source,
          language: contentLanguage,
          notesStyle: usesArabicEnglishCurriculumStyle
            ? (video.teacher_id === "nadia-al-nuaimy" ? "nadia-english-arabic-explanations" : "arabic-explanation-english-curriculum")
            : "default",
        },
      });
      if (error) {
        throw new Error(await getFunctionError(
          error,
          language === "ar"
            ? "تعذّر إنشاء التصميم الجميل. حاول مجدداً بعد قليل."
            : "Could not generate the beautiful design. Please try again shortly.",
        ));
      }
      if (data?.error) throw new Error(data.error);
      const blocks = Array.isArray(data?.blocks) ? data.blocks : [];
      if (!blocks.length) {
        throw new Error(language === "ar" ? "لم يتم إنشاء محتوى صالح." : "No valid content was generated.");
      }
      setPretty({ blocks, images: Array.isArray(data?.images) ? data.images : [] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally { setBusy(false); }
  };

  const exportPdf = async () => {
    const node = prettyRef.current;
    if (!node) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        windowWidth: node.scrollWidth,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 40;
      const imgH = (canvas.height * imgW) / canvas.width;
      let heightLeft = imgH;
      let position = 20;
      pdf.addImage(imgData, "JPEG", 20, position, imgW, imgH);
      heightLeft -= pageH - 40;
      while (heightLeft > 0) {
        pdf.addPage();
        position = 20 - (imgH - heightLeft);
        pdf.addImage(imgData, "JPEG", 20, position, imgW, imgH);
        heightLeft -= pageH - 40;
      }
      pdf.save(`${video.title || "lecture"}.pdf`);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally { setExporting(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto bg-background/90 p-0 backdrop-blur-sm sm:p-4"
      onClick={onClose}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto min-h-screen w-full max-w-4xl overflow-hidden bg-card shadow-2xl sm:my-6 sm:min-h-0 sm:rounded-3xl sm:border sm:border-primary/30"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 p-4 backdrop-blur-xl">
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {language === "ar" ? "تلخيص المحاضرة" : "Lecture summary"}
            </p>
            <h3 className="truncate font-bold">{video.title || T.videos}</h3>
          </div>
          <button onClick={onClose} aria-label={T.close} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {video.video_id && (
          <div className="aspect-video bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${video.video_id}`}
              title={video.title || ""}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="p-3 sm:p-6">
          {isNadia && !pretty && (
            <div className="mb-5 space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <label className="block text-sm font-bold" htmlFor="lecture-notes-search">{language === "ar" ? "ابحث في الملاحظات" : "Search lecture notes"}</label>
              <input id="lecture-notes-search" value={noteQuery} onChange={(event) => setNoteQuery(event.target.value)} placeholder={language === "ar" ? "ابحث عن عنوان أو معلومة…" : "Search a heading or detail…"} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <p role="status" className="text-xs text-muted-foreground">{language === "ar" ? `${visibleParts.length} من ${video.notes_parts.length} أقسام` : `${visibleParts.length} of ${video.notes_parts.length} sections`}</p>
              <nav aria-label={language === "ar" ? "أقسام الملاحظات" : "Notes sections"} className="flex flex-wrap gap-2">
                {visibleParts.map(({ part, index }) => <a key={index} href={`#lecture-note-section-${index}`} className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:border-primary">{index + 1}. {part.title}</a>)}
              </nav>
            </div>
          )}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {!pretty ? (
              <button
                onClick={generatePretty}
                disabled={busy}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-r from-fuchsia-500 to-primary text-white text-sm font-semibold disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {busy ? T.prettyGenerating : T.prettyGenerate}
              </button>
            ) : (
              <button
                onClick={exportPdf}
                disabled={exporting}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {T.exportPdf}
              </button>
            )}
            {!pretty && (
              <span className="text-xs text-muted-foreground">{T.prettyIntro}</span>
            )}
            {isNadia && !pretty && <button onClick={exportPdf} disabled={exporting || !!noteQuery.trim()} title={noteQuery.trim() ? (language === "ar" ? "امسح البحث لتنزيل جميع الأقسام" : "Clear the search to download all sections") : undefined} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-secondary disabled:opacity-50"><Download className="h-4 w-4" />{exporting ? (language === "ar" ? "جارٍ التصدير…" : "Exporting…") : T.exportPdf}</button>}
            {isNadia && !pretty && noteQuery.trim() && <span className="text-xs text-muted-foreground">{language === "ar" ? "امسح البحث لتنزيل جميع الأقسام" : "Clear search to download all sections"}</span>}
          </div>

          {pretty ? (
            <div
              ref={prettyRef}
              dir={isRTL ? "rtl" : "ltr"}
              className="p-8 rounded-2xl bg-white text-gray-900"
              style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
            >
              <PrettyBlocks blocks={pretty.blocks} images={pretty.images} title={video.title || ""} T={T} />
            </div>
          ) : (
            <article ref={prettyRef} className="max-w-none overflow-hidden rounded-2xl border border-border bg-background/45 shadow-sm">
              {isNadia && visibleParts.length === 0 && <p className="p-6 text-sm text-muted-foreground">{language === "ar" ? "لا توجد أقسام مطابقة لبحثك." : "No sections match your search."}</p>}
              {(isNadia ? visibleParts : video.notes_parts.map((part, index) => ({part, index}))).map(({part: p, index: i}) => (
                <section id={`lecture-note-section-${i}`} key={i} className="min-w-0 scroll-mt-24 border-b border-border p-4 last:border-b-0 sm:p-7">
                  <div className="mb-5 flex min-w-0 items-start gap-3">
                    <span className="grid h-8 min-w-8 shrink-0 place-items-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground">{i + 1}</span>
                    <h3 className="min-w-0 break-words text-xl font-black leading-tight text-primary sm:text-2xl">{p.title}</h3>
                  </div>
                  {renderMd(p.notes, isRTL)}
                </section>
              ))}
            </article>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PrettyBlocks({
  blocks, images, title, T,
}: { blocks: PrettyBlock[]; images: PrettyImage[]; title: string; T: (typeof L)[AppLanguage] }) {
  return (
    <div>
      <div className="mb-6 pb-4 border-b-4 border-fuchsia-500">
        <h1 className="text-3xl font-black bg-gradient-to-r from-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
          {title || "Study Notes"}
        </h1>
      </div>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h1": return <h1 key={i} className="text-2xl font-black mt-6 mb-3 text-indigo-700">{b.text}</h1>;
          case "h2": return <h2 key={i} className="text-xl font-bold mt-5 mb-2 text-fuchsia-700 border-s-4 border-fuchsia-500 ps-3">{b.text}</h2>;
          case "h3": return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-gray-800">{b.text}</h3>;
          case "text": return <p key={i} className="text-[15px] leading-8 my-2 text-gray-800">{b.text}</p>;
          case "bullet": return <li key={i} className="ms-6 list-disc text-[15px] leading-8 text-gray-800">{b.text}</li>;
          case "numbered": return <li key={i} className="ms-6 list-decimal text-[15px] leading-8 text-gray-800">{b.text}</li>;
          case "todo": return <li key={i} className="ms-6 list-none text-[15px] leading-8 text-gray-800">☐ {b.text}</li>;
          case "quote": return (
            <blockquote key={i} className="my-4 p-4 rounded-xl border-s-4 border-amber-500 bg-amber-50 text-amber-900 text-[15px] leading-7">
              💡 {b.text}
            </blockquote>
          );
          case "divider": return <hr key={i} className="my-5 border-gray-200" />;
          default: return null;
        }
      })}

      {images.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-fuchsia-700">
            <ImageIcon className="w-5 h-5" /> {T.illustrations}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((im, i) => (
              <figure key={i} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img src={im.dataUrl} alt={im.prompt} className="w-full h-auto" />
                <figcaption className="text-xs p-2 text-gray-600">{im.prompt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

