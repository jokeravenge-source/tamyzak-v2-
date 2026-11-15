export const PAGE_WIDTH = 760;
export const PAGE_HEIGHT = 1040;
export const STORAGE_KEY = "tamayzak.stationery-notebook.v1";
export const PAPER_COLORS = { white: "#FFFFFF", yellow: "#FFF4C7" } as const;
export const INK_COLORS = [
  "#393735",
  "#9D596B",
  "#58768F",
  "#70846B",
  "#AE8146",
  "#8B76A0",
  "#D66D70",
  "#FFFFFF",
];
export const PASTELS = [
  "#FFF4C7",
  "#F4C6CF",
  "#BFD8E8",
  "#B8C9B2",
  "#EDE5D8",
  "#DED3EB",
];
export type PaperColor = keyof typeof PAPER_COLORS;
export type PaperStyle = "plain" | "lined" | "grid" | "dotted";
export type Tool =
  | "select"
  | "pan"
  | "pen"
  | "pencil"
  | "highlighter"
  | "eraser"
  | "text"
  | "sticky"
  | "shape";
export type ShapeKind =
  | "rectangle"
  | "circle"
  | "arrow"
  | "line"
  | "heart"
  | "star";
export type Point = { x: number; y: number };
export interface ItemBase {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  opacity: number;
}
export interface StickerItem extends ItemBase {
  kind: "sticker";
  stickerId: string;
}
export interface StrokeItem extends ItemBase {
  kind: "stroke";
  points: Point[];
  color: string;
  size: number;
  brush: "pen" | "pencil" | "highlighter";
}
export interface TextItem extends ItemBase {
  kind: "text" | "sticky";
  text: string;
  color: string;
  background: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
}
export interface ShapeItem extends ItemBase {
  kind: "shape";
  shape: ShapeKind;
  color: string;
  fill: string;
  size: number;
  flipX?: boolean;
  flipY?: boolean;
}
export type NotebookItem = StickerItem | StrokeItem | TextItem | ShapeItem;
export interface NotebookPage {
  id: string;
  name: string;
  color: PaperColor;
  style: PaperStyle;
  items: NotebookItem[];
}
export interface NotebookDocument {
  version: 1;
  pages: NotebookPage[];
  currentPageId: string;
  defaults: { color: PaperColor; style: PaperStyle };
}
export const uid = () => crypto.randomUUID();
export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);
export const baseItem = (
  x: number,
  y: number,
  w: number,
  h: number,
): ItemBase => ({ id: uid(), x, y, w, h, rotation: 0, opacity: 1 });
export const newPage = (
  color: PaperColor = "white",
  style: PaperStyle = "plain",
  name = "Untitled page",
): NotebookPage => ({ id: uid(), name, color, style, items: [] });

export function createNotebook(): NotebookDocument {
  const page = newPage("white", "plain", "A fresh start");
  page.items = [
    {
      ...baseItem(72, 86, 475, 30),
      kind: "text",
      text: "NOTES, DREAMS & LITTLE THINGS",
      color: "#9D826D",
      background: "transparent",
      fontSize: 14,
      bold: true,
      italic: false,
      align: "left",
    },
    {
      ...baseItem(68, 138, 515, 155),
      kind: "text",
      text: "A little space\nfor big ideas.",
      color: "#393735",
      background: "transparent",
      fontSize: 51,
      bold: false,
      italic: false,
      align: "left",
    },
    {
      ...baseItem(543, 94, 139, 151),
      kind: "sticker",
      stickerId: "heart-journal",
      rotation: 9,
    },
    {
      ...baseItem(74, 338, 600, 2),
      kind: "shape",
      shape: "line",
      color: "#E7E2DA",
      fill: "transparent",
      size: 1,
    },
    {
      ...baseItem(79, 390, 310, 260),
      kind: "sticky",
      text: "A fresh page,\na fresh start.\n\nMake something\nlovely today.",
      color: "#655742",
      background: "#FFF4C7",
      fontSize: 25,
      bold: false,
      italic: false,
      align: "left",
      rotation: -3,
    },
    {
      ...baseItem(441, 443, 206, 168),
      kind: "sticker",
      stickerId: "classic-books",
      rotation: 4,
    },
    {
      ...baseItem(558, 663, 99, 105),
      kind: "sticker",
      stickerId: "pink-bow",
      rotation: -10,
    },
    {
      ...baseItem(80, 824, 570, 80),
      kind: "text",
      text: "Collect your thoughts. Follow your curiosity.\nThis little corner is yours.",
      color: "#9B9287",
      background: "transparent",
      fontSize: 20,
      bold: false,
      italic: false,
      align: "left",
    },
  ];
  return {
    version: 1,
    pages: [page],
    currentPageId: page.id,
    defaults: { color: "white", style: "plain" },
  };
}

export function patchPage(
  doc: NotebookDocument,
  update: (page: NotebookPage) => NotebookPage,
): NotebookDocument {
  let changed = false;
  const pages = doc.pages.map((p) => {
    if (p.id !== doc.currentPageId) return p;
    const next = update(p);
    changed = next !== p;
    return next;
  });
  return changed ? { ...doc, pages } : doc;
}

// Never let a malformed stored document silently replace recoverable notebook data.
export function parseNotebook(raw: unknown): NotebookDocument | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as NotebookDocument;
  if (d.version !== 1 || !Array.isArray(d.pages) || !d.pages.length)
    return null;
  const finite = (n: unknown) => typeof n === "number" && Number.isFinite(n);
  const validColor = (c: unknown) => c === "white" || c === "yellow";
  const validStyle = (s: unknown) =>
    ["plain", "lined", "grid", "dotted"].includes(String(s));
  for (const p of d.pages) {
    if (
      typeof p.id !== "string" ||
      typeof p.name !== "string" ||
      !validColor(p.color) ||
      !validStyle(p.style) ||
      !Array.isArray(p.items)
    )
      return null;
    for (const i of p.items) {
      if (
        !i ||
        typeof i.id !== "string" ||
        ![i.x, i.y, i.w, i.h, i.rotation, i.opacity].every(finite)
      )
        return null;
      if (
        i.w <= 0 ||
        i.h <= 0 ||
        !["stroke", "text", "sticky", "shape", "sticker"].includes(i.kind)
      )
        return null;
      if (
        i.kind === "stroke" &&
        (!Array.isArray(i.points) ||
          !i.points.length ||
          !i.points.every((p) => finite(p.x) && finite(p.y)) ||
          !finite(i.size) ||
          typeof i.color !== "string" ||
          !["pen", "pencil", "highlighter"].includes(i.brush))
      )
        return null;
      if (
        (i.kind === "text" || i.kind === "sticky") &&
        (typeof i.text !== "string" ||
          !finite(i.fontSize) ||
          typeof i.color !== "string" ||
          typeof i.background !== "string" ||
          !["left", "center", "right"].includes(i.align))
      )
        return null;
      if (i.kind === "sticker" && typeof i.stickerId !== "string") return null;
      if (
        i.kind === "shape" &&
        (!["rectangle", "circle", "arrow", "line", "heart", "star"].includes(
          i.shape,
        ) ||
          !finite(i.size) ||
          typeof i.color !== "string" ||
          typeof i.fill !== "string")
      )
        return null;
    }
  }
  return {
    ...d,
    currentPageId: d.pages.some((p) => p.id === d.currentPageId)
      ? d.currentPageId
      : d.pages[0].id,
    defaults: {
      color: validColor(d.defaults?.color) ? d.defaults.color : "white",
      style: validStyle(d.defaults?.style) ? d.defaults.style : "plain",
    },
  };
}

export function smoothPath(points: Point[]): string {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y} l 0.01 0`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i],
      n = points[i + 1];
    path += ` Q ${p.x} ${p.y} ${(p.x + n.x) / 2} ${(p.y + n.y) / 2}`;
  }
  const last = points[points.length - 1];
  return `${path} L ${last.x} ${last.y}`;
}

export function strokePoints(item: StrokeItem): Point[] {
  return item.points.map((p) => ({ x: p.x * item.w, y: p.y * item.h }));
}

export function makeStroke(
  points: Point[],
  color: string,
  size: number,
  brush: StrokeItem["brush"],
  opacity: number,
): StrokeItem {
  let x = points[0].x,
    y = points[0].y,
    right = x,
    bottom = y;
  for (const p of points) {
    x = Math.min(x, p.x);
    y = Math.min(y, p.y);
    right = Math.max(right, p.x);
    bottom = Math.max(bottom, p.y);
  }
  const w = Math.max(1, right - x),
    h = Math.max(1, bottom - y);
  return {
    ...baseItem(x, y, w, h),
    kind: "stroke",
    points: points.map((p) => ({ x: (p.x - x) / w, y: (p.y - y) / h })),
    color,
    size,
    brush,
    opacity,
  };
}

export function toLocal(point: Point, item: ItemBase): Point {
  const a = (-item.rotation * Math.PI) / 180,
    dx = point.x - item.x - item.w / 2,
    dy = point.y - item.y - item.h / 2;
  return {
    x: dx * Math.cos(a) - dy * Math.sin(a) + item.w / 2,
    y: dx * Math.sin(a) + dy * Math.cos(a) + item.h / 2,
  };
}
export function segmentDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    len = dx * dx + dy * dy;
  const t = len ? clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / len, 0, 1) : 0;
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
export function strokeHit(
  item: StrokeItem,
  point: Point,
  radius: number,
): boolean {
  const local = toLocal(point, item),
    points = strokePoints(item),
    r = radius + item.size / 2;
  if (points.length === 1)
    return Math.hypot(points[0].x - local.x, points[0].y - local.y) <= r;
  return points.some(
    (p, n) => n > 0 && segmentDistance(local, points[n - 1], p) <= r,
  );
}

export function shapePath(
  shape: ShapeKind,
  w: number,
  h: number,
  flipX = false,
  flipY = false,
): string {
  if (shape === "heart")
    return `M ${w / 2} ${h * 0.92} C ${-w * 0.4} ${h * 0.36} ${w * 0.08} ${-h * 0.3} ${w / 2} ${h * 0.23} C ${w * 0.92} ${-h * 0.3} ${w * 1.4} ${h * 0.36} ${w / 2} ${h * 0.92} Z`;
  if (shape === "star") {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5,
        r = i % 2 ? 0.22 : 0.48;
      return `${w / 2 + Math.cos(a) * w * r} ${h / 2 + Math.sin(a) * h * r}`;
    });
    return `M ${pts.join(" L ")} Z`;
  }
  const x1 = flipX ? w : 0,
    y1 = flipY ? h : 0,
    x2 = flipX ? 0 : w,
    y2 = flipY ? 0 : h;
  if (shape === "line") return `M ${x1} ${y1} L ${x2} ${y2}`;
  const a = Math.atan2(y2 - y1, x2 - x1),
    head = Math.min(22, Math.max(10, Math.hypot(w, h) * 0.18));
  return `M ${x1} ${y1} L ${x2} ${y2} M ${x2 - head * Math.cos(a - 0.5)} ${y2 - head * Math.sin(a - 0.5)} L ${x2} ${y2} L ${x2 - head * Math.cos(a + 0.5)} ${y2 - head * Math.sin(a + 0.5)}`;
}

export function wrapText(
  text: string,
  maxWidth: number,
  measure: (value: string) => number,
): string[] {
  return text.split("\n").flatMap((line) => {
    if (!line) return [""];
    const lines: string[] = [];
    let current = "";
    // Break long words too, so text never escapes a resized box.
    for (const char of Array.from(line)) {
      if (current && measure(current + char) > maxWidth) {
        const boundary = current.lastIndexOf(" ");
        if (boundary > 0 && char !== " ") {
          lines.push(current.slice(0, boundary));
          current = current.slice(boundary + 1) + char;
        } else {
          lines.push(current.trimEnd());
          current = char === " " ? "" : char;
        }
      } else current += char;
    }
    lines.push(current);
    return lines;
  });
}
