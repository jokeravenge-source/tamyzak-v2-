import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Circle,
  Eraser,
  Hand,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  SlidersHorizontal,
  Square,
  Trash2,
  Triangle,
  Undo2,
  X,
  ZoomIn,
} from "lucide-react";
import { redraw } from "./render";
import {
  MODE_LABELS,
  PALETTES,
  SIZES,
  type BoardMode,
  type Point,
  type ShapeKind,
  type Stroke,
  type TextItem,
  type Tool,
} from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "tamayozk.smartboard.v2";
const MODES: BoardMode[] = ["green", "white", "blue"];
const GRID = 28;

type Boards = Record<BoardMode, Stroke[]>;
type TextBoards = Record<BoardMode, TextItem[]>;

interface SavedState {
  mode: BoardMode;
  boards: Boards;
  texts?: TextBoards;
}

const emptyBoards = (): Boards => ({ green: [], white: [], blue: [] });
const emptyTexts = (): TextBoards => ({ green: [], white: [], blue: [] });
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `t${Date.now()}${Math.random()}`;

export function Whiteboard({ onBack }: { onBack?: () => void }) {
  const [mode, setMode] = useState<BoardMode>("green");
  const [boards, setBoards] = useState<Boards>(emptyBoards);
  const [tool, setTool] = useState<Tool>("pen");
  const [shape, setShape] = useState<ShapeKind>("free");
  const [size, setSize] = useState<number>(SIZES[2]!);
  const [color, setColor] = useState<string>(PALETTES.green[0]!);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("السبورة");
  const [texts, setTexts] = useState<TextBoards>(emptyTexts);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);

  // history لكل نوع سبورة
  const historyRef = useRef<Record<BoardMode, { past: Stroke[][]; future: Stroke[][] }>>({
    green: { past: [], future: [] },
    white: { past: [], future: [] },
    blue: { past: [], future: [] },
  });
  const [, forceHistory] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const viewRef = useRef<{ zoom: number; pan: Point }>({ zoom: 1, pan: { x: 0, y: 0 } });
  const [view, setView] = useState({ zoom: 1, pan: { x: 0, y: 0 } });
  const liveRef = useRef<Stroke | null>(null);
  const drawingRef = useRef(false);
  const pointersRef = useRef<Map<number, Point>>(new Map());
  const pinchRef = useRef<{ dist: number; center: Point; zoom: number; pan: Point } | null>(null);
  const panStartRef = useRef<{ p: Point; pan: Point } | null>(null);
  const rafRef = useRef<number | null>(null);

  const strokes = boards[mode];
  const strokesRef = useRef<Stroke[]>(strokes);
  strokesRef.current = strokes;

  const palette = PALETTES[mode];

  const scheduleRedraw = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const ctx = ctxRef.current;
      if (!ctx) return;
      const { w, h, dpr } = sizeRef.current;
      const { zoom, pan } = viewRef.current;
      redraw(ctx, strokesRef.current, liveRef.current, dpr, zoom, pan, w, h);
    });
  }, []);

  const syncView = () => setView({ zoom: viewRef.current.zoom, pan: { ...viewRef.current.pan } });

  /* ---------- تحميل / حفظ تلقائي ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedState;
        if (saved.boards) {
          setBoards({ ...emptyBoards(), ...saved.boards });
        }
        if (saved.texts) {
          setTexts({ ...emptyTexts(), ...saved.texts });
        }
        if (saved.mode && MODES.includes(saved.mode)) {
          setMode(saved.mode);
          setColor(PALETTES[saved.mode][0]!);
        }
      }
    } catch {
      /* تجاهل */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ mode, boards, texts } satisfies SavedState),
        );
      } catch {
        /* تجاهل */
      }
    }, 250);
    return () => clearTimeout(id);
  }, [mode, boards, texts, loaded]);

  /* ---------- حجم الكانفس ---------- */
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const apply = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctxRef.current = canvas.getContext("2d");
      scheduleRedraw();
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [scheduleRedraw]);

  useEffect(() => {
    scheduleRedraw();
  }, [boards, mode, scheduleRedraw]);

  /* ---------- History ---------- */
  const commit = useCallback(
    (next: Stroke[]) => {
      const h = historyRef.current[mode];
      h.past.push(strokesRef.current);
      h.future = [];
      forceHistory((n) => n + 1);
      setBoards((prev) => ({ ...prev, [mode]: next }));
    },
    [mode],
  );

  const undo = () => {
    const h = historyRef.current[mode];
    const prev = h.past.pop();
    if (!prev) return;
    h.future.push(strokesRef.current);
    forceHistory((n) => n + 1);
    setBoards((b) => ({ ...b, [mode]: prev }));
  };

  const redo = () => {
    const h = historyRef.current[mode];
    const next = h.future.pop();
    if (!next) return;
    h.past.push(strokesRef.current);
    forceHistory((n) => n + 1);
    setBoards((b) => ({ ...b, [mode]: next }));
  };

  const hist = historyRef.current[mode];
  const canUndo = hist.past.length > 0;
  const canRedo = hist.future.length > 0;

  /* ---------- الرسم ---------- */
  const toWorld = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const { zoom, pan } = viewRef.current;
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      drawingRef.current = false;
      liveRef.current = null;
      const pts = [...pointersRef.current.values()];
      const a = pts[0]!;
      const b = pts[1]!;
      pinchRef.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        zoom: viewRef.current.zoom,
        pan: { ...viewRef.current.pan },
      };
      scheduleRedraw();
      return;
    }

    if (tool === "hand") {
      panStartRef.current = {
        p: { x: e.clientX, y: e.clientY },
        pan: { ...viewRef.current.pan },
      };
      return;
    }

    drawingRef.current = true;
    const p = toWorld(e);
    liveRef.current = {
      tool: tool === "eraser" ? "eraser" : "pen",
      shape: tool === "shape" ? shape : "free",
      color,
      size,
      mode,
      points: [p],
    };
    scheduleRedraw();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointersRef.current.has(e.pointerId))
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const pinch = pinchRef.current;
    if (pinch && pointersRef.current.size >= 2) {
      const pts = [...pointersRef.current.values()];
      const a = pts[0]!;
      const b = pts[1]!;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = canvasRef.current!.getBoundingClientRect();
      const k = Math.min(Math.max(dist / (pinch.dist || 1), 0.2), 6);
      const zoom = Math.min(Math.max(pinch.zoom * k, 0.5), 5);
      const cx = pinch.center.x - rect.left;
      const cy = pinch.center.y - rect.top;
      const scale = zoom / pinch.zoom;
      viewRef.current = {
        zoom,
        pan: {
          x: cx - (cx - pinch.pan.x) * scale,
          y: cy - (cy - pinch.pan.y) * scale,
        },
      };
      syncView();
      scheduleRedraw();
      return;
    }

    const panStart = panStartRef.current;
    if (panStart) {
      viewRef.current = {
        zoom: viewRef.current.zoom,
        pan: {
          x: panStart.pan.x + (e.clientX - panStart.p.x),
          y: panStart.pan.y + (e.clientY - panStart.p.y),
        },
      };
      syncView();
      scheduleRedraw();
      return;
    }

    if (!drawingRef.current || !liveRef.current) return;
    const live = liveRef.current;
    const p = toWorld(e);
    if (live.shape === "free") {
      const last = live.points[live.points.length - 1];
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < 0.7 / viewRef.current.zoom) return;
      live.points.push(p);
    } else {
      live.points = [live.points[0]!, p];
    }
    scheduleRedraw();
  };

  const endPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    panStartRef.current = null;
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const live = liveRef.current;
    liveRef.current = null;
    if (!live) return;
    if (live.shape !== "free" && live.points.length < 2) return;
    commit([...strokesRef.current, live]);
  };

  /* ---------- Zoom ---------- */
  const zoomBy = (factor: number) => {
    const { w, h } = sizeRef.current;
    const { zoom, pan } = viewRef.current;
    const next = Math.min(Math.max(zoom * factor, 0.5), 5);
    const scale = next / zoom;
    viewRef.current = {
      zoom: next,
      pan: { x: w / 2 - (w / 2 - pan.x) * scale, y: h / 2 - (h / 2 - pan.y) * scale },
    };
    syncView();
    scheduleRedraw();
  };

  const resetView = () => {
    viewRef.current = { zoom: 1, pan: { x: 0, y: 0 } };
    syncView();
    scheduleRedraw();
  };

  /* ---------- تبديل نوع السبورة ---------- */
  const switchMode = (next: BoardMode) => {
    if (next === mode) return;
    setMode(next);
    setColor(PALETTES[next][0]!);
    resetView();
  };

  const clearBoard = () => {
    commit([]);
    setConfirmClear(false);
  };

  const isGreen = mode === "green";
  const isBlue = mode === "blue";

  const gridStyle = isBlue
    ? {
        backgroundSize: `${GRID * view.zoom}px ${GRID * view.zoom}px`,
        backgroundPosition: `${view.pan.x}px ${view.pan.y}px`,
      }
    : undefined;

  return (
    <div dir="rtl" className="flex h-[100dvh] flex-col overflow-hidden bg-background font-arabic">
      {/* Header */}
      <header className="grid shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 px-3 pt-[max(0.35rem,env(safe-area-inset-top))]">
        <button
          type="button"
          aria-label="رجوع"
          onClick={() => onBack?.() ?? window.history.back()}
          className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors active:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="truncate text-center text-[17px] font-semibold text-foreground">{title}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="خيارات"
              className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors active:bg-muted"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="font-arabic">
            <DropdownMenuItem
              onSelect={() => {
                try {
                  localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ mode, boards } satisfies SavedState),
                  );
                } catch {
                  /* تجاهل */
                }
              }}
            >
              حفظ السبورة
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                const name = window.prompt("اسم السبورة", title);
                if (name && name.trim()) setTitle(name.trim());
              }}
            >
              إعادة تسمية السبورة
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setConfirmClear(true)}
            >
              مسح رسم هذه السبورة
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* مبدّل نوع السبورة */}
      <div className="flex shrink-0 items-center justify-center gap-1.5 px-3 py-1.5">
        {MODES.map((m) => (
          <ModePill
            key={m}
            active={mode === m}
            label={MODE_LABELS[m]}
            onClick={() => switchMode(m)}
            activeClass={
              m === "green"
                ? "bg-board-green text-board-green-foreground border-transparent"
                : m === "white"
                  ? "bg-board-accent text-board-accent-foreground border-transparent"
                  : "bg-board-blue-ink text-board-accent-foreground border-transparent"
            }
          />
        ))}
      </div>

      {/* السبورة */}
      <div className="min-h-0 flex-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div
          ref={wrapRef}
          style={gridStyle}
          className={cn(
            "relative h-full w-full overflow-hidden rounded-[20px] shadow-board transition-colors duration-200",
            isGreen && "bg-board-green chalk-texture",
            mode === "white" && "bg-board-white border border-border",
            isBlue && "bg-board-blue grid-paper border border-border",
          )}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none"
            style={{ cursor: tool === "hand" ? "grab" : "crosshair" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
            onPointerLeave={endPointer}
          />

          {/* زر الأدوات */}
          <button
            type="button"
            onClick={() => setToolsOpen(true)}
            aria-label="فتح الأدوات"
            className="absolute bottom-3 right-3 flex h-12 items-center gap-2 rounded-full bg-card px-4 text-sm font-semibold text-foreground shadow-board transition-transform active:scale-95"
          >
            <SlidersHorizontal className="h-4 w-4" />
            الأدوات
          </button>

          {/* مؤشر التكبير */}
          {Math.round(view.zoom * 100) !== 100 && (
            <button
              type="button"
              onClick={resetView}
              className="absolute bottom-4 left-3 rounded-full bg-card/95 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft"
            >
              {Math.round(view.zoom * 100)}%
            </button>
          )}
        </div>
      </div>

      {/* الحاجب */}
      <div
        onClick={() => setToolsOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 transition-opacity duration-200",
          toolsOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Sidebar الأدوات */}
      <aside
        dir="rtl"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(20rem,86vw)] flex-col rounded-l-3xl bg-card shadow-board transition-transform duration-250 ease-out",
          toolsOpen ? "translate-x-0" : "translate-x-full",
        )}
        style={{ transitionDuration: "250ms" }}
      >
        <div className="flex shrink-0 items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
          <span className="text-base font-semibold text-foreground">الأدوات</span>
          <button
            type="button"
            aria-label="إغلاق الأدوات"
            onClick={() => setToolsOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground active:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* أدوات التحكم */}
          <Section title="أدوات التحكم">
            <div className="grid grid-cols-3 gap-2">
              <ActionCard label="تكبير" onClick={() => zoomBy(1.25)}>
                <ZoomIn className="h-5 w-5" />
              </ActionCard>
              <ActionCard label="تصغير" onClick={() => zoomBy(1 / 1.25)}>
                <Minus className="h-5 w-5" />
              </ActionCard>
              <ActionCard label="حجم طبيعي" onClick={resetView}>
                <RotateCcw className="h-5 w-5" />
              </ActionCard>
              <ActionCard
                label="ممحاة"
                active={tool === "eraser"}
                onClick={() => setTool(tool === "eraser" ? "pen" : "eraser")}
              >
                <Eraser className="h-5 w-5" />
              </ActionCard>
              <ActionCard label="تراجع" onClick={undo} disabled={!canUndo}>
                <Undo2 className="h-5 w-5" />
              </ActionCard>
              <ActionCard label="إعادة" onClick={redo} disabled={!canRedo}>
                <Redo2 className="h-5 w-5" />
              </ActionCard>
            </div>
            <button
              type="button"
              onClick={() => (strokes.length ? setConfirmClear(true) : undefined)}
              disabled={strokes.length === 0}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-semibold text-foreground transition-transform active:scale-[0.98] disabled:opacity-35"
            >
              <Trash2 className="h-4 w-4" />
              تنظيف
            </button>
          </Section>

          {/* القلم */}
          <Section title="القلم">
            <div className="grid grid-cols-2 gap-2">
              <ToolChip
                label="قلم"
                active={tool === "pen" && shape === "free"}
                onClick={() => {
                  setTool("pen");
                  setShape("free");
                }}
              >
                <Pencil className="h-4 w-4" />
              </ToolChip>
              <ToolChip label="تحريك" active={tool === "hand"} onClick={() => setTool("hand")}>
                <Hand className="h-4 w-4" />
              </ToolChip>
            </div>
          </Section>

          {/* الألوان */}
          <Section title="الألوان">
            <div className="flex flex-wrap gap-2">
              {palette.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`اللون ${c}`}
                  onClick={() => {
                    setColor(c);
                    if (tool === "eraser" || tool === "hand") setTool("pen");
                  }}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border-2 p-[3px] transition-transform active:scale-90",
                    color === c ? "border-foreground" : "border-transparent",
                  )}
                >
                  <span
                    className="block h-8 w-8 rounded-full border border-border/60"
                    style={{ backgroundColor: c }}
                  />
                </button>
              ))}
            </div>
          </Section>

          {/* حجم القلم */}
          <Section title="حجم القلم">
            <div className="flex items-center gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-label={`سماكة ${s}`}
                  onClick={() => setSize(s)}
                  className={cn(
                    "flex h-12 flex-1 items-center justify-center rounded-xl transition-colors",
                    size === s ? "bg-secondary" : "bg-muted/40",
                  )}
                >
                  <span
                    className="rounded-full bg-foreground"
                    style={{ width: s + 5, height: s + 5 }}
                  />
                </button>
              ))}
            </div>
          </Section>

          {/* الأشكال */}
          <Section title="الأشكال">
            <div className="grid grid-cols-5 gap-2">
              <ShapeBtn
                label="خط حر"
                active={tool !== "shape" && shape === "free"}
                onClick={() => {
                  setTool("pen");
                  setShape("free");
                }}
              >
                <span className="text-lg leading-none">∿</span>
              </ShapeBtn>
              <ShapeBtn
                label="خط مستقيم"
                active={tool === "shape" && shape === "line"}
                onClick={() => {
                  setTool("shape");
                  setShape("line");
                }}
              >
                <span className="block h-4 w-4 rotate-45 border-r-2 border-current" />
              </ShapeBtn>
              <ShapeBtn
                label="مربع"
                active={tool === "shape" && shape === "rect"}
                onClick={() => {
                  setTool("shape");
                  setShape("rect");
                }}
              >
                <Square className="h-4 w-4" />
              </ShapeBtn>
              <ShapeBtn
                label="دائرة"
                active={tool === "shape" && shape === "circle"}
                onClick={() => {
                  setTool("shape");
                  setShape("circle");
                }}
              >
                <Circle className="h-4 w-4" />
              </ShapeBtn>
              <ShapeBtn
                label="مثلث"
                active={tool === "shape" && shape === "triangle"}
                onClick={() => {
                  setTool("shape");
                  setShape("triangle");
                }}
              >
                <Triangle className="h-4 w-4" />
              </ShapeBtn>
            </div>
          </Section>
        </div>
      </aside>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent dir="rtl" className="font-arabic">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">مسح كل الرسم؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              سيتم مسح رسم هذه السبورة، ويمكنك التراجع بعدها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-start gap-2">
            <AlertDialogAction onClick={clearBoard}>مسح</AlertDialogAction>
            <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function ModePill({
  active,
  label,
  onClick,
  activeClass,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  activeClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border px-2 text-[13px] font-semibold transition-all duration-200 active:scale-[0.97] sm:flex-none sm:px-5 sm:text-sm",
        active ? activeClass : "border-border bg-card text-foreground shadow-soft",
      )}
    >
      <Pencil className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function ActionCard({
  label,
  children,
  onClick,
  disabled,
  active,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-[58px] flex-col items-center justify-center gap-1 rounded-2xl bg-muted/40 transition-all active:scale-95 disabled:opacity-35",
        active && "bg-board-green-soft text-board-green",
      )}
    >
      <span>{children}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </button>
  );
}

function ToolChip({
  label,
  children,
  active,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors active:scale-95",
        active ? "bg-board-green-soft text-board-green" : "bg-muted/40 text-muted-foreground",
      )}
    >
      {children}
      {label}
    </button>
  );
}

function ShapeBtn({
  label,
  children,
  active,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-12 items-center justify-center rounded-xl transition-colors active:scale-95",
        active ? "bg-board-green-soft text-board-green" : "bg-muted/40 text-foreground",
      )}
    >
      {children}
    </button>
  );
}
