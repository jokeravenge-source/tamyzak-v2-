import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, Eraser, Hand, Pencil, Undo2 } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { appendDrawingPoint, drawingPoint, loadDrawingAttempt, MAX_DRAWING_POINTS, paintDrawing, saveDrawingAttempt, type DrawingStroke } from "@/lib/biologyDrawing";
import { fingerprint } from "@/lib/flashcardSummaryIdentity";
import type { BoardLesson } from "../../../supabase/functions/_shared/whiteboard";
import BoardDrawing, { drawingFrame } from "./BoardDrawing";

const copy = {
  ar: {
    title: "ملاحظات الرسم", back: "رجوع للشرح", pen: "قلم", eraser: "ممحاة", hand: "تمرير", undo: "تراجع", tools: "أدوات الملاحظات",
    paper: "ورقة ملاحظات الرسم", hint: "اكتب فوق الرسم أو على المساحة الفارغة بإصبعك أو بالقلم.",
    ready: "ملاحظاتك تنحفظ على هذا الجهاز", loading: "جاري فتح الملاحظات…", saving: "جاري الحفظ…", saved: "انحفظت على هذا الجهاز",
    unavailable: "الحفظ على هذا الجهاز متعذّر حالياً.", limit: "وصلت حد الملاحظات لهاي الورقة. تراجع عن بعض الخطوط حتى تكمّل.",
  },
  en: {
    title: "Drawing notes", back: "Back to lesson", pen: "Pen", eraser: "Eraser", hand: "Scroll", undo: "Undo", tools: "Note tools",
    paper: "Drawing note canvas", hint: "Write over the drawing or use the blank space with a finger, stylus, or mouse.",
    ready: "Notes save on this device", loading: "Opening notes…", saving: "Saving…", saved: "Saved on this device",
    unavailable: "Notes could not be saved on this device.", limit: "This sheet is full. Undo a few strokes to keep writing.",
  },
} as const;

const width = 640;
const height = 960;
type Tool = "pen" | "eraser" | "hand";
type SaveStatus = "ready" | "loading" | "saving" | "saved" | "unavailable";

export default function DrawingNotes({ lesson, index, language, ownerId, onClose, onReturnFocus }: {
  lesson: BoardLesson;
  index: number;
  language: AppLanguage;
  ownerId?: string;
  onClose: () => void;
  onReturnFocus: () => void;
}) {
  const ar = language === "ar";
  const t = copy[language];
  const rendered = useMemo(() => drawingFrame(lesson, index, 1, true), [lesson, index]);
  const diagramId = useMemo(() => {
    const source = lesson.sources.find(item => item.id === lesson.steps[index].reference.sourceId);
    return "whiteboard-notes:" + fingerprint(JSON.stringify([
      language, lesson.template, source?.id, source?.title, source?.excerpt, index,
      rendered.noteRows.map(row => Object.values(row.labels).map(label => label.text)),
      rendered.equations.map(entry => entry.text), [...rendered.visible], rendered.gap,
    ]));
  }, [language, lesson, index, rendered]);
  const [sheet, setSheet] = useState<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<DrawingStroke[]>([]);
  const active = useRef<{ pointer: number; stroke: DrawingStroke } | null>(null);
  const animation = useRef<number | null>(null);
  const writable = useRef(false);
  const pendingSave = useRef<Promise<void> | null>(null);
  const [scale, setScale] = useState<number | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [atLimit, setAtLimit] = useState(false);
  const [drawing, setDrawing] = useState(false);

  const repaint = useCallback(() => {
    if (animation.current !== null) return;
    animation.current = requestAnimationFrame(() => {
      animation.current = null;
      const node = canvas.current;
      const ctx = node?.getContext("2d");
      if (!node || !ctx) return;
      const marks = active.current ? [...strokes.current, active.current.stroke] : strokes.current;
      paintDrawing(ctx, marks, node.width, node.height);
    });
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const fit = () => { if (sheet.clientWidth > 0) setScale(sheet.clientWidth / width); };
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
    observer?.observe(sheet);
    window.addEventListener("resize", fit);
    fit();
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [sheet]);

  useEffect(() => {
    let live = true;
    writable.current = false;
    if (ownerId) {
      void loadDrawingAttempt(ownerId, diagramId).then(saved => {
        if (!live) return;
        strokes.current = saved?.strokes ?? [];
        setCount(strokes.current.length);
        writable.current = true;
        setStatus(saved ? "saved" : "ready");
        repaint();
      }, () => { if (live) setStatus("unavailable"); });
    } else setStatus("unavailable");
    return () => {
      live = false;
      pendingSave.current = null;
      if (animation.current !== null) cancelAnimationFrame(animation.current);
      animation.current = null;
    };
  }, [ownerId, diagramId, repaint]);

  function commit(next: DrawingStroke[]) {
    strokes.current = next;
    setCount(next.length);
    repaint();
    if (!ownerId || !writable.current) return;
    setStatus("saving");
    const save = saveDrawingAttempt(ownerId, { version: 1, diagramId, strokes: next, submittedAt: null });
    pendingSave.current = save;
    void save.then(
      () => { if (pendingSave.current === save) setStatus("saved"); },
      () => { if (pendingSave.current === save) setStatus("unavailable"); },
    );
  }

  function extend(event: PointerEvent<HTMLCanvasElement>, stroke: DrawingStroke) {
    const rect = event.currentTarget.getBoundingClientRect();
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const sample of [...samples, event.nativeEvent]) {
      const point = drawingPoint(sample.clientX, sample.clientY, rect);
      if (point) stroke.points = appendDrawingPoint(stroke.points, point, rect.width, rect.height);
    }
  }

  function start(event: PointerEvent<HTMLCanvasElement>) {
    if (status === "loading" || tool === "hand" || active.current || event.isPrimary === false || event.button > 0) return;
    if (strokes.current.length >= 1200) { setAtLimit(true); return; }
    const point = drawingPoint(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
    if (!point) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    active.current = {
      pointer: event.pointerId,
      stroke: { tool, color: "#3279e6", width: (tool === "pen" ? 4 : 28) / width, points: [point] },
    };
    setDrawing(true);
    repaint();
  }

  function move(event: PointerEvent<HTMLCanvasElement>) {
    const mark = active.current;
    if (mark?.pointer !== event.pointerId) return;
    extend(event, mark.stroke);
    repaint();
  }

  function end(event: PointerEvent<HTMLCanvasElement>, cancel = false) {
    const mark = active.current;
    if (mark?.pointer !== event.pointerId) return;
    if (!cancel) extend(event, mark.stroke);
    active.current = null;
    setDrawing(false);
    if (cancel) { repaint(); return; }
    const previous = strokes.current.reduce((points, stroke) => points + stroke.points.length, 0);
    if (previous + mark.stroke.points.length > MAX_DRAWING_POINTS) {
      setAtLimit(true);
      repaint();
      return;
    }
    setAtLimit(false);
    commit([...strokes.current, mark.stroke]);
  }

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogPortal>
        <DialogOverlay className="z-[120] bg-slate-950/65" />
        <DialogPrimitive.Content dir={ar ? "rtl" : "ltr"}
          onCloseAutoFocus={event => { event.preventDefault(); onReturnFocus(); }}
          className="whiteboard-dialog fixed inset-0 z-[121] mx-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground shadow-2xl sm:inset-x-4 sm:inset-y-[2dvh] sm:h-[96dvh] sm:w-[calc(100%-2rem)] sm:max-w-4xl sm:rounded-3xl sm:border sm:border-border">
          <header className="shrink-0 space-y-2 border-b border-border bg-card px-3 py-2.5 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base font-black sm:text-xl">{t.title}</DialogTitle>
                <p dir="auto" className="truncate text-xs font-medium text-muted-foreground">{lesson.steps[index].title}</p>
              </div>
              <DialogPrimitive.Close asChild>
                <Button type="button" variant="outline" className="min-h-11 shrink-0 rounded-xl px-3">
                  <ArrowLeft aria-hidden="true" className={ar ? "rotate-180" : undefined} />{t.back}
                </Button>
              </DialogPrimitive.Close>
            </div>
            <DialogDescription className="sr-only">{t.hint}</DialogDescription>
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t.tools}>
              {([{ value: "pen", Icon: Pencil }, { value: "eraser", Icon: Eraser }, { value: "hand", Icon: Hand }] as const).map(({ value, Icon }) => (
                <Button key={value} type="button" variant={tool === value ? "default" : "outline"} disabled={drawing} aria-pressed={tool === value}
                  onClick={() => setTool(value)} className="min-h-11 rounded-xl px-2.5 text-xs sm:px-3 sm:text-sm">
                  <Icon aria-hidden="true" />{t[value]}
                </Button>
              ))}
              <Button type="button" variant="outline" size="icon" aria-label={t.undo} title={t.undo} disabled={drawing || !count}
                onClick={() => { setAtLimit(false); commit(strokes.current.slice(0, -1)); }}
                className="size-11 rounded-xl"><Undo2 aria-hidden="true" className={ar ? "-scale-x-100" : undefined} /></Button>
            </div>
            <p role="status" className="text-xs text-muted-foreground">{atLimit ? t.limit : t[status]}</p>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/40 p-2 sm:p-5">
            <div ref={setSheet} className="whiteboard-surface relative mx-auto aspect-[2/3] w-full max-w-[40rem] overflow-hidden rounded-xl border border-border shadow-sm sm:rounded-2xl">
              <div className="pointer-events-none absolute start-0 top-0 w-[640px]"
                style={{ visibility: scale === null ? "hidden" : undefined, transform: `scale(${scale ?? 1})`, transformOrigin: ar ? "top right" : "top left" }}>
                <BoardDrawing template={lesson.template} frame={rendered} interruption={null} language={language} solved={false} paper />
              </div>
              <canvas ref={canvas} width={width * 2} height={height * 2} aria-label={t.paper}
                className={`absolute inset-0 h-full w-full ${tool === "hand" ? "touch-pan-y cursor-grab" : "touch-none cursor-crosshair"}`}
                onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={event => end(event, true)} onLostPointerCapture={event => end(event, true)} />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
