import { Children, isValidElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { CHAPTER_DIAGRAMS } from "./biologyDiagrams";
import { BIOLOGY_SKETCH_CHAPTERS, BLANK_BIOLOGY_SKETCH, getBiologySketch } from "./biologySketches";

function elements(node: ReactNode): Record<string, any>[] {
  const result: Record<string, any>[] = [];
  Children.forEach(node, (child) => {
    if (!isValidElement<Record<string, any>>(child)) return;
    if (typeof child.type === "string") result.push({ type: child.type, ...child.props, children: undefined });
    if (child.props.children) result.push(...elements(child.props.children));
  });
  return result;
}

describe("standalone biology sketch paper", () => {
  it("opens a genuinely blank paper and safely handles unknown selections", () => {
    expect(BLANK_BIOLOGY_SKETCH.art).toBeNull();
    expect(BLANK_BIOLOGY_SKETCH.parts).toEqual([]);
    expect(getBiologySketch("missing")).toBe(BLANK_BIOLOGY_SKETCH);
  });

  it("keeps scientific shapes and labels intact in the original tool", () => {
    for (const group of BIOLOGY_SKETCH_CHAPTERS) {
      group.sketches.forEach((sketch, index) => {
        const source = CHAPTER_DIAGRAMS[group.chapter][index];
        expect(sketch.id).not.toBe(source.id);
        expect(sketch.parts).toBe(source.parts);
        expect(sketch.title).toBe(source.title);
        const reference = elements(source.art);
        const outline = elements(sketch.art);
        expect(outline).toHaveLength(reference.length);
        const styling = new Set(["fill", "stroke", "strokeWidth", "opacity"]);
        reference.forEach((shape, i) => {
          for (const [key, value] of Object.entries(shape)) {
            if (!styling.has(key)) expect(outline[i][key]).toEqual(value);
          }
        });
      });
    }
  });

  it("gives every sketch its own storage scope and an ink-on-paper background", () => {
    const all = BIOLOGY_SKETCH_CHAPTERS.flatMap((group) => group.sketches);
    expect(new Set(all.map((sketch) => sketch.id)).size).toBe(all.length);
    for (const sketch of all) {
      expect(getBiologySketch(sketch.id)).toBe(sketch);
      expect(sketch.id).toMatch(/^sketchbook:/);
      for (const shape of elements(sketch.art)) {
        if (["path", "circle", "ellipse", "rect", "polygon", "polyline", "line"].includes(shape.type)) {
          expect(["none", "#ffffff", "#475569"]).toContain(shape.fill);
        }
      }
    }
  });
});
