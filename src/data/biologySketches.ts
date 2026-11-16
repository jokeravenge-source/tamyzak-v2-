import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import type { DiagramDef } from "@/components/LabeledDiagram";
import { CHAPTER_DIAGRAMS } from "@/data/biologyDiagrams";

// Keep the existing scientific geometry; only change its presentation to ink on paper.
const shapes = new Set(["path", "circle", "ellipse", "rect", "polygon", "polyline", "line"]);
function outline(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement<Record<string, any>>(child)) return child;
    const props = child.props;
    const next: Record<string, any> = {};
    if (typeof child.type === "string" && shapes.has(child.type)) {
      const dot = child.type === "circle" && Number(props.r) < 0.7;
      next.fill = props.fill === "none" || child.type === "line" ? "none" : dot ? "#475569" : "#ffffff";
      next.stroke = props.stroke === "none" && dot ? "none" : "#475569";
      next.strokeWidth = props.strokeWidth ?? 0.3;
      next.opacity = Math.max(Number(props.opacity ?? 1), 0.65);
    } else if (child.type === "text") {
      next.fill = "#475569";
    }
    if (props.children !== undefined) next.children = outline(props.children);
    return cloneElement(child, next);
  });
}

export const BLANK_BIOLOGY_SKETCH: DiagramDef = {
  id: "sketchbook:blank",
  title: { ar: "ورقة سكتش فارغة", en: "Blank sketch paper" },
  aspect: "1/1",
  parts: [],
  art: null,
};

export const BIOLOGY_SKETCH_CHAPTERS = Object.entries(CHAPTER_DIAGRAMS)
  .filter(([, diagrams]) => diagrams.length > 0)
  .map(([chapter, diagrams]) => ({
    chapter: Number(chapter),
    sketches: diagrams.map((diagram) => ({
      ...diagram,
      id: "sketchbook:" + diagram.id,
      art: outline(diagram.art),
    })),
  }));

export function getBiologySketch(id: string): DiagramDef {
  return BIOLOGY_SKETCH_CHAPTERS.flatMap((group) => group.sketches)
    .find((sketch) => sketch.id === id) ?? BLANK_BIOLOGY_SKETCH;
}
