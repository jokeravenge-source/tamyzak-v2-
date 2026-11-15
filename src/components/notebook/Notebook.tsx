import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Expand,
  FileImage,
  FileText,
  Grid2X2,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Redo2,
  RotateCw,
  Settings2,
  Trash2,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import {
  baseItem,
  clamp,
  makeStroke,
  newPage,
  NotebookItem,
  NotebookPage,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PaperColor,
  PaperStyle,
  patchPage,
  Point,
  ShapeItem,
  strokeHit,
  TextItem,
  Tool,
  uid,
} from "./model";
import { ItemView, PageThumbnail, PaperBackground, TEXT_FONT } from "./Paper";
import { IconButton, Sidebar, TOOLS, ToolSettings } from "./Sidebar";
import { stickerById, StickerAsset } from "./stickers";
import { useNotebook } from "./useNotebook";
import { exportPDF, exportPNG } from "./export";
import "./notebook.css";

type Gesture =
  | { mode: "draw"; points: Point[]; brush: "pen" | "pencil" | "highlighter" }
  | { mode: "shape"; start: Point; item: ShapeItem }
  | {
      mode: "move" | "resize" | "rotate";
      start: Point;
      item: NotebookItem;
      corner?: string;
    }
  | { mode: "pan"; start: Point; origin: Point }
  | { mode: "erase"; last: Point };
type View = { width: number; height: number };
const INITIAL_SETTINGS: ToolSettings = {
  color: "#393735",
  size: 3,
  opacity: 1,
  stickyColor: "#FFF4C7",
  fontSize: 26,
  bold: false,
  italic: false,
  align: "left",
  shape: "rectangle",
  fill: "transparent",
};

function Modal({
  title,
  onClose,
  children,
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`nb-dialog ${className}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="nb-dialog-heading">
        <div>
          <span className="nb-eyebrow">MY NOTEBOOK</span>
          <h2>{title}</h2>
        </div>
        <IconButton label="Close dialog" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}

export function Notebook({
  onBack,
  onOpenLegacy,
}: {
  onBack?: () => void;
  onOpenLegacy?: () => void;
}) {
  const store = useNotebook();
  const doc = store.document;
  const page = doc?.pages.find((p) => p.id === doc.currentPageId);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 900,
  );
  const [tab, setTab] = useState<"stickers" | "tools">("stickers");
  const [tool, setToolState] = useState<Tool>("select");
  const [settings, setSettingsState] = useState(INITIAL_SETTINGS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = page?.items.find((i) => i.id === selectedId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = page?.items.find(
    (i) => i.id === editingId && (i.kind === "text" || i.kind === "sticky"),
  ) as TextItem | undefined;
  const [draft, setDraft] = useState<NotebookItem | null>(null);
  const [zoom, setZoom] = useState(0.65);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [viewport, setViewport] = useState<View>({ width: 800, height: 700 });
  const [overview, setOverview] = useState(false);
  const [help, setHelp] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null),
    viewportRef = useRef<HTMLDivElement>(null),
    svgRef = useRef<SVGSVGElement>(null),
    editorRef = useRef<HTMLTextAreaElement>(null);
  const gesture = useRef<Gesture | null>(null),
    raf = useRef<number | null>(null);
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<{
    distance: number;
    center: Point;
    zoom: number;
    pan: Point;
  } | null>(null);
  const fitMode = useRef(true);
  const viewRef = useRef({ zoom, pan });
  viewRef.current = { zoom, pan };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const brushSettings = useRef<
    Record<string, { size: number; color: string; opacity: number }>
  >({
    pen: { size: 3, color: "#393735", opacity: 1 },
    pencil: { size: 2, color: "#777065", opacity: 1 },
    highlighter: { size: 22, color: "#E8CD75", opacity: 1 },
    eraser: { size: 20, color: "#393735", opacity: 1 },
  });

  useEffect(() => {
    const title = document.title;
    document.title = "My Notebook · Digital Stationery";
    return () => {
      document.title = title;
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4200);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (editingId) {
      editorRef.current?.focus();
      editorRef.current?.setSelectionRange(
        editorRef.current.value.length,
        editorRef.current.value.length,
      );
    }
  }, [editingId]);
  useEffect(() => {
    const changed = () =>
      setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);

  const fit = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    fitMode.current = true;
    setZoom(
      clamp(
        Math.min(
          (rect.width - (rect.width < 600 ? 28 : 90)) / PAGE_WIDTH,
          (rect.height - 100) / PAGE_HEIGHT,
        ),
        0.15,
        1,
      ),
    );
    setPan({ x: 0, y: -24 });
  }, []);
  useLayoutEffect(() => {
    if (!doc || !viewportRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setViewport({ width, height });
      if (fitMode.current) fit();
    });
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [!!doc, fit]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const zoomWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      fitMode.current = false;
      setZoom((value) =>
        clamp(value * Math.exp(-event.deltaY * 0.002), 0.15, 2.5),
      );
    };
    element.addEventListener("wheel", zoomWheel, { passive: false });
    return () => element.removeEventListener("wheel", zoomWheel);
  }, [!!doc]);

  const currentPage = () =>
    store.current.current?.pages.find(
      (p) => p.id === store.current.current?.currentPageId,
    );
  const patchItem = useCallback(
    (patch: Partial<NotebookItem>, id = selectedId) => {
      if (!id) return;
      store.change((d) =>
        patchPage(d, (p) => ({
          ...p,
          items: p.items.map((item) =>
            item.id === id ? ({ ...item, ...patch } as NotebookItem) : item,
          ),
        })),
      );
    },
    [selectedId, store.change],
  );
  const addItem = (item: NotebookItem) => {
    store.change((d) =>
      patchPage(d, (p) => ({ ...p, items: [...p.items, item] })),
    );
    setSelectedId(item.id);
  };
  const finishEditing = () => {
    if (editingId) {
      store.commit();
      setEditingId(null);
    }
  };
  const setTool = (next: Tool) => {
    if (brushSettings.current[tool])
      brushSettings.current[tool] = {
        size: settings.size,
        color: settings.color,
        opacity: settings.opacity,
      };
    finishEditing();
    setToolState(next);
    setSelectedId(null);
    if (brushSettings.current[next])
      setSettingsState((s) => ({ ...s, ...brushSettings.current[next] }));
  };
  const setSettings = (patch: Partial<ToolSettings>) =>
    setSettingsState((s) => ({ ...s, ...patch }));
  const openTools = (next?: Tool) => {
    if (next) setTool(next);
    setTab("tools");
    setSidebarOpen(true);
  };
  const closeMobileDrawer = () => {
    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  const addSticker = (sticker: StickerAsset, point?: Point) => {
    finishEditing();
    const w = sticker.width / sticker.height > 1.6 ? 190 : 146,
      h = (w * sticker.height) / sticker.width;
    const n =
      currentPage()?.items.filter((i) => i.kind === "sticker").length ?? 0;
    const x = point ? point.x - w / 2 : 295 + (n % 4) * 18,
      y = point ? point.y - h / 2 : 350 + (n % 5) * 22;
    addItem({
      ...baseItem(
        clamp(x, 0, PAGE_WIDTH - w),
        clamp(y, 0, PAGE_HEIGHT - h),
        w,
        h,
      ),
      kind: "sticker",
      stickerId: sticker.id,
    });
    setToolState("select");
    closeMobileDrawer();
  };
  const addText = (kind: "text" | "sticky", point?: Point) => {
    finishEditing();
    const w = kind === "sticky" ? 260 : 320,
      h = kind === "sticky" ? 236 : 130;
    const item: TextItem = {
      ...baseItem(
        clamp(point?.x ?? 230, 0, PAGE_WIDTH - w),
        clamp(point?.y ?? 350, 0, PAGE_HEIGHT - h),
        w,
        h,
      ),
      kind,
      text: "",
      color: settings.color,
      background: kind === "sticky" ? settings.stickyColor : "transparent",
      fontSize: settings.fontSize,
      bold: settings.bold,
      italic: settings.italic,
      align: settings.align,
      opacity: settings.opacity,
    };
    addItem(item);
    setToolState("select");
    setEditingId(item.id);
    closeMobileDrawer();
    store.begin();
  };
  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    store.commit();
    setEditingId(null);
    store.change((d) =>
      patchPage(d, (p) => ({
        ...p,
        items: p.items.filter((i) => i.id !== selectedId),
      })),
    );
    setSelectedId(null);
  }, [selectedId, store.change, store.commit]);
  const duplicateSelected = useCallback(() => {
    const item = currentPage()?.items.find((i) => i.id === selectedId);
    if (!item) return;
    store.commit();
    setEditingId(null);
    const copy = {
      ...item,
      id: uid(),
      x: clamp(item.x + 24, 0, Math.max(0, PAGE_WIDTH - item.w)),
      y: clamp(item.y + 24, 0, Math.max(0, PAGE_HEIGHT - item.h)),
    };
    store.change((d) =>
      patchPage(d, (p) => ({ ...p, items: [...p.items, copy] })),
    );
    setSelectedId(copy.id);
  }, [selectedId, store.change, store.commit]);
  const reorder = (front: boolean) => {
    if (!selectedId) return;
    store.change((d) =>
      patchPage(d, (p) => {
        const items = [...p.items],
          index = items.findIndex((i) => i.id === selectedId);
        if (index < 0) return p;
        const [item] = items.splice(index, 1);
        items.splice(front ? items.length : Math.max(0, index - 1), 0, item);
        return { ...p, items };
      }),
    );
  };
  const undo = () => {
    setEditingId(null);
    setSelectedId(null);
    store.undo();
  };
  const redo = () => {
    setEditingId(null);
    setSelectedId(null);
    store.redo();
  };

  const navigate = (id: string) => {
    finishEditing();
    store.change((d) => ({ ...d, currentPageId: id }), false);
    setSelectedId(null);
    setDraft(null);
    fit();
  };
  const addPage = () => {
    finishEditing();
    const d = store.current.current;
    if (!d) return;
    const next = newPage(
      d.defaults.color,
      d.defaults.style,
      `Page ${d.pages.length + 1}`,
    );
    store.change((doc) => ({
      ...doc,
      pages: [...doc.pages, next],
      currentPageId: next.id,
    }));
    setSelectedId(null);
    setOverview(false);
    fit();
  };
  const duplicatePage = (id: string) => {
    finishEditing();
    store.change((d) => {
      const index = d.pages.findIndex((p) => p.id === id),
        original = d.pages[index];
      const copy: NotebookPage = {
        ...original,
        id: uid(),
        name: `${original.name} (copy)`,
        items: original.items.map((i) => ({ ...i, id: uid() })),
      };
      const pages = [...d.pages];
      pages.splice(index + 1, 0, copy);
      return { ...d, pages, currentPageId: copy.id };
    });
    setSelectedId(null);
  };
  const deletePage = () => {
    if (!pendingDelete) return;
    finishEditing();
    store.change((d) => {
      const index = d.pages.findIndex((p) => p.id === pendingDelete);
      let pages = d.pages.filter((p) => p.id !== pendingDelete);
      if (!pages.length)
        pages = [newPage(d.defaults.color, d.defaults.style, "Page 1")];
      return {
        ...d,
        pages,
        currentPageId:
          d.currentPageId === pendingDelete
            ? pages[Math.min(index, pages.length - 1)].id
            : d.currentPageId,
      };
    });
    setPendingDelete(null);
    setSelectedId(null);
    setNotice("Page removed. You can undo this anytime.");
  };
  const setPaper = (patch: { color?: PaperColor; style?: PaperStyle }) =>
    store.change((d) => ({
      ...patchPage(d, (p) => ({ ...p, ...patch })),
      defaults: { ...d.defaults, ...patch },
    }));

  const changeZoom = (value: number) => {
    fitMode.current = false;
    setZoom(clamp(value, 0.15, 2.5));
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (!fullscreen && rootRef.current?.requestFullscreen)
        await rootRef.current.requestFullscreen();
      else setFullscreen((v) => !v);
    } catch {
      setFullscreen((v) => !v);
    }
  };
  const runExport = async (type: "png" | "pdf") => {
    if (!page || !doc || exporting) return;
    finishEditing();
    setExportOpen(false);
    setExporting(
      type === "png"
        ? "Preparing PNG…"
        : `Preparing PDF… 0/${doc.pages.length}`,
    );
    try {
      if (type === "png") await exportPNG(page);
      else
        await exportPDF(doc.pages, (n) =>
          setExporting(`Preparing PDF… ${n}/${doc.pages.length}`),
        );
      setNotice(
        type === "png"
          ? "Your page was exported as a PNG."
          : "Your notebook was exported as a PDF.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Export failed. Please try again.",
      );
    } finally {
      setExporting(null);
    }
  };

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input,textarea,select,[contenteditable=true],dialog"))
        return;
      const mod = event.ctrlKey || event.metaKey,
        key = event.key.toLowerCase();
      if (mod && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (mod && key === "s") {
        event.preventDefault();
        store.retrySave();
        return;
      }
      if (mod && key === "d") {
        event.preventDefault();
        duplicateSelected();
        return;
      }
      if (key === "delete" || key === "backspace") {
        event.preventDefault();
        removeSelected();
        return;
      }
      if (key === "escape") {
        finishEditing();
        setSelectedId(null);
        setExportOpen(false);
        setOverview(false);
        setHelp(false);
        if (fullscreen && !document.fullscreenElement) setFullscreen(false);
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        setSpaceHeld(true);
        return;
      }
      if (
        selectedId &&
        ["arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)
      ) {
        event.preventDefault();
        const i = currentPage()?.items.find((i) => i.id === selectedId);
        if (!i) return;
        const step = event.shiftKey ? 10 : 1;
        patchItem({
          x: clamp(
            i.x +
              (key === "arrowleft" ? -step : key === "arrowright" ? step : 0),
            0,
            Math.max(0, PAGE_WIDTH - i.w),
          ),
          y: clamp(
            i.y + (key === "arrowup" ? -step : key === "arrowdown" ? step : 0),
            0,
            Math.max(0, PAGE_HEIGHT - i.h),
          ),
        });
        return;
      }
      if (!mod && !event.altKey) {
        const next = TOOLS.find((t) => t.key.toLowerCase() === key);
        if (next) setTool(next.id);
      }
    };
    const release = (event: KeyboardEvent) => {
      if (event.code === "Space") setSpaceHeld(false);
    };
    const blur = () => setSpaceHeld(false);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", blur);
    };
  }, [
    selectedId,
    patchItem,
    duplicateSelected,
    removeSelected,
    editingId,
    fullscreen,
    store.undo,
    store.redo,
    tool,
    settings,
  ]);

  const pagePoint = (client: Point) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((client.x - rect.left) * PAGE_WIDTH) / rect.width,
      y: ((client.y - rect.top) * PAGE_HEIGHT) / rect.height,
    };
  };
  const inPaper = (p: Point) =>
    p.x >= 0 && p.y >= 0 && p.x <= PAGE_WIDTH && p.y <= PAGE_HEIGHT;
  const eraseAt = (from: Point, to: Point) => {
    const radius = settingsRef.current.size,
      distance = Math.hypot(to.x - from.x, to.y - from.y),
      steps = Math.max(1, Math.ceil(distance / Math.max(2, radius / 2)));
    const samples = Array.from({ length: steps + 1 }, (_, n) => ({
      x: from.x + ((to.x - from.x) * n) / steps,
      y: from.y + ((to.y - from.y) * n) / steps,
    }));
    store.change(
      (d) =>
        patchPage(d, (p) => {
          const items = p.items.filter(
            (i) =>
              i.kind !== "stroke" ||
              !samples.some((point) => strokeHit(i, point, radius)),
          );
          return items.length === p.items.length ? p : { ...p, items };
        }),
      false,
    );
  };
  const refreshDraft = () => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      const active = gesture.current;
      if (active?.mode === "draw") {
        const s = settingsRef.current;
        setDraft(
          makeStroke(active.points, s.color, s.size, active.brush, s.opacity),
        );
      }
      if (active?.mode === "shape") setDraft({ ...active.item });
    });
  };
  const pointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      (event.target as HTMLElement).closest(
        "button,input,textarea,select,[data-no-gesture]",
      )
    )
      return;
    if (event.button !== 0 && event.button !== 1) return;
    const client = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, client);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size === 2) {
      store.cancel();
      gesture.current = null;
      setDraft(null);
      finishEditing();
      const [a, b] = [...pointers.current.values()],
        rect = event.currentTarget.getBoundingClientRect();
      pinch.current = {
        distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
        center: {
          x: (a.x + b.x) / 2 - rect.left - rect.width / 2,
          y: (a.y + b.y) / 2 - rect.top - rect.height / 2,
        },
        ...viewRef.current,
      };
      return;
    }
    if (pointers.current.size > 2) return;
    if (tool === "pan" || spaceHeld || event.button === 1) {
      gesture.current = {
        mode: "pan",
        start: client,
        origin: viewRef.current.pan,
      };
      return;
    }
    const point = pagePoint(client);
    if (!inPaper(point)) {
      setSelectedId(null);
      return;
    }
    finishEditing();
    event.preventDefault();
    const target = event.target as Element,
      handle = target.closest("[data-handle]")?.getAttribute("data-handle"),
      id = target.closest("[data-item-id]")?.getAttribute("data-item-id");
    if (handle && selected) {
      store.begin();
      gesture.current = {
        mode: handle === "rotate" ? "rotate" : "resize",
        start: point,
        item: { ...selected },
        corner: handle,
      };
      return;
    }
    if (tool === "select") {
      const item = currentPage()?.items.find((i) => i.id === id);
      if (item) {
        setSelectedId(item.id);
        store.begin();
        gesture.current = { mode: "move", start: point, item: { ...item } };
      } else setSelectedId(null);
    } else if (tool === "text" || tool === "sticky") addText(tool, point);
    else if (tool === "eraser") {
      setSelectedId(null);
      store.begin();
      gesture.current = { mode: "erase", last: point };
      eraseAt(point, point);
    } else if (tool === "shape") {
      setSelectedId(null);
      gesture.current = {
        mode: "shape",
        start: point,
        item: {
          ...baseItem(point.x, point.y, 1, 1),
          kind: "shape",
          shape: settings.shape,
          color: settings.color,
          size: settings.size,
          fill: settings.fill,
          opacity: settings.opacity,
        },
      };
    } else {
      setSelectedId(null);
      gesture.current = { mode: "draw", points: [point], brush: tool };
      refreshDraft();
    }
  };
  const pointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    if (pinch.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()],
        initial = pinch.current,
        rect = event.currentTarget.getBoundingClientRect();
      const next = clamp(
          (initial.zoom * Math.hypot(b.x - a.x, b.y - a.y)) / initial.distance,
          0.15,
          2.5,
        ),
        ratio = next / initial.zoom;
      fitMode.current = false;
      setZoom(next);
      setPan({
        x:
          (a.x + b.x) / 2 -
          rect.left -
          rect.width / 2 -
          (initial.center.x - initial.pan.x) * ratio,
        y:
          (a.y + b.y) / 2 -
          rect.top -
          rect.height / 2 -
          (initial.center.y - initial.pan.y) * ratio,
      });
      return;
    }
    const active = gesture.current;
    if (!active) return;
    if (active.mode === "pan") {
      fitMode.current = false;
      setPan({
        x: active.origin.x + event.clientX - active.start.x,
        y: active.origin.y + event.clientY - active.start.y,
      });
      return;
    }
    const point = pagePoint({ x: event.clientX, y: event.clientY });
    point.x = clamp(point.x, 0, PAGE_WIDTH);
    point.y = clamp(point.y, 0, PAGE_HEIGHT);
    if (active.mode === "draw") {
      const events = event.nativeEvent.getCoalescedEvents?.() ?? [
        event.nativeEvent,
      ];
      for (const e of events.length ? events : [event.nativeEvent]) {
        const p = pagePoint({ x: e.clientX, y: e.clientY });
        p.x = clamp(p.x, 0, PAGE_WIDTH);
        p.y = clamp(p.y, 0, PAGE_HEIGHT);
        const last = active.points[active.points.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) > 0.6) active.points.push(p);
      }
      refreshDraft();
    } else if (active.mode === "shape") {
      Object.assign(active.item, {
        x: Math.min(point.x, active.start.x),
        y: Math.min(point.y, active.start.y),
        w: Math.max(1, Math.abs(point.x - active.start.x)),
        h: Math.max(1, Math.abs(point.y - active.start.y)),
        flipX: point.x < active.start.x,
        flipY: point.y < active.start.y,
      });
      refreshDraft();
    } else if (active.mode === "erase") {
      eraseAt(active.last, point);
      active.last = point;
    } else if (active.mode === "move")
      patchItem(
        {
          x: clamp(
            active.item.x + point.x - active.start.x,
            0,
            Math.max(0, PAGE_WIDTH - active.item.w),
          ),
          y: clamp(
            active.item.y + point.y - active.start.y,
            0,
            Math.max(0, PAGE_HEIGHT - active.item.h),
          ),
        },
        active.item.id,
      );
    else if (active.mode === "rotate") {
      const center = {
          x: active.item.x + active.item.w / 2,
          y: active.item.y + active.item.h / 2,
        },
        start = Math.atan2(
          active.start.y - center.y,
          active.start.x - center.x,
        ),
        now = Math.atan2(point.y - center.y, point.x - center.x);
      patchItem(
        {
          rotation: Math.round(
            active.item.rotation + ((now - start) * 180) / Math.PI,
          ),
        },
        active.item.id,
      );
    } else if (active.mode === "resize") {
      const i = active.item,
        a = (-i.rotation * Math.PI) / 180,
        dx = point.x - active.start.x,
        dy = point.y - active.start.y,
        local = {
          x: dx * Math.cos(a) - dy * Math.sin(a),
          y: dx * Math.sin(a) + dy * Math.cos(a),
        };
      const sx = active.corner?.includes("w") ? -1 : 1,
        sy = active.corner?.includes("n") ? -1 : 1;
      let w = clamp(i.w + local.x * sx, 20, PAGE_WIDTH),
        h = clamp(i.h + local.y * sy, 20, PAGE_HEIGHT);
      if (i.kind === "sticker" || event.shiftKey) {
        const ratio = Math.max(w / i.w, h / i.h);
        w = Math.min(PAGE_WIDTH, i.w * ratio);
        h = (w * i.h) / i.w;
        if (h > PAGE_HEIGHT) {
          h = PAGE_HEIGHT;
          w = (h * i.w) / i.h;
        }
      }
      const ca = Math.cos(-a),
        sa = Math.sin(-a),
        ox = ((w - i.w) * sx) / 2,
        oy = ((h - i.h) * sy) / 2;
      patchItem(
        {
          w,
          h,
          x: i.x + i.w / 2 + ox * ca - oy * sa - w / 2,
          y: i.y + i.h / 2 + ox * sa + oy * ca - h / 2,
        },
        i.id,
      );
    }
  };
  const pointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (pinch.current) {
      if (pointers.current.size < 2) pinch.current = null;
      gesture.current = null;
      return;
    }
    const active = gesture.current;
    gesture.current = null;
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    if (active?.mode === "draw") {
      const s = settingsRef.current;
      addItem(
        makeStroke(active.points, s.color, s.size, active.brush, s.opacity),
      );
      setSelectedId(null);
    }
    if (active?.mode === "shape") {
      const item = active.item;
      if (item.w < 5 && item.h < 5) {
        item.w = 150;
        item.h = 100;
        item.x = Math.min(item.x, PAGE_WIDTH - 150);
        item.y = Math.min(item.y, PAGE_HEIGHT - 100);
      }
      addItem(item);
      setToolState("select");
    }
    if (active) store.commit();
    setDraft(null);
  };

  if (!doc || !page)
    return (
      <div className="stationery-notebook nb-loading">
        {store.loadError ? (
          <>
            <BookOpen size={36} />
            <h1>Your notebook is safely kept</h1>
            <p>{store.loadError}</p>
            <button
              className="nb-primary-button"
              onClick={() => window.location.reload()}
            >
              Try opening again
            </button>
          </>
        ) : (
          <>
            <Loader2 className="nb-spin" size={28} />
            <p>Opening your little corner…</p>
          </>
        )}
      </div>
    );
  const pageIndex = doc.pages.findIndex((p) => p.id === page.id);
  const selectedToolbar = selected
    ? {
        left: clamp(
          viewport.width / 2 +
            pan.x +
            (selected.x + selected.w / 2 - PAGE_WIDTH / 2) * zoom,
          Math.min(155, viewport.width / 2),
          Math.max(viewport.width / 2, viewport.width - 155),
        ),
        top: clamp(
          viewport.height / 2 +
            pan.y +
            (selected.y - PAGE_HEIGHT / 2) * zoom -
            55,
          8,
          viewport.height - 100,
        ),
      }
    : undefined;
  const hit = Math.max(6, 10 / zoom),
    handleRadius = Math.max(5, 6 / zoom);

  return (
    <div
      ref={rootRef}
      className={`stationery-notebook ${fullscreen ? "nb-fullscreen" : ""}`}
      dir="ltr"
    >
      <header className="nb-header">
        <div className="nb-brand">
          {onBack && (
            <IconButton
              label="Back to Tamayzak"
              className="nb-back"
              onClick={onBack}
            >
              <ArrowLeft size={18} />
            </IconButton>
          )}
          <span className="nb-brand-icon">
            <BookOpen size={23} strokeWidth={1.5} />
          </span>
          <div>
            <h1>
              My Notebook<span className="nb-brand-dot">.</span>
            </h1>
            <p>Digital Stationery</p>
          </div>
        </div>
        <span
          className={`nb-save-status ${store.status === "error" ? "is-error" : ""}`}
          aria-live="polite"
        >
          {store.status === "saved" ? (
            <Check size={13} />
          ) : store.status === "error" ? (
            <X size={13} />
          ) : (
            <Loader2 size={13} className="nb-spin" />
          )}
          <span>
            {store.status === "saved"
              ? "All changes saved"
              : store.status === "error"
                ? "Couldn’t save"
                : "Saving…"}
          </span>
          {store.status === "error" && (
            <button onClick={store.retrySave}>Retry</button>
          )}
        </span>
        <div className="nb-header-actions">
          <IconButton label="Undo" disabled={!store.canUndo} onClick={undo}>
            <Undo2 size={18} />
          </IconButton>
          <IconButton label="Redo" disabled={!store.canRedo} onClick={redo}>
            <Redo2 size={18} />
          </IconButton>
          <span className="nb-divider" />
          <IconButton
            label="Delete selected item"
            disabled={!selected}
            onClick={removeSelected}
          >
            <Trash2 size={17} />
          </IconButton>
          <IconButton
            label="Notebook settings"
            className="nb-settings-button"
            onClick={() => setHelp(true)}
          >
            <Settings2 size={17} />
          </IconButton>
          <div className="nb-export-wrapper">
            <button
              className="nb-export-button"
              aria-expanded={exportOpen}
              onClick={() => setExportOpen((v) => !v)}
              disabled={!!exporting}
            >
              {exporting ? (
                <Loader2 className="nb-spin" size={15} />
              ) : (
                <Download size={15} />
              )}
              <span>{exporting ? "Exporting…" : "Export"}</span>
              <ChevronDown size={13} />
            </button>
            {exportOpen && (
              <>
                <button
                  className="nb-menu-dismiss"
                  aria-label="Close export menu"
                  onClick={() => setExportOpen(false)}
                />
                <div className="nb-export-menu">
                  <button onClick={() => void runExport("png")}>
                    <FileImage size={18} />
                    <span>
                      Current page<small>PNG image · high resolution</small>
                    </span>
                  </button>
                  <button onClick={() => void runExport("pdf")}>
                    <FileText size={18} />
                    <span>
                      Entire notebook
                      <small>PDF document · {doc.pages.length} pages</small>
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="nb-body">
        <Sidebar
          open={sidebarOpen}
          tab={tab}
          setTab={setTab}
          close={() => setSidebarOpen(false)}
          tool={tool}
          setTool={setTool}
          settings={settings}
          setSettings={setSettings}
          selected={selected}
          patchItem={patchItem}
          addSticker={addSticker}
          addSticky={() => addText("sticky")}
          editText={() => {
            if (
              selected &&
              (selected.kind === "text" || selected.kind === "sticky")
            ) {
              store.begin();
              setEditingId(selected.id);
              closeMobileDrawer();
            }
          }}
        />
        <main className="nb-workspace">
          <div className="nb-pagebar">
            <div className="nb-page-heading">
              <IconButton
                label={sidebarOpen ? "Hide supplies" : "Show supplies"}
                onClick={() => setSidebarOpen((v) => !v)}
              >
                {sidebarOpen ? (
                  <PanelLeftClose size={18} />
                ) : (
                  <PanelLeftOpen size={18} />
                )}
              </IconButton>
              <div>
                <span className="nb-eyebrow">YOUR EVERYDAY NOTEBOOK</span>
                <label>
                  <span className="nb-sr-only">Page name</span>
                  <input
                    aria-label="Page name"
                    value={page.name}
                    maxLength={100}
                    onFocus={store.begin}
                    onBlur={store.commit}
                    onChange={(e) =>
                      store.change(
                        (d) =>
                          patchPage(d, (p) => ({ ...p, name: e.target.value })),
                        false,
                      )
                    }
                  />
                </label>
              </div>
            </div>
            <div className="nb-paper-controls">
              <div
                className="nb-paper-colors"
                role="group"
                aria-label="Paper color"
              >
                <button
                  aria-label="White paper"
                  aria-pressed={page.color === "white"}
                  className={page.color === "white" ? "is-active" : ""}
                  onClick={() => setPaper({ color: "white" })}
                  style={{ background: "#FFFFFF" }}
                >
                  {page.color === "white" && <Check size={12} />}
                </button>
                <button
                  aria-label="Pale yellow paper"
                  aria-pressed={page.color === "yellow"}
                  className={page.color === "yellow" ? "is-active" : ""}
                  onClick={() => setPaper({ color: "yellow" })}
                  style={{ background: "#FFF4C7" }}
                >
                  {page.color === "yellow" && <Check size={12} />}
                </button>
              </div>
              <span className="nb-divider" />
              <label className="nb-paper-select">
                <span className="nb-sr-only">Paper style</span>
                <select
                  aria-label="Paper style"
                  value={page.style}
                  onChange={(e) =>
                    setPaper({ style: e.target.value as PaperStyle })
                  }
                >
                  <option value="plain">Plain paper</option>
                  <option value="lined">Lined paper</option>
                  <option value="grid">Grid paper</option>
                  <option value="dotted">Dotted paper</option>
                </select>
                <ChevronDown size={12} />
              </label>
            </div>
          </div>
          <div
            ref={viewportRef}
            className={`nb-viewport nb-tool-${spaceHeld ? "pan" : tool} ${dropActive ? "nb-dropping" : ""}`}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerUp}
            onPointerCancel={(event) => {
              pointers.current.delete(event.pointerId);
              pinch.current = null;
              if (raf.current) {
                cancelAnimationFrame(raf.current);
                raf.current = null;
              }
              gesture.current = null;
              setDraft(null);
              store.commit();
            }}
            onDragOver={(event) => {
              if (
                event.dataTransfer.types.includes(
                  "application/x-notebook-sticker",
                )
              ) {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                setDropActive(true);
              }
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node))
                setDropActive(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDropActive(false);
              const sticker = stickerById.get(
                event.dataTransfer.getData("application/x-notebook-sticker"),
              );
              if (sticker)
                addSticker(
                  sticker,
                  pagePoint({ x: event.clientX, y: event.clientY }),
                );
            }}
            onWheel={(event) => {
              if (
                !event.ctrlKey &&
                !event.metaKey &&
                (tool === "pan" || zoom > 1)
              ) {
                fitMode.current = false;
                setPan((p) => ({
                  x: p.x - event.deltaX,
                  y: p.y - event.deltaY,
                }));
              }
            }}
          >
            <div className="nb-page-position" aria-hidden="true">
              {String(pageIndex + 1).padStart(2, "0")} /{" "}
              {String(doc.pages.length).padStart(2, "0")}
            </div>
            <div
              className="nb-paper"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              <svg
                ref={svgRef}
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                viewBox={`0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}`}
                aria-label={`Notebook page ${pageIndex + 1}`}
                data-testid="notebook-paper"
                onDoubleClick={(event) => {
                  const id = (event.target as Element)
                      .closest("[data-item-id]")
                      ?.getAttribute("data-item-id"),
                    item = page.items.find((i) => i.id === id);
                  if (
                    item &&
                    (item.kind === "text" || item.kind === "sticky")
                  ) {
                    setSelectedId(item.id);
                    store.begin();
                    setEditingId(item.id);
                  }
                }}
              >
                <PaperBackground page={page} prefix="paper" />
                {page.items.map((item) => (
                  <ItemView
                    key={item.id}
                    item={item}
                    prefix="paper"
                    interactive={tool === "select"}
                    hiddenText={item.id === editingId}
                  />
                ))}
                {draft && <ItemView item={draft} prefix="draft" />}
                {selected && !editing && tool === "select" && (
                  <g
                    className="nb-selection"
                    transform={`translate(${selected.x} ${selected.y}) rotate(${selected.rotation} ${selected.w / 2} ${selected.h / 2})`}
                  >
                    <rect
                      x={-4}
                      y={-4}
                      width={selected.w + 8}
                      height={selected.h + 8}
                      rx="2"
                      fill="none"
                      stroke="#BA8B9B"
                      strokeWidth={1.2 / zoom}
                      strokeDasharray={`${4 / zoom} ${3 / zoom}`}
                      pointerEvents="none"
                    />
                    <path
                      d={`M${selected.w / 2} -4 V${-30 / zoom}`}
                      stroke="#BA8B9B"
                      strokeWidth={1 / zoom}
                    />
                    <circle
                      cx={selected.w / 2}
                      cy={-30 / zoom}
                      r={hit}
                      fill="transparent"
                      data-handle="rotate"
                      style={{ cursor: "grab" }}
                    />
                    <circle
                      cx={selected.w / 2}
                      cy={-30 / zoom}
                      r={handleRadius}
                      fill="#F4C6CF"
                      stroke="#AD7C8D"
                      strokeWidth={1 / zoom}
                      data-handle="rotate"
                      style={{ cursor: "grab" }}
                    />
                    {[
                      { x: -4, y: -4, corner: "nw" },
                      { x: selected.w + 4, y: -4, corner: "ne" },
                      { x: selected.w + 4, y: selected.h + 4, corner: "se" },
                      { x: -4, y: selected.h + 4, corner: "sw" },
                    ].map((p) => (
                      <g key={p.corner}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hit}
                          fill="transparent"
                          data-handle={p.corner}
                          style={{ cursor: `${p.corner}-resize` }}
                        />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={handleRadius}
                          fill="white"
                          stroke="#AD7C8D"
                          strokeWidth={1.2 / zoom}
                          data-handle={p.corner}
                          style={{ cursor: `${p.corner}-resize` }}
                        />
                      </g>
                    ))}
                  </g>
                )}
              </svg>
              {editing && (
                <textarea
                  ref={editorRef}
                  className="nb-text-editor"
                  aria-label="Edit page text"
                  dir="auto"
                  value={editing.text}
                  placeholder={
                    editing.kind === "sticky"
                      ? "A little note…"
                      : "Your words here…"
                  }
                  style={{
                    left: editing.x,
                    top: editing.y,
                    width: editing.w,
                    height: editing.h,
                    transform: `rotate(${editing.rotation}deg)`,
                    padding: editing.kind === "sticky" ? 24 : 4,
                    color: editing.color,
                    fontSize: editing.fontSize,
                    fontWeight: editing.bold ? 700 : 400,
                    fontStyle: editing.italic ? "italic" : "normal",
                    textAlign: editing.align,
                    fontFamily: TEXT_FONT,
                    opacity: editing.opacity,
                  }}
                  onChange={(e) =>
                    patchItem({ text: e.target.value }, editing.id)
                  }
                  onBlur={() => {
                    store.commit();
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Escape" ||
                      (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                    ) {
                      e.preventDefault();
                      finishEditing();
                    }
                  }}
                />
              )}
            </div>
            {selected && !editing && tool === "select" && (
              <div
                className="nb-context-toolbar"
                data-no-gesture
                style={selectedToolbar}
              >
                <IconButton label="Duplicate item" onClick={duplicateSelected}>
                  <Copy size={16} />
                </IconButton>
                <IconButton
                  label="Rotate item 15 degrees"
                  onClick={() =>
                    patchItem({ rotation: selected.rotation + 15 })
                  }
                >
                  <RotateCw size={16} />
                </IconButton>
                <IconButton
                  label="Bring item to front"
                  onClick={() => reorder(true)}
                >
                  <Layers size={16} />
                </IconButton>
                <IconButton
                  label="Send item backward"
                  onClick={() => reorder(false)}
                >
                  <ArrowDownToLine size={16} />
                </IconButton>
                <IconButton
                  label="Item properties"
                  onClick={() => {
                    setTab("tools");
                    setSidebarOpen(true);
                  }}
                >
                  <Settings2 size={16} />
                </IconButton>
                <span className="nb-divider" />
                <IconButton label="Delete item" onClick={removeSelected}>
                  <Trash2 size={16} />
                </IconButton>
              </div>
            )}
            <div
              className="nb-quicktools"
              role="toolbar"
              aria-label="Quick tools"
              data-no-gesture
            >
              {TOOLS.map((t) => (
                <IconButton
                  key={t.id}
                  label={`${t.label} tool`}
                  active={tool === t.id}
                  onClick={() => {
                    setTool(t.id);
                    if (["shape", "highlighter", "pencil"].includes(t.id)) {
                      setTab("tools");
                      if (window.innerWidth >= 900) setSidebarOpen(true);
                    }
                  }}
                >
                  <t.icon size={18} />
                </IconButton>
              ))}
              <span className="nb-divider" />
              <IconButton label="Tool options" onClick={() => openTools()}>
                <MoreHorizontal size={19} />
              </IconButton>
            </div>
            {notice && (
              <div className="nb-toast" role="status">
                {notice}
                <button
                  aria-label="Dismiss notification"
                  onClick={() => setNotice(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {exporting && (
              <div className="nb-export-progress" role="status">
                <Loader2 className="nb-spin" size={17} />
                {exporting}
              </div>
            )}
          </div>
          <footer className="nb-footer">
            <div className="nb-page-navigation">
              <IconButton
                label="Page overview"
                onClick={() => setOverview(true)}
              >
                <Grid2X2 size={17} />
              </IconButton>
              <span className="nb-divider" />
              <IconButton
                label="Previous page"
                disabled={pageIndex === 0}
                onClick={() => navigate(doc.pages[pageIndex - 1].id)}
              >
                <ChevronLeft size={17} />
              </IconButton>
              <button
                className="nb-page-count"
                onClick={() => setOverview(true)}
                aria-label={`Page ${pageIndex + 1} of ${doc.pages.length}`}
              >
                {pageIndex + 1}
                <span>/ {doc.pages.length}</span>
              </button>
              <IconButton
                label="Next page"
                disabled={pageIndex === doc.pages.length - 1}
                onClick={() => navigate(doc.pages[pageIndex + 1].id)}
              >
                <ChevronRight size={17} />
              </IconButton>
              <IconButton label="Add new page" onClick={addPage}>
                <Plus size={18} />
              </IconButton>
            </div>
            <span className="nb-footer-note">
              A thought becomes a little something.
            </span>
            <div className="nb-zoom-controls">
              <IconButton
                label="Zoom out"
                disabled={zoom <= 0.15}
                onClick={() => changeZoom(zoom / 1.2)}
              >
                <ZoomOut size={16} />
              </IconButton>
              <button
                className="nb-zoom-percent"
                onClick={() => {
                  changeZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                aria-label="Reset zoom to 100 percent"
              >
                {Math.round(zoom * 100)}%
              </button>
              <IconButton
                label="Zoom in"
                disabled={zoom >= 2.5}
                onClick={() => changeZoom(zoom * 1.2)}
              >
                <ZoomIn size={16} />
              </IconButton>
              <span className="nb-divider" />
              <IconButton label="Fit page to screen" onClick={fit}>
                <Expand size={17} />
              </IconButton>
              <IconButton
                label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={() => void toggleFullscreen()}
              >
                {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              </IconButton>
            </div>
          </footer>
        </main>
      </div>
      {overview && (
        <Modal
          title="Every page, a possibility."
          onClose={() => setOverview(false)}
          className="nb-overview-dialog"
        >
          <div className="nb-overview-subtitle">
            <p>
              {doc.pages.length} {doc.pages.length === 1 ? "page" : "pages"} in
              your notebook
            </p>
            <button className="nb-primary-button" onClick={addPage}>
              <Plus size={16} />
              New page
            </button>
          </div>
          <div className="nb-overview-grid">
            {doc.pages.map((p, n) => (
              <div
                key={p.id}
                className={`nb-page-card ${p.id === page.id ? "is-current" : ""}`}
              >
                <button
                  className="nb-thumbnail"
                  aria-label={`Open page ${n + 1}: ${p.name}`}
                  onClick={() => {
                    navigate(p.id);
                    setOverview(false);
                  }}
                >
                  <PageThumbnail page={p} prefix={`thumb-${p.id}`} />
                  <span className="nb-thumbnail-number">{n + 1}</span>
                  {p.id === page.id && (
                    <span className="nb-current-badge">
                      <Check size={12} />
                      Current
                    </span>
                  )}
                </button>
                <div className="nb-page-card-footer">
                  <span>{p.name || "Untitled page"}</span>
                  <IconButton
                    label={`Duplicate page ${n + 1}`}
                    onClick={() => duplicatePage(p.id)}
                  >
                    <Copy size={15} />
                  </IconButton>
                  <IconButton
                    label={`Delete page ${n + 1}`}
                    onClick={() => setPendingDelete(p.id)}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              </div>
            ))}
            <button className="nb-new-page-card" onClick={addPage}>
              <Plus size={25} />
              <span>A fresh page</span>
            </button>
          </div>
        </Modal>
      )}
      {pendingDelete && (
        <Modal title="Remove this page?" onClose={() => setPendingDelete(null)}>
          <p className="nb-dialog-description">
            This page will be removed from your notebook. You can bring it back
            with Undo.
          </p>
          <div className="nb-dialog-actions">
            <button
              className="nb-secondary-button"
              onClick={() => setPendingDelete(null)}
            >
              Keep page
            </button>
            <button className="nb-danger-button" onClick={deletePage}>
              <Trash2 size={15} />
              Remove page
            </button>
          </div>
        </Modal>
      )}
      {help && (
        <Modal title="Make yourself at home." onClose={() => setHelp(false)}>
          <p className="nb-dialog-description">
            Your notebook saves automatically on this device. Export a PDF to
            keep a copy or take your pages with you.
          </p>
          <h3 className="nb-shortcuts-title">A few handy shortcuts</h3>
          <div className="nb-shortcut-list">
            <span>
              Undo / Redo<kbd>Ctrl ⌘ Z / Shift Z</kbd>
            </span>
            <span>
              Duplicate selection<kbd>Ctrl ⌘ D</kbd>
            </span>
            <span>
              Delete selection<kbd>Delete</kbd>
            </span>
            <span>
              Move selection<kbd>↑ ↓ ← →</kbd>
            </span>
            <span>
              Pan temporarily<kbd>Space + drag</kbd>
            </span>
            <span>
              Zoom<kbd>Ctrl ⌘ + scroll</kbd>
            </span>
            <span>
              Finish editing<kbd>Esc / Ctrl ⌘ Enter</kbd>
            </span>
          </div>
          <p className="nb-dialog-description">
            On touch screens, use two fingers to move and zoom the page. Drag
            the corner handles to resize an item and the round top handle to
            rotate it.
          </p>
          {onOpenLegacy && (
            <button
              className="nb-secondary-button nb-legacy-button"
              onClick={onOpenLegacy}
            >
              <BookOpen size={16} />
              Open previous canvas drawings
            </button>
          )}
        </Modal>
      )}
    </div>
  );
}
