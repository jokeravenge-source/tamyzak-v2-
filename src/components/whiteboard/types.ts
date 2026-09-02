export type BoardMode = "green" | "white" | "blue";
export type Tool = "pen" | "eraser" | "shape" | "hand" | "text";
export type ShapeKind =
  | "free"
  | "line"
  | "arrow"
  | "rect"
  | "roundRect"
  | "circle"
  | "triangle";

export interface TextItem {
  id: string;
  text: string;
  /** إحداثيات عالم السبورة */
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  tool: "pen" | "eraser";
  shape: ShapeKind;
  color: string;
  size: number;
  /** الوضع الذي رُسمت فيه: يحدد أسلوب الفرشاة (طباشير / ماركر) */
  mode: BoardMode;
  points: Point[];
}

export interface Page {
  id: string;
  strokes: Stroke[];
}

export const GREEN_COLORS = [
  "#ffffff",
  "#ffd95e",
  "#ff7a85",
  "#7cc4ff",
  "#8ee39a",
  "#c9a6ff",
];

export const WHITE_COLORS = [
  "#1f2933",
  "#e5484d",
  "#2f6fed",
  "#1f9d55",
  "#8b5cf6",
  "#f08c2e",
];

export const BLUE_COLORS = [
  "#1f2933",
  "#2f6fed",
  "#e5484d",
  "#1f9d55",
  "#8b5cf6",
  "#f08c2e",
];

export const PALETTES: Record<BoardMode, string[]> = {
  green: GREEN_COLORS,
  white: WHITE_COLORS,
  blue: BLUE_COLORS,
};

export const MODE_LABELS: Record<BoardMode, string> = {
  green: "سبورة خضراء",
  white: "سبورة بيضاء",
  blue: "سبورة زرقاء",
};

export const SIZES = [2, 4, 7, 12];

