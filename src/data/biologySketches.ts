import { Children, Fragment, cloneElement, createElement as h, isValidElement, type ReactNode } from "react";
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

function flattenArtwork(node: ReactNode): ReactNode[] {
  const result: ReactNode[] = [];
  Children.forEach(node, (child) => {
    if (isValidElement<Record<string, any>>(child) && child.type === Fragment) {
      result.push(...flattenArtwork(child.props.children));
    } else if (child !== null && child !== undefined && child !== false) {
      result.push(child);
    }
  });
  return result;
}

function sketchSectionCount(labelCount: number) {
  return labelCount >= 11 ? 6 : labelCount >= 9 ? 5 : 4;
}

function splitSketch(sketch: DiagramDef): DiagramDef[] {
  if (!sketch.art) return [sketch];
  const shapes = flattenArtwork(sketch.art);
  const sectionCount = sketchSectionCount(sketch.parts.length);
  let cursor = 0;

  return Array.from({ length: sectionCount }, (_, sectionIndex) => {
    const remainingShapes = shapes.length - cursor;
    const remainingSections = sectionCount - sectionIndex;
    const sectionSize = Math.max(0, Math.ceil(remainingShapes / remainingSections));
    const focusedShapes = shapes.slice(cursor, cursor + sectionSize);
    cursor += sectionSize;
    const number = sectionIndex + 1;

    return {
      ...sketch,
      id: `${sketch.id}:part-${number}`,
      title: {
        ar: `${sketch.title.ar} — الجزء ${number} من ${sectionCount}`,
        en: `${sketch.title.en} — Part ${number} of ${sectionCount}`,
      },
      art: h(Fragment, null,
        h("g", { opacity: 0.14, key: "context" }, shapes),
        h("g", { key: "focus" }, focusedShapes),
      ),
    };
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

export function getBiologySketchSections(id: string): DiagramDef[] {
  return splitSketch(getBiologySketch(id));
}
