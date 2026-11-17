import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { QuestionDocument } from "./QuestionDocument";
import { paginateBooklet, type RenderedBooklet } from "./paginate";
import { exportBooklet } from "./exportPdf";
import type { PdfQuestion, PdfSettings } from "./model";
import "./booklet.css";

export default function BookletPreview({ questions, settings, onBusy }: {
  questions: readonly PdfQuestion[]; settings: PdfSettings; onBusy: (busy: boolean) => void;
}) {
  const source = useRef<HTMLDivElement>(null), container = useRef<HTMLDivElement>(null), pageHost = useRef<HTMLDivElement>(null);
  const booklet = useRef<RenderedBooklet | null>(null), active = useRef(true), controller = useRef<AbortController | null>(null);
  const [count, setCount] = useState(0), [page, setPage] = useState(0), [width, setWidth] = useState(320);
  const [building, setBuilding] = useState(true), [exporting, setExporting] = useState(false), [progress, setProgress] = useState(0), [error, setError] = useState("");
  const ar = settings.language === "ar";
  useEffect(() => { active.current = true; return () => { active.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => {
    const resize = () => setWidth(Math.max(1, Math.min(794, (container.current?.clientWidth || 352) - 32)));
    resize();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    if (container.current) observer?.observe(container.current);
    window.addEventListener("resize", resize);
    return () => { observer?.disconnect(); window.removeEventListener("resize", resize); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    setBuilding(true); setError(""); setCount(0); setPage(0);
    const prepare = async () => {
      await document.fonts?.ready;
      if (cancelled || !source.current) return;
      booklet.current?.dispose();
      booklet.current = paginateBooklet(source.current, settings);
      setCount(booklet.current.pages.length); setBuilding(false);
    };
    void prepare().catch(() => { if (!cancelled) { setError(ar ? "تعذّر ترتيب الصفحات. جرّب تقليل حجم الخط." : "Could not lay out the pages. Try a smaller font."); setBuilding(false); } });
    return () => { cancelled = true; booklet.current?.dispose(); booklet.current = null; };
  }, [questions, settings, ar]);
  useEffect(() => {
    const selected = booklet.current?.pages[page];
    if (pageHost.current) pageHost.current.replaceChildren(...(selected ? [selected.cloneNode(true)] : []));
  }, [page, count, building]);
  const download = async () => {
    if (!booklet.current || exporting || building) return;
    setExporting(true); onBusy(true); setProgress(0); setError("");
    controller.current = new AbortController();
    try { await exportBooklet(booklet.current.pages, settings, setProgress, controller.current.signal); }
    catch { if (active.current) setError(ar ? "تعذّر تنزيل الملف. أعد المحاولة." : "Could not download the PDF. Please try again."); }
    finally { if (active.current) { setExporting(false); onBusy(false); } }
  };
  return <section aria-label={ar ? "معاينة الملف" : "PDF preview"} className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{ar ? "معاينة ملزمتك" : "Your booklet preview"}</h2><p className="mt-1 text-xs text-muted-foreground">A4 · {questions.length} {ar ? "سؤالاً" : "questions"}{count ? ` · ${count} ${ar ? "صفحة" : "pages"}` : ""}</p></div>
      <button type="button" onClick={() => void download()} disabled={building || exporting || !count} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
        {building || exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{exporting ? `${ar ? "جاري التصدير" : "Exporting"} ${progress}/${count}` : ar ? "تنزيل PDF" : "Download PDF"}
      </button>
    </div>
    {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    <div className="pdf-measure pdf-document" dir={ar ? "rtl" : "ltr"} data-template={settings.template} style={{ "--pdf-font-size": `${settings.fontSize}px` } as CSSProperties} aria-hidden="true" ref={source}><QuestionDocument questions={questions} settings={settings} /></div>
    <div ref={container} className="pdf-preview-shell">
      {building ? <p role="status" className="flex items-center justify-center gap-2 p-10"><Loader2 className="h-5 w-5 animate-spin" />{ar ? "جاري ترتيب الصفحات…" : "Laying out your pages…"}</p> : <>
        <div className="flex items-center justify-center gap-5 border-b border-slate-300 p-3 text-slate-700" dir="ltr">
          <button type="button" aria-label={ar ? "الصفحة السابقة" : "Previous page"} disabled={page <= 0 || exporting} onClick={() => setPage(value => value - 1)} className="rounded-lg p-2 disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button>
          <span aria-live="polite" className="text-sm font-bold">{page + 1} / {count}</span>
          <button type="button" aria-label={ar ? "الصفحة التالية" : "Next page"} disabled={page >= count - 1 || exporting} onClick={() => setPage(value => value + 1)} className="rounded-lg p-2 disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <div className="pdf-preview-viewport" style={{ width, height: 1123 * width / 794 }}>
          <div ref={pageHost} className="pdf-document" dir={ar ? "rtl" : "ltr"} data-template={settings.template} style={{ position: "absolute", top: 0, left: 0, width: 794, transform: `scale(${width / 794})`, transformOrigin: "top left", "--pdf-font-size": `${settings.fontSize}px` } as CSSProperties} />
        </div>
      </>}
    </div>
  </section>;
}
