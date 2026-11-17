import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { CheckCircle2, Eraser, Hand, Pencil, Redo2, Send, Trash2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import type { AppLanguage } from "@/components/LanguageGate";
import type { DiagramDef } from "@/components/LabeledDiagram";
import { appendDrawingPoint, drawingPoint, loadDrawingAttempt, MAX_DRAWING_POINTS, paintDrawing, saveDrawingAttempt,
  type DrawingAttempt, type DrawingStroke } from "@/lib/biologyDrawing";

const copy = {
  ar: {
    instructions: "ارسم بإصبعك أو بالقلم داخل الورقة. اختار الممحاة لتعديل خطوطك، أو اليد لتمرير الصفحة.",
    pen: "قلم", eraser: "ممحاة", pan: "تمرير", undo: "تراجع", redo: "إعادة", clear: "مسح الكل",
    brush: "سُمك القلم", thin: "رفيع", medium: "متوسط", thick: "عريض",
    colors: ["أحمر", "أزرق", "أخضر", "بنفسجي", "كحلي"],
    submit: "تسليم الرسم", submitting: "جارٍ التسليم…", edit: "تعديل الرسم",
    submitted: "تم تسليم محاولتك وحفظها على هذا الجهاز.",
    local: "Submit يحفظ رسمك للمراجعة الشخصية في هذا المتصفح على جهازك. تگدر تفتحه وتعدّله لاحقاً.",
    loading: "جارٍ فتح محاولتك…", saving: "جارٍ الحفظ…", saved: "تم الحفظ على هذا الجهاز", draft: "ابدأ بالرسم على الورقة",
    loadError: "تعذّر فتح محاولتك المحفوظة. جرّب مرّة ثانية.", saveError: "تعذّر الحفظ على هذا الجهاز. محاولتك ما زالت ظاهرة؛ جرّب الحفظ مرّة ثانية.",
    retry: "إعادة المحاولة", empty: "ارسم شيئاً على الورقة قبل التسليم.", limit: "وصلت حدّ الرسم لهذه الورقة. تراجع عن بعض الخطوط أو امسح الكل حتى تكمل.",
    canvas: "ورقة سكتش: ", eraserHint: "الممحاة تمسح خطوطك وتحافظ على خلفية السكتش. تگدر تتراجع حتى عن مسح الكل.",
    zoomIn: "تكبير", zoomOut: "تصغير", zoomLevel: "نسبة التكبير", zoomControls: "أدوات تكبير الرسمة",
  },
  en: {
    instructions: "Sketch on the paper with your finger or a pen. Erase your strokes, or choose the hand to scroll.",
    pen: "Pen", eraser: "Eraser", pan: "Scroll", undo: "Undo", redo: "Redo", clear: "Clear all",
    brush: "Pen thickness", thin: "Thin", medium: "Medium", thick: "Thick",
    colors: ["Red", "Blue", "Green", "Purple", "Navy"],
    submit: "Submit drawing", submitting: "Submitting…", edit: "Edit sketch",
    submitted: "Your attempt was submitted and saved on this device.",
    local: "Submit saves your sketch for personal review in this browser on this device. You can reopen and edit it later.",
    loading: "Opening your attempt…", saving: "Saving…", saved: "Saved on this device", draft: "Start sketching on the paper",
    loadError: "Could not open your saved attempt. Please retry.", saveError: "Could not save on this device. Your marks are still visible; please retry saving.",
    retry: "Retry", empty: "Draw something on the paper before submitting.", limit: "This paper has reached its drawing limit. Undo some strokes or Clear all to continue.",
    canvas: "Sketch paper: ", eraserHint: "The eraser removes your strokes and keeps the sketch background. Even Clear all can be undone.",
    zoomIn: "Zoom in", zoomOut: "Zoom out", zoomLevel: "Zoom level", zoomControls: "Drawing zoom controls",
  },
} as const;
const colors = ["#e11d48", "#2563eb", "#059669", "#7c3aed", "#0f172a"];
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;
type History = { past: DrawingStroke[][]; strokes: DrawingStroke[]; future: DrawingStroke[][]; submittedAt: string | null };
const emptyHistory = (): History => ({ past: [], strokes: [], future: [], submittedAt: null });

export default function BiologySketchCanvas({ diagram, language, ownerId }: { diagram: DiagramDef; language: AppLanguage; ownerId: string }) {
  const t = copy[language];
  const instructionsId = useId();
  const canvas = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<History>(emptyHistory());
  const [history, setHistory] = useState<History>(emptyHistory);
  const active = useRef<{ id: number; stroke: DrawingStroke } | null>(null);
  const frame = useRef<number | null>(null);
  const mounted = useRef(true);
  const scope = ownerId + "|" + diagram.id;
  const scopeRef = useRef(scope); scopeRef.current = scope;
  const sequence = useRef(0);
  const lastWrite = useRef<Promise<void>>(Promise.resolve());
  const [tool, setTool] = useState<"pen" | "eraser" | "pan">("pen");
  const [color, setColor] = useState(colors[4]);
  const [brush, setBrush] = useState(3);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [status, setStatus] = useState<"draft" | "saving" | "saved">("draft");
  const [error, setError] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reload, setReload] = useState(0);
  const submitted = history.submittedAt !== null;
  const disabled = loading || loadError || submitting || submitted;
  const toolbarDisabled = disabled || drawing;

  function repaint() {
    const node = canvas.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    const width = Math.round(rect.width * ratio), height = Math.round(rect.height * ratio);
    if (node.width !== width) node.width = width;
    if (node.height !== height) node.height = height;
    const ctx = node.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const strokes = active.current ? [...historyRef.current.strokes, active.current.stroke] : historyRef.current.strokes;
    paintDrawing(ctx, strokes, rect.width, rect.height);
  }
  function requestPaint() {
    if (frame.current !== null) return;
    frame.current = window.requestAnimationFrame(() => { frame.current = null; repaint(); });
  }
  function assign(next: History) {
    historyRef.current = next; setHistory(next); requestPaint();
  }
  function attempt(next: History): DrawingAttempt {
    return { version: 1, diagramId: diagram.id, strokes: next.strokes, submittedAt: next.submittedAt };
  }
  function persist(next: History) {
    const id = ++sequence.current, currentScope = scope;
    setStatus("saving"); setSaveError(false);
    const operation = saveDrawingAttempt(ownerId, attempt(next));
    lastWrite.current = operation;
    void operation.then(() => {
      if (mounted.current && scopeRef.current === currentScope && sequence.current === id) setStatus("saved");
    }, () => {
      if (mounted.current && scopeRef.current === currentScope && sequence.current === id) { setSaveError(true); setStatus("draft"); }
    });
  }
  function change(next: History) {
    setError(""); assign(next); persist(next);
  }
  function commit(strokes: DrawingStroke[]) {
    const current = historyRef.current;
    change({ past: [...current.past, current.strokes].slice(-30), strokes, future: [], submittedAt: null });
  }

  useEffect(() => {
    let live = true;
    mounted.current = true; sequence.current++;
    active.current = null; setDrawing(false);
    setLoading(true); setLoadError(false); setSaveError(false); setError(""); setStatus("draft");
    historyRef.current = emptyHistory(); setHistory(emptyHistory()); requestPaint();
    void loadDrawingAttempt(ownerId, diagram.id).then((saved) => {
      if (!live) return;
      const next = saved ? { ...emptyHistory(), strokes: saved.strokes, submittedAt: saved.submittedAt } : emptyHistory();
      historyRef.current = next; setHistory(next); setStatus(saved ? "saved" : "draft"); setLoading(false); requestPaint();
    }, () => { if (live) { setLoadError(true); setLoading(false); } });
    return () => { live = false; mounted.current = false; };
    // The parent keys the editor by account and diagram.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, diagram.id, reload]);

  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(requestPaint) : null;
    observer?.observe(node);
    window.addEventListener("resize", requestPaint); requestPaint();
    return () => {
      observer?.disconnect(); window.removeEventListener("resize", requestPaint);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
      frame.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function extend(event: PointerEvent<HTMLCanvasElement>) {
    if (!active.current || active.current.id !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const events = event.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const item of [...events, event.nativeEvent]) {
      const point = drawingPoint(item.clientX, item.clientY, rect);
      if (point) active.current.stroke.points = appendDrawingPoint(active.current.stroke.points, point, rect.width, rect.height);
    }
  }
  function start(event: PointerEvent<HTMLCanvasElement>) {
    if (disabled || tool === "pan" || active.current || event.isPrimary === false || (event.pointerType === "mouse" && event.button !== 0)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = drawingPoint(event.clientX, event.clientY, rect);
    if (!point) return;
    if (historyRef.current.strokes.length >= 1200) { setError(t.limit); return; }
    event.preventDefault(); setError("");
    active.current = { id: event.pointerId, stroke: { tool, color, width: Math.min(0.3, (tool === "eraser" ? 26 : brush) / rect.width), points: [point] } };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Older embedded browsers. */ }
    setDrawing(true); requestPaint();
  }
  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!active.current || active.current.id !== event.pointerId) return;
    event.preventDefault(); extend(event); requestPaint();
  }
  function finish(event: PointerEvent<HTMLCanvasElement>, cancelled = false) {
    const pending = active.current;
    if (!pending || pending.id !== event.pointerId) return;
    if (!cancelled) extend(event);
    active.current = null; setDrawing(false);
    try { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* Already released. */ }
    if (cancelled) { requestPaint(); return; }
    const count = historyRef.current.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0) + pending.stroke.points.length;
    if (count > MAX_DRAWING_POINTS) { setError(t.limit); requestPaint(); return; }
    commit([...historyRef.current.strokes, pending.stroke]);
  }

  async function submit() {
    if (disabled || drawing || !historyRef.current.strokes.length) return;
    repaint();
    const node = canvas.current, ctx = node?.getContext("2d");
    if (!node || !ctx) { setError(t.empty); return; }
    try {
      const pixels = ctx.getImageData(0, 0, node.width, node.height).data;
      let visible = false;
      for (let index = 3; index < pixels.length; index += 4) { if (pixels[index] > 0) { visible = true; break; } }
      if (!visible) { setError(t.empty); return; }
    } catch { setError(t.saveError); return; }
    const currentScope = scope;
    setSubmitting(true); setError(""); setSaveError(false);
    await lastWrite.current.catch(() => {});
    if (!mounted.current || scopeRef.current !== currentScope) return;
    const next = { ...historyRef.current, submittedAt: new Date().toISOString() };
    try {
      await saveDrawingAttempt(ownerId, attempt(next));
      if (mounted.current && scopeRef.current === currentScope) { assign(next); setTool("pan"); setStatus("saved"); }
    } catch {
      if (mounted.current && scopeRef.current === currentScope) setSaveError(true);
    } finally {
      if (mounted.current && scopeRef.current === currentScope) setSubmitting(false);
    }
  }

  const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  return (
    <section className="min-w-0 space-y-4 rounded-3xl border border-primary/25 bg-card p-3 sm:p-5" aria-busy={loading || submitting}>
      <div>
        <h2 className="break-words text-xl font-bold">{diagram.title[language]}</h2>
        <p id={instructionsId} className="mt-2 text-sm leading-7 text-muted-foreground">{t.instructions}</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={language === "ar" ? "أدوات الرسم" : "Drawing controls"}>
        {([{ id: "pen", label: t.pen, Icon: Pencil }, { id: "eraser", label: t.eraser, Icon: Eraser }, { id: "pan", label: t.pan, Icon: Hand }] as const).map(({ id, label, Icon }) => (
          <button key={id} type="button" aria-pressed={tool === id} disabled={id === "pan" ? drawing || submitting : toolbarDisabled}
            onClick={() => setTool(id)} className={button + (tool === id ? " border-primary bg-primary text-primary-foreground" : " border-border bg-background")}>
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />{label}
          </button>
        ))}
        <button type="button" className={button + " border-border"} disabled={toolbarDisabled || !history.past.length} onClick={() => {
          const current = historyRef.current; if (!current.past.length) return;
          change({ past: current.past.slice(0, -1), strokes: current.past[current.past.length - 1], future: [current.strokes, ...current.future].slice(0, 30), submittedAt: null });
        }}><Undo2 className="h-4 w-4" aria-hidden="true" />{t.undo}</button>
        <button type="button" className={button + " border-border"} disabled={toolbarDisabled || !history.future.length} onClick={() => {
          const current = historyRef.current; if (!current.future.length) return;
          change({ past: [...current.past, current.strokes].slice(-30), strokes: current.future[0], future: current.future.slice(1), submittedAt: null });
        }}><Redo2 className="h-4 w-4" aria-hidden="true" />{t.redo}</button>
        <button type="button" className={button + " border-destructive/40 text-destructive"} disabled={toolbarDisabled || !history.strokes.length}
          onClick={() => { commit([]); setTool("pen"); }}><Trash2 className="h-4 w-4" aria-hidden="true" />{t.clear}</button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label={language === "ar" ? "لون القلم" : "Pen color"}>
          {colors.map((value, index) => <button key={value} type="button" aria-label={t.colors[index]} aria-pressed={color === value}
            disabled={toolbarDisabled} onClick={() => { setColor(value); setTool("pen"); }}
            className={"grid h-11 w-11 place-items-center rounded-full border-2 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " + (color === value ? "border-foreground" : "border-transparent")}>
            <span className="h-7 w-7 rounded-full" style={{ backgroundColor: value }} />
          </button>)}
        </div>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm">
          {t.brush}
          <select value={brush} disabled={toolbarDisabled} onChange={(event) => setBrush(Number(event.target.value))}
            className="min-h-11 rounded-xl border border-border bg-background px-3 text-foreground">
            <option value={3}>{t.thin}</option><option value={5}>{t.medium}</option><option value={8}>{t.thick}</option>
          </select>
        </label>
        <div className="inline-flex min-h-11 items-center rounded-xl border border-border bg-background p-1" role="group" aria-label={t.zoomControls}>
          <button type="button" aria-label={t.zoomOut} title={t.zoomOut} disabled={zoom <= MIN_ZOOM}
            onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
            className="grid h-10 w-10 place-items-center rounded-lg hover:bg-secondary disabled:opacity-40">
            <ZoomOut className="h-5 w-5" aria-hidden="true" />
          </button>
          <output aria-label={t.zoomLevel} aria-live="polite" className="min-w-14 px-2 text-center text-sm font-bold tabular-nums">
            {Math.round(zoom * 100)}%
          </output>
          <button type="button" aria-label={t.zoomIn} title={t.zoomIn} disabled={zoom >= MAX_ZOOM}
            onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
            className="grid h-10 w-10 place-items-center rounded-lg hover:bg-secondary disabled:opacity-40">
            <ZoomIn className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div data-testid="biology-sketch-viewport" className="w-full overflow-auto rounded-2xl border border-slate-200 bg-slate-100" style={{ maxHeight: "min(72vh, 52rem)" }} dir="ltr">
        <div data-testid="biology-sketch-stage" className="relative isolate bg-white" style={{
          aspectRatio: diagram.aspect ?? "4/3",
          width: `${Math.round(zoom * 100)}%`,
          marginInline: zoom <= 1 ? "auto" : undefined,
        }}>
          <svg viewBox="0 0 100 75" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">{diagram.art}</svg>
          <canvas ref={canvas} data-testid="biology-sketch-paper" tabIndex={0} role="img" aria-label={t.canvas + diagram.title[language]} aria-describedby={instructionsId}
            className={"absolute inset-0 h-full w-full select-none " + (tool === "pan" || submitted ? "cursor-grab" : "cursor-crosshair")}
            style={{ touchAction: disabled || tool === "pan" ? "pan-x pan-y pinch-zoom" : "none" }}
            onContextMenu={(event) => event.preventDefault()} onPointerDown={start} onPointerMove={move} onPointerUp={(event) => finish(event)}
            onPointerCancel={(event) => finish(event, true)} onLostPointerCapture={(event) => finish(event, true)} />
        </div>
      </div>
      <p className="text-xs leading-6 text-muted-foreground">{t.eraserHint}</p>
      {loadError && <div className="rounded-xl border border-destructive/40 p-3" role="alert">
        <p>{t.loadError}</p><button type="button" className={button + " mt-2 border-border"} onClick={() => setReload((value) => value + 1)}>{t.retry}</button>
      </div>}
      {saveError && <div className="rounded-xl border border-destructive/40 p-3" role="alert">
        <p>{t.saveError}</p><button type="button" disabled={submitting} className={button + " mt-2 border-border"} onClick={() => persist(historyRef.current)}>{t.retry}</button>
      </div>}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {submitted && <p className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm" role="status">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />{t.submitted}
      </p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground" role="status" aria-live="polite">{loading ? t.loading : t[status]}</p>
        {submitted ? <button type="button" className={button + " w-full border-primary text-primary sm:w-auto"} onClick={() => { setTool("pen"); change({ ...historyRef.current, submittedAt: null }); }}>
          <Pencil className="h-4 w-4" aria-hidden="true" />{t.edit}
        </button> : <button type="button" onClick={() => void submit()} disabled={disabled || drawing || !history.strokes.some((stroke) => stroke.tool === "pen")}
          className={button + " w-full border-primary bg-primary text-primary-foreground sm:w-auto"}>
          <Send className="h-4 w-4" aria-hidden="true" />{submitting ? t.submitting : t.submit}
        </button>}
      </div>
      <p className="text-xs leading-6 text-muted-foreground">{t.local}</p>
    </section>
  );
}
