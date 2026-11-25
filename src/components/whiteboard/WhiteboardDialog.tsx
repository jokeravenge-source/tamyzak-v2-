import { useEffect, useRef, useState, type FormEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowUpRight, BookOpen, FileUp, Loader2, Presentation } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { attachmentForBoard, readAssistantFile } from "@/lib/mutamayizFile";
import { parseBoardLesson, type BoardError, type BoardInput, type BoardLesson } from "../../../supabase/functions/_shared/whiteboard";
import { PARALLEL_PLATES_TITLE } from "../../../supabase/functions/_shared/whiteboardCapacitors";
import WhiteboardPlayer from "./WhiteboardPlayer";
import "./whiteboard.css";

const copy = {
  ar: {
    title: "سبورة متميّز", back: "رجوع للمحادثة", description: "شرح صوتي باللهجة العراقية ورسم خطوة بخطوة من مصدر الدرس.",
    loading: "متميّز دا يحضّر السبورة…", missing: "نحتاج مصدر للشرح",
    missingDesc: "ما لگينا نص يغطّي هالدرس بالمصدر الحالي. اكتب اسم الدرس أو ارفع صفحة الـPDF اللي بيها الفكرة.",
    removed: "ملف هالرد انشال من المحادثة. ارفعه من جديد حتى نستخدم نفس المصدر.",
    failed: "تعذّر تجهيز الشرح", failedDesc: "تكدر تعيد المحاولة أو تختار مصدر ثاني.",
    topic: "اسم الدرس من المنهج", example: "مثلاً: الحث الكهرومغناطيسي", search: "اختار الدرس",
    pilot: PARALLEL_PLATES_TITLE, pilotChapter: "مثال للسبورة · فيزياء الفصل الأول",
    upload: "ارفع صفحة PDF", reading: "جاري قراءة الصفحة…", fileError: "الصفحة ما بيها نص مقروء. جرّب PDF نصي أو حوّل الصفحة إلى نص بـ OCR.",
    retry: "حاول مرة ثانية",
  },
  en: {
    title: "Mutamayiz Whiteboard", back: "Back to conversation", description: "Step-by-step drawing and spoken Iraqi Arabic from your lesson source.",
    loading: "Mutamayiz is preparing the board…", missing: "Choose a lesson source",
    missingDesc: "We couldn’t find text for this lesson in the current source. Enter a curriculum lesson name or upload a readable PDF page.",
    removed: "The file for this reply was removed from chat. Upload it again to use the same source.",
    failed: "Could not prepare the lesson", failedDesc: "Try again or choose another source.",
    topic: "Curriculum lesson name", example: "For example: electromagnetic induction", search: "Choose lesson",
    pilot: "Parallel-plate capacitance", pilotChapter: "Whiteboard demo · Physics Chapter 1",
    upload: "Upload PDF page", reading: "Reading the page…", fileError: "This page has no readable text. Use a text PDF or run OCR on the page.",
    retry: "Try again",
  },
} as const;

type Result =
  | { status: "loading" | "missing" | "failed" }
  | { status: "ready"; lesson: BoardLesson; source: BoardInput };

export default function WhiteboardDialog({ input, missingAttachment, language, onClose, onReturnFocus }: {
  input: BoardInput;
  missingAttachment: boolean;
  language: AppLanguage;
  onClose: () => void;
  onReturnFocus: () => void;
}) {
  const ar = language === "ar";
  const text = copy[language];
  const [requested, setRequested] = useState<BoardInput | null>(() => missingAttachment ? null : input);
  const [result, setResult] = useState<Result>(() => missingAttachment ? { status: "missing" } : { status: "loading" });
  const [topic, setTopic] = useState("");
  const [reading, setReading] = useState(false);
  const [fileError, setFileError] = useState(false);
  const upload = useRef<HTMLInputElement>(null);
  const readingSession = useRef<AbortController | null>(null);

  useEffect(() => () => readingSession.current?.abort(), []);
  useEffect(() => {
    if (!requested) return;
    const controller = new AbortController();
    setResult({ status: "loading" });
    void supabase.functions.invoke<{ lesson?: BoardLesson; error?: BoardError }>("excellence-companion", {
      body: { mode: "whiteboard_lesson", board: requested },
      signal: controller.signal,
      timeout: 48_000,
    }).then(({ data, error }) => {
      if (controller.signal.aborted) return;
      if (data?.error === "missing_source") {
        setResult({ status: "missing" });
        return;
      }
      const lesson = data?.lesson;
      const valid = !error && lesson && Array.isArray(lesson.sources)
        && (lesson.template === "notes" || lesson.template === "parallel-plates")
        ? parseBoardLesson(lesson, lesson.sources, lesson.template) : null;
      setResult(valid ? { status: "ready", lesson: valid, source: requested } : { status: "failed" });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ status: "failed" });
    });
    return () => controller.abort();
  }, [requested]);

  const pickTopic = (event: FormEvent) => {
    event.preventDefault();
    if (topic.trim()) setRequested({ question: input.question, selectedLesson: topic.trim(), language });
  };

  const readPage = async (file: File) => {
    if (readingSession.current) return;
    const controller = new AbortController();
    readingSession.current = controller;
    setReading(true);
    setFileError(false);
    try {
      const source = await readAssistantFile(file);
      if (!source.pages?.length) throw new Error("Unreadable attachment");
      if (!controller.signal.aborted) {
        setRequested({ question: input.question, topic: input.topic, language, attachment: { ...attachmentForBoard(source), selectedPage: true } });
      }
    } catch {
      if (!controller.signal.aborted) setFileError(true);
    } finally {
      if (!controller.signal.aborted) {
        readingSession.current = null;
        setReading(false);
        if (upload.current) upload.current.value = "";
      }
    }
  };

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogPortal>
        <DialogOverlay className="z-[110] bg-slate-950/65" />
        <DialogPrimitive.Content
          dir={ar ? "rtl" : "ltr"}
          onCloseAutoFocus={event => { event.preventDefault(); onReturnFocus(); }}
          className="whiteboard-dialog fixed inset-0 z-[111] mx-auto flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-background text-foreground shadow-2xl sm:inset-x-4 sm:inset-y-[2dvh] sm:h-[96dvh] sm:w-[calc(100%-2rem)] sm:max-w-6xl sm:rounded-3xl sm:border sm:border-border"
        >
          <header className="shrink-0 border-b border-border bg-card">
            <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Presentation aria-hidden="true" className="size-5" /></span>
                <DialogTitle className="min-w-0 text-base font-black leading-tight sm:text-xl">{text.title}</DialogTitle>
              </div>
              <DialogPrimitive.Close asChild>
                <Button variant="outline" type="button" aria-label={text.back} className="min-h-11 shrink-0 rounded-xl px-3">
                  <ArrowLeft className={ar ? "rotate-180" : undefined} /><span className="hidden sm:inline">{text.back}</span>
                </Button>
              </DialogPrimitive.Close>
            </div>
            <DialogDescription className="sr-only">{text.description}</DialogDescription>
          </header>

          {result.status === "ready" ? (
            <WhiteboardPlayer lesson={result.lesson} input={result.source} language={language} />
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6">
              {result.status === "loading" ? (
                <div role="status" className="whiteboard-surface mx-auto grid min-h-[16rem] max-w-2xl place-content-center justify-items-center gap-3 rounded-3xl border border-border p-5 text-center">
                  <Loader2 className="size-7 animate-spin text-primary" />
                  <h2 className="text-lg font-bold">{text.loading}</h2>
                  {requested?.attachment && <p className="max-w-full text-sm text-muted-foreground [overflow-wrap:anywhere]" dir="auto">{requested.attachment.name}</p>}
                </div>
              ) : (
                <section className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-black">{result.status === "missing" ? text.missing : text.failed}</h2>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {missingAttachment && !requested ? text.removed + " " : ""}
                      {result.status === "missing" ? text.missingDesc : text.failedDesc}
                    </p>
                  </div>
                  {result.status === "failed" && requested && <Button type="button" onClick={() => setRequested({ ...requested })} disabled={reading} className="rounded-xl">{text.retry}</Button>}
                  <form onSubmit={pickTopic} className="space-y-1.5">
                    <label htmlFor="whiteboard-lesson-search" className="text-sm font-bold">{text.topic}</label>
                    <div className="flex min-w-0 flex-wrap gap-2">
                      <input id="whiteboard-lesson-search" value={topic} onChange={event => setTopic(event.target.value)} maxLength={180} placeholder={text.example}
                        className="min-h-11 min-w-0 flex-[1_1_10rem] rounded-xl border border-border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary" dir="auto" />
                      <Button type="submit" disabled={reading || !topic.trim()} className="rounded-xl px-3">{text.search}</Button>
                    </div>
                  </form>
                  <input ref={upload} type="file" accept=".pdf,application/pdf" hidden
                    onChange={event => { if (event.target.files?.[0]) void readPage(event.target.files[0]); }} />
                  <Button type="button" variant="outline" disabled={reading} onClick={() => upload.current?.click()} className="min-h-11 rounded-xl">
                    {reading ? <Loader2 className="animate-spin" /> : <FileUp />}{reading ? text.reading : text.upload}
                  </Button>
                  {fileError && <p role="alert" className="text-sm leading-7 text-destructive">{text.fileError}</p>}
                  <Button type="button" variant="outline" disabled={reading}
                    onClick={() => setRequested({ question: input.question, language, pilot: "parallel-plates" })}
                    className="h-auto min-h-14 w-full justify-start rounded-2xl text-start">
                    <BookOpen className="text-muted-foreground" />
                    <span className="min-w-0 flex-1"><span className="block font-bold">{text.pilot}</span><span className="mt-1 block text-xs text-muted-foreground">{text.pilotChapter}</span></span>
                    <ArrowUpRight className="text-muted-foreground" />
                  </Button>
                </section>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
