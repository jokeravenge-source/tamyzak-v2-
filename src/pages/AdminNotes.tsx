import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, StickyNote, ChevronRight, Check, X, RotateCcw, BookOpen, ListX, Sparkles, ArrowUpRight, Atom, Dna } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { markAllAdminNotesSeen } from "@/lib/unseenAdminNotes";

import type { AppLanguage } from "@/components/LanguageGate";
import {
  AdminNoteRenderer,
  type AdminNoteBlock,
} from "@/components/AdminNoteRenderer";

type NoteRow = {
  id: string;
  title: string;
  blocks: AdminNoteBlock[];
  cover_emoji: string | null;
  background_image_url: string | null;
  updated_at: string;
  notebook_id: string | null;
};

type NotebookRow = {
  id: string;
  title: string;
  description: string | null;
  cover_emoji: string | null;
  cover_image_url: string | null;
};

const storeKey = (nbId: string) => `admin-notes-unknown:${nbId}`;
const readUnknown = (nbId: string): string[] => {
  try {
    return JSON.parse(localStorage.getItem(storeKey(nbId)) || "[]");
  } catch {
    return [];
  }
};
const writeUnknown = (nbId: string, ids: string[]) =>
  localStorage.setItem(storeKey(nbId), JSON.stringify(Array.from(new Set(ids))));

const NOTE_COVER_GRADIENTS = [
  "radial-gradient(circle at 18% 16%, rgba(255,255,255,0.32), transparent 30%), linear-gradient(140deg, #172554 0%, #4338ca 52%, #7c3aed 100%)",
  "radial-gradient(circle at 82% 18%, rgba(255,255,255,0.28), transparent 31%), linear-gradient(140deg, #064e3b 0%, #0f766e 48%, #0891b2 100%)",
  "radial-gradient(circle at 20% 22%, rgba(255,255,255,0.3), transparent 32%), linear-gradient(140deg, #881337 0%, #be185d 50%, #f97316 100%)",
  "radial-gradient(circle at 78% 20%, rgba(255,255,255,0.3), transparent 30%), linear-gradient(140deg, #78350f 0%, #d97706 52%, #f59e0b 100%)",
  "radial-gradient(circle at 16% 18%, rgba(255,255,255,0.3), transparent 30%), linear-gradient(140deg, #14532d 0%, #059669 50%, #65a30d 100%)",
  "radial-gradient(circle at 82% 18%, rgba(255,255,255,0.3), transparent 30%), linear-gradient(140deg, #4a044e 0%, #86198f 50%, #db2777 100%)",
] as const;

const PHYSICS_COVER_GRADIENT =
  "radial-gradient(circle at 18% 14%, rgba(125,211,252,0.48), transparent 30%), radial-gradient(circle at 86% 18%, rgba(59,130,246,0.42), transparent 34%), linear-gradient(140deg, #071a3d 0%, #075985 48%, #2563eb 100%)";

const BIOLOGY_COVER_GRADIENT =
  "radial-gradient(circle at 18% 14%, rgba(134,239,172,0.46), transparent 30%), radial-gradient(circle at 86% 18%, rgba(16,185,129,0.42), transparent 34%), linear-gradient(140deg, #052e16 0%, #047857 48%, #16a34a 100%)";

const isPhysicsNotebook = (title: string) =>
  /physics|فيزياء|الفيزياء/i.test(title.trim());

const isBiologyNotebook = (title: string) =>
  /biology|أحياء|احياء|الأحياء|الاحياء/i.test(title.trim());

const noteCoverGradient = (id: string) => {
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return NOTE_COVER_GRADIENTS[(hash >>> 0) % NOTE_COVER_GRADIENTS.length];
};

const hasVisibleBlocks = (blocks: AdminNoteBlock[]) =>
  blocks.some((block) => {
    if ("text" in block) return block.text.trim().length > 0;
    if ("items" in block) return block.items.some((item) => item.trim().length > 0);
    return false;
  });

const NoteCard = ({
  note,
  language,
  fallbackCoverUrl,
  isPhysics,
  isBiology,
  onOpen,
  onSwipe,
}: {
  note: NoteRow;
  language: AppLanguage;
  fallbackCoverUrl?: string | null;
  isPhysics?: boolean;
  isBiology?: boolean;
  onOpen: () => void;
  onSwipe: (understood: boolean) => void;
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-12, 12]);
  const yesOpacity = useTransform(x, [40, 160], [0, 1]);
  const noOpacity = useTransform(x, [-160, -40], [1, 0]);
  const coverUrl = note.background_image_url || fallbackCoverUrl;
  const coverGradient = isPhysics
    ? PHYSICS_COVER_GRADIENT
    : isBiology
      ? BIOLOGY_COVER_GRADIENT
      : noteCoverGradient(note.id);
  const hasContent = hasVisibleBlocks(note.blocks);
  const cardLabel = language === "ar" ? "إثرائية" : "Enrichment";
  const openLabel = language === "ar" ? "افتح للتفاصيل" : "Open details";

  return (
    <motion.article
      drag="x"
      style={{ x, rotate }}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onSwipe(true);
        else if (info.offset.x < -120) onSwipe(false);
      }}
      onTap={onOpen}
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative mx-auto flex w-full max-w-xl cursor-grab touch-pan-y flex-col overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[0_28px_80px_-30px_hsl(var(--primary)/0.55),0_8px_24px_-18px_rgba(15,23,42,0.45)] ring-1 ring-black/5 transition-[border-color,box-shadow] duration-300 hover:border-primary/35 hover:shadow-[0_34px_90px_-30px_hsl(var(--primary)/0.65),0_12px_30px_-18px_rgba(15,23,42,0.5)] active:cursor-grabbing"
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      <motion.div
        style={{ opacity: yesOpacity }}
        className="absolute top-5 start-5 z-30 grid h-14 w-14 rotate-[-8deg] place-items-center rounded-2xl border-2 border-emerald-300 bg-emerald-500/25 text-2xl font-bold text-white shadow-lg backdrop-blur-md"
      >
        ✓
      </motion.div>
      <motion.div
        style={{ opacity: noOpacity }}
        className="absolute top-5 end-5 z-30 grid h-14 w-14 rotate-[8deg] place-items-center rounded-2xl border-2 border-rose-300 bg-rose-500/25 text-2xl font-bold text-white shadow-lg backdrop-blur-md"
      >
        ✕
      </motion.div>

      <div
        className="relative h-56 shrink-0 overflow-hidden sm:h-64"
        style={{ background: coverUrl ? "hsl(var(--card))" : coverGradient }}
      >
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
          />
        )}
        <div className="pointer-events-none absolute -start-12 -top-16 h-44 w-44 rounded-full bg-white/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -end-12 h-52 w-52 rounded-full bg-black/30 blur-3xl" />
        {isPhysics && coverUrl && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-950/75 via-blue-700/55 to-cyan-500/35 mix-blend-multiply" />
        )}
        {isBiology && coverUrl && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-950/75 via-emerald-700/55 to-lime-500/35 mix-blend-multiply" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_12%,rgba(255,255,255,0.16)_42%,transparent_68%)] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/75" />

        <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/25 bg-black/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-200" />
          {cardLabel}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-5 text-white sm:p-6">
          <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl border text-4xl shadow-[0_12px_30px_-16px_rgba(0,0,0,0.75)] backdrop-blur-md ${isPhysics ? "border-sky-200/45 bg-sky-400/20 text-sky-50" : isBiology ? "border-emerald-200/45 bg-emerald-400/20 text-emerald-50" : "border-white/25 bg-white/15"}`}>
            {isPhysics ? <Atom className="h-9 w-9" strokeWidth={2.1} /> : isBiology ? <Dna className="h-9 w-9" strokeWidth={2.1} /> : (note.cover_emoji || "📘")}
          </div>
          <div className="min-w-0 flex-1 pb-0.5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              {language === "ar" ? "بطاقة معرفية" : "Knowledge card"}
            </p>
            <h2 className="line-clamp-2 text-2xl font-extrabold leading-tight drop-shadow-md md:text-3xl">
              {note.title}
            </h2>
          </div>
        </div>
      </div>

      {hasContent && (
        <div className="relative max-h-[min(42svh,24rem)] overflow-y-auto border-t border-border/60 bg-gradient-to-b from-card via-card to-secondary/30 p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <StickyNote className="h-3.5 w-3.5" />
              </span>
              {language === "ar" ? "ملخص الإثرائية" : "Enrichment summary"}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
              {openLabel}
              <ArrowUpRight className="h-3.5 w-3.5 rtl:-rotate-90" />
            </span>
          </div>
          <AdminNoteRenderer blocks={note.blocks} language={language} />
        </div>
      )}
    </motion.article>
  );
};

const AdminNotes = ({ language, onBack }: { language: AppLanguage; onBack: () => void }) => {
  const isRTL = language === "ar";
  const [notebooks, setNotebooks] = useState<NotebookRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notebook, setNotebook] = useState<NotebookRow | null>(null);
  const [queue, setQueue] = useState<NoteRow[]>([]);
  const [index, setIndex] = useState(0);
  const [unknownIds, setUnknownIds] = useState<string[]>([]);
  const [mode, setMode] = useState<"deck" | "unknown-list">("deck");
  const [reviewing, setReviewing] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteRow | null>(null);

  useEffect(() => {
    void markAllAdminNotesSeen();
  }, []);

  useEffect(() => {

    (async () => {
      const [nbRes, nRes] = await Promise.all([
        (supabase as any)
          .from("admin_notebooks")
          .select("id, title, description, cover_emoji, cover_image_url")
          .eq("published", true)
          .order("created_at", { ascending: false }),
        (supabase as any)
          .from("admin_notes")
          .select("id, title, blocks, cover_emoji, background_image_url, updated_at, notebook_id")
          .eq("published", true)
          .order("updated_at", { ascending: false }),
      ]);
      setNotebooks((nbRes.data ?? []) as NotebookRow[]);
      setNotes((nRes.data ?? []) as NoteRow[]);
      setLoading(false);
    })();
  }, []);

  const notebookNotes = useMemo(
    () => (notebook ? notes.filter((n) => n.notebook_id === notebook.id) : []),
    [notebook, notes],
  );
  const unknownNotes = useMemo(
    () => notebookNotes.filter((n) => unknownIds.includes(n.id)),
    [notebookNotes, unknownIds],
  );

  const openNotebook = (nb: NotebookRow) => {
    const list = notes.filter((n) => n.notebook_id === nb.id);
    setNotebook(nb);
    setUnknownIds(readUnknown(nb.id));
    setQueue(list);
    setIndex(0);
    setMode("deck");
    setReviewing(false);
  };

  const startReview = () => {
    const list = notebookNotes.filter((n) => unknownIds.includes(n.id));
    if (!list.length) return;
    setQueue(list);
    setIndex(0);
    setMode("deck");
    setReviewing(true);
  };

  const swipe = (understood: boolean) => {
    const current = queue[index];
    if (!current || !notebook) return;
    const next = understood
      ? unknownIds.filter((id) => id !== current.id)
      : [...unknownIds, current.id];
    setUnknownIds(Array.from(new Set(next)));
    writeUnknown(notebook.id, next);
    setIndex((i) => i + 1);
  };

  const t = (ar: string, en: string) => (isRTL ? ar : en);

  return (
    <main className="min-h-screen px-4 py-10 md:py-14 pb-32" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => (notebook ? setNotebook(null) : onBack())}
          className="mb-8 inline-flex h-9 items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 text-sm font-medium text-primary shadow-sm transition-all hover:border-primary/45 hover:bg-primary/15"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          {t("رجوع", "Back")}
        </button>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !notebook ? (
          <>
            <header className="mb-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-secondary/40 backdrop-blur mb-4">
                <StickyNote className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {t("إثرائيات", "Enrichments")}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text leading-tight mb-3">
                {t("إثرائيات", "Enrichments")}
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {t(
                  "افتح مجموعة وراجع إثرائياتها بنظام السحب: يمين إذا فهمت، يسار إذا لم تفهم.",
                  "Open a collection and review its enrichment cards: swipe right if understood, left if not.",
                )}
              </p>
            </header>

            {notebooks.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">
                {t("لا توجد دفاتر بعد.", "No notebooks yet.")}
              </p>
            ) : (
              <ul className="grid gap-3">
                {notebooks.map((nb, i) => (
                  <motion.li
                    key={nb.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <button
                      onClick={() => openNotebook(nb)}
                      className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-start shadow-[0_12px_34px_-28px_rgba(15,23,42,0.7)] transition-all duration-300 hover:-translate-y-0.5 ${isPhysicsNotebook(nb.title) ? "border-sky-400/35 bg-gradient-to-br from-sky-950 via-blue-900 to-sky-700 text-white hover:border-sky-300/60 hover:shadow-[0_18px_44px_-24px_rgba(14,165,233,0.72)]" : isBiologyNotebook(nb.title) ? "border-emerald-400/35 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-700 text-white hover:border-emerald-300/60 hover:shadow-[0_18px_44px_-24px_rgba(16,185,129,0.72)]" : "border-border/70 bg-gradient-to-br from-card via-card to-secondary/45 hover:border-primary/35 hover:shadow-[0_18px_42px_-26px_hsl(var(--primary)/0.4)]"}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute -end-12 -top-12 h-32 w-32 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125 ${isPhysicsNotebook(nb.title) ? "bg-cyan-300/25" : isBiologyNotebook(nb.title) ? "bg-lime-300/25" : "bg-primary/10"}`}
                      />
                      <span
                        className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border text-3xl text-white shadow-[0_10px_24px_-14px_rgba(15,23,42,0.75)] ${isPhysicsNotebook(nb.title) ? "border-sky-200/40 bg-sky-400/20" : isBiologyNotebook(nb.title) ? "border-emerald-200/40 bg-emerald-400/20" : "border-white/20 bg-primary/10"}`}
                        style={nb.cover_image_url || isPhysicsNotebook(nb.title) || isBiologyNotebook(nb.title) ? undefined : { background: noteCoverGradient(nb.id) }}
                      >
                        {isPhysicsNotebook(nb.title) ? (
                          <Atom className="h-8 w-8" strokeWidth={2.1} />
                        ) : isBiologyNotebook(nb.title) ? (
                          <Dna className="h-8 w-8" strokeWidth={2.1} />
                        ) : nb.cover_image_url ? (
                          <img src={nb.cover_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          nb.cover_emoji || "📚"
                        )}
                      </span>
                      <span className="relative z-10 min-w-0 flex-1">
                        <span className="block truncate font-bold tracking-tight">{nb.title}</span>
                        <span className={`mt-1 block truncate text-xs ${isPhysicsNotebook(nb.title) ? "text-sky-100/75" : isBiologyNotebook(nb.title) ? "text-emerald-100/75" : "text-muted-foreground"}`}>
                          {nb.description ||
                            `${notes.filter((n) => n.notebook_id === nb.id).length} ${t("ملاحظة", "notes")}`}
                        </span>
                      </span>
                      <span className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all ${isPhysicsNotebook(nb.title) ? "border-sky-200/30 bg-white/10 text-sky-100 group-hover:border-sky-200/55 group-hover:bg-white/15" : isBiologyNotebook(nb.title) ? "border-emerald-200/30 bg-white/10 text-emerald-100 group-hover:border-emerald-200/55 group-hover:bg-white/15" : "border-border/70 bg-background/60 text-muted-foreground group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary"}`}>
                        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> {notebook.title}
              </h1>
              <button
                onClick={() => setMode(mode === "unknown-list" ? "deck" : "unknown-list")}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 text-sm text-amber-500 shadow-sm transition-colors hover:bg-amber-500/15 dark:text-amber-300"
              >
                <ListX className="w-4 h-4 text-amber-400" />
                {t("الملاحظات غير المفهومة", "Not understood notes")} ({unknownNotes.length})
              </button>
            </div>

            {mode === "unknown-list" ? (
              unknownNotes.length === 0 ? (
                <p className="text-center text-muted-foreground py-16">
                  {t("لا توجد ملاحظات غير مفهومة 🎉", "No not-understood notes 🎉")}
                </p>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={startReview}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold"
                  >
                    {t("راجعها الآن بنظام السحب", "Review them with swipe")}
                  </button>
                  <ul className="grid gap-2">
                    {unknownNotes.map((n) => (
                      <li
                        key={n.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/30 bg-secondary/30"
                      >
                        <span className="text-2xl">{n.cover_emoji || "📘"}</span>
                        <span className="flex-1 min-w-0 truncate font-medium">{n.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ) : queue.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">
                {t("لا توجد ملاحظات في هذا الدفتر.", "No notes in this notebook.")}
              </p>
            ) : index >= queue.length ? (
              <div className="text-center py-14 space-y-4">
                <p className="text-2xl font-bold">{t("أنهيت الجولة! 🎉", "Round complete! 🎉")}</p>
                <p className="text-muted-foreground">
                  {t("غير مفهومة:", "Not understood:")} {unknownNotes.length}
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {unknownNotes.length > 0 && (
                    <button
                      onClick={startReview}
                      className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t("أعد الملاحظات غير المفهومة", "Review not understood")}
                    </button>
                  )}
                  <button
                    onClick={() => openNotebook(notebook)}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border bg-card font-semibold"
                  >
                    {t("ابدأ من جديد", "Start over")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-center text-muted-foreground">
                  {reviewing ? t("مراجعة غير المفهومة", "Reviewing not understood") : t("جولة كاملة", "Full round")} ·{" "}
                  {index + 1}/{queue.length}
                </p>
                <AnimatePresence mode="wait">
                  <NoteCard
                    key={queue[index].id}
                    note={queue[index]}
                    language={language}
                    fallbackCoverUrl={notebook.cover_image_url}
                    isPhysics={isPhysicsNotebook(notebook.title)}
                    isBiology={isBiologyNotebook(notebook.title)}
                    onOpen={() => setSelectedNote(queue[index])}
                    onSwipe={swipe}
                  />
                </AnimatePresence>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => swipe(false)}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl border border-rose-400/45 bg-gradient-to-br from-rose-500 to-red-600 px-6 font-semibold text-white shadow-[0_10px_24px_-10px_rgba(244,63,94,0.85)] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
                  >
                    <X className="w-5 h-5" /> {t("لم أفهم", "Didn't get it")}
                  </button>
                  <button
                    onClick={() => swipe(true)}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl border border-emerald-300/45 bg-gradient-to-br from-emerald-400 to-teal-600 px-6 font-semibold text-white shadow-[0_10px_24px_-10px_rgba(16,185,129,0.85)] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
                  >
                    <Check className="w-5 h-5" /> {t("فهمتها", "Understood")}
                  </button>
                </div>
                <p className="text-[11px] text-center text-muted-foreground">
                  {t("اسحب يميناً إذا فهمت، ويساراً إذا لم تفهم", "Swipe right if understood, left if not")}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedNote && (
          <motion.div
            className="fixed inset-0 z-[200] overflow-y-auto bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl">
              <h2 className="min-w-0 flex-1 truncate font-semibold text-foreground">{selectedNote.title}</h2>
              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                aria-label={t("إغلاق", "Close")}
                className="ms-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary shadow-sm transition-colors hover:bg-primary/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="mx-auto max-w-3xl pb-20"
            >
              {(selectedNote.background_image_url || notebook?.cover_image_url) && (
                <div className="w-full bg-black/90">
                  <img
                    src={selectedNote.background_image_url || notebook?.cover_image_url || ""}
                    alt={selectedNote.title}
                    className="mx-auto max-h-[72vh] w-full object-contain"
                  />
                </div>
              )}
              <article className="px-5 py-8 md:px-8">
                <div className="mb-4 text-5xl">{selectedNote.cover_emoji || "📘"}</div>
                <h1 className="mb-7 text-3xl font-bold leading-tight text-foreground md:text-4xl">{selectedNote.title}</h1>
                <AdminNoteRenderer blocks={selectedNote.blocks} language={language} />
              </article>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default AdminNotes;
