import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { downloadMalzamaPdf } from "@/lib/malazamPdf";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export default function MalzamaReader({ blob, name, initialPage = 1, onPage, onClose }: {
  blob: Blob; name: string; initialPage?: number; onPage?: (page: number) => void; onClose: () => void;
}) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(initialPage);
  const [draft, setDraft] = useState(String(initialPage));
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(700);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    let task: ReturnType<typeof pdfjs.getDocument> | undefined;
    void blob.arrayBuffer().then((data) => {
      if (!active) return;
      task = pdfjs.getDocument({ data: new Uint8Array(data), useSystemFonts: true });
      return task.promise;
    }).then((doc) => {
      if (!active || !doc) return;
      setPdf(doc);
      const next = Math.max(1, Math.min(initialPage, doc.numPages));
      setPage(next); setDraft(String(next));
    }).catch(() => { if (active) { setError("تعذّر فتح PDF. قد يكون الملف تالفاً أو محمياً بكلمة مرور."); setBusy(false); } });
    return () => { active = false; void task?.destroy(); };
  }, [blob, initialPage]);

  useEffect(() => {
    const node = viewport;
    if (!node) return;
    const resize = () => setWidth(Math.max(240, node.clientWidth - 32));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [viewport]);

  useEffect(() => {
    if (!pdf || !canvas.current) return;
    let active = true;
    let render: ReturnType<Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]> | undefined;
    setBusy(true); setError("");
    void pdf.getPage(page).then((pdfPage) => {
      if (!active || !canvas.current) return;
      const base = pdfPage.getViewport({ scale: 1 });
      const scale = Math.min(width / base.width, 1.6) * zoom;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const visible = pdfPage.getViewport({ scale });
      const scaled = pdfPage.getViewport({ scale: scale * ratio });
      const node = canvas.current;
      node.width = Math.round(scaled.width); node.height = Math.round(scaled.height);
      node.style.width = `${visible.width}px`; node.style.height = `${visible.height}px`;
      render = pdfPage.render({ canvas: node, viewport: scaled });
      return render.promise;
    }).then(() => { if (active) setBusy(false); }).catch((reason) => {
      if (active && reason?.name !== "RenderingCancelledException") { setBusy(false); setError("تعذر عرض الصفحة. جرّب صفحة أخرى أو حمّل الملف."); }
    });
    return () => { active = false; render?.cancel(); };
  }, [pdf, page, zoom, width]);

  const go = (next: number) => {
    if (!pdf || !Number.isFinite(next)) return;
    const value = Math.max(1, Math.min(Math.floor(next), pdf.numPages));
    setPage(value); setDraft(String(value)); onPage?.(value);
    viewport?.scrollTo({ top: 0 });
  };
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent dir="rtl" aria-describedby={undefined} className="z-[120] flex h-[94dvh] max-h-[94dvh] max-w-6xl flex-col gap-3 p-3 sm:p-5">
      <DialogTitle className="pl-12 pr-2 text-base leading-7">{name}</DialogTitle>
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border p-2">
        <button aria-label="الصفحة السابقة" disabled={!pdf || page <= 1} onClick={() => go(page - 1)} className="grid size-11 place-items-center rounded-lg border disabled:opacity-40"><ChevronRight /></button>
        <form onSubmit={(event) => { event.preventDefault(); go(Number(draft)); }} className="flex items-center gap-2 text-sm">
          <label htmlFor="malzama-page">الصفحة</label><input id="malzama-page" type="number" min={1} max={pdf?.numPages ?? 1} value={draft} onChange={(event) => setDraft(event.target.value)} className="h-11 w-16 rounded-lg border bg-background text-center" />
          <span>من {pdf?.numPages ?? "…"}</span><button disabled={!pdf} className="h-11 rounded-lg border px-3">اذهب</button>
        </form>
        <button aria-label="الصفحة التالية" disabled={!pdf || page >= pdf.numPages} onClick={() => go(page + 1)} className="grid size-11 place-items-center rounded-lg border disabled:opacity-40"><ChevronLeft /></button>
        <button aria-label="تصغير" disabled={zoom <= .6} onClick={() => setZoom((z) => Math.max(.6, z - .2))} className="grid size-11 place-items-center rounded-lg border"><ZoomOut className="size-5" /></button>
        <button aria-label="تكبير" disabled={zoom >= 2} onClick={() => setZoom((z) => Math.min(2, z + .2))} className="grid size-11 place-items-center rounded-lg border"><ZoomIn className="size-5" /></button>
        <button onClick={() => downloadMalzamaPdf(blob, name)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-3 font-bold text-primary-foreground"><Download className="size-4" />تحميل PDF</button>
      </div>
      {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div ref={setViewport} className="relative min-h-0 flex-1 overflow-auto rounded-xl bg-slate-200 p-4" dir="ltr" aria-busy={busy}>
        {busy && <div role="status" className="sticky top-0 z-10 mx-auto flex w-fit items-center gap-2 rounded-lg bg-white p-2 text-sm text-slate-800"><Loader2 className="size-4 animate-spin" />جاري عرض الصفحة…</div>}
        <canvas ref={canvas} aria-label={`صفحة ${page} من ${name}`} className="mx-auto bg-white shadow-lg" />
      </div>
    </DialogContent>
  </Dialog>;
}
