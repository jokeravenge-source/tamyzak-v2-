import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  baseItem,
  createNotebook,
  makeStroke,
  newPage,
  parseNotebook,
  patchPage,
  segmentDistance,
  shapePath,
  smoothPath,
  strokeHit,
  strokePoints,
  wrapText,
} from "./model";
import { STICKERS } from "./stickers";

describe("stationery document and artwork", () => {
  it("ships at least 35 separate, scalable reference stickers", () => {
    expect(STICKERS.filter((s) => s.fromReference)).toHaveLength(35);
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
    for (const s of STICKERS) {
      const svg = readFileSync(resolve("public", s.src.slice(1)), "utf8");
      expect(svg).toContain("<svg");
      expect(svg).not.toContain("<script");
      expect(s.width).toBeGreaterThan(0);
      expect(s.height).toBeGreaterThan(0);
    }
  });
  it("starts with editable examples but every new page is clean", () => {
    const doc = createNotebook();
    expect(doc.pages[0].items.length).toBeGreaterThan(0);
    expect(doc.pages[0].items.every((i) => typeof i.id === "string")).toBe(
      true,
    );
    const blank = newPage("yellow", "dotted");
    expect(blank.items).toEqual([]);
    expect(blank.color).toBe("yellow");
    expect(blank.style).toBe("dotted");
  });
  it("roundtrips every item type, page settings, defaults, and active page", () => {
    const doc = createNotebook(),
      page = newPage("yellow", "grid");
    page.items = [
      makeStroke(
        [
          { x: 2, y: 4 },
          { x: 7, y: 8 },
        ],
        "#393735",
        4,
        "pen",
        0.7,
      ),
      {
        ...baseItem(3, 4, 60, 80),
        kind: "shape",
        shape: "heart",
        fill: "#F4C6CF",
        color: "#393735",
        size: 2,
      },
    ];
    doc.pages.push(page);
    doc.currentPageId = page.id;
    doc.defaults = { color: "yellow", style: "grid" };
    expect(parseNotebook(JSON.parse(JSON.stringify(doc)))).toEqual(doc);
  });
  it("rejects corrupt data rather than deleting a saved notebook", () => {
    expect(parseNotebook({ version: 1, pages: [] })).toBeNull();
    const doc = createNotebook();
    doc.pages[0].items[0].x = NaN;
    expect(parseNotebook(doc)).toBeNull();
    const missingPage = createNotebook();
    missingPage.currentPageId = "missing";
    expect(parseNotebook(missingPage)?.currentPageId).toBe(
      missingPage.pages[0].id,
    );
  });
  it("changes only the active page and preserves a no-op reference", () => {
    const doc = createNotebook();
    doc.pages.push(newPage("yellow", "lined"));
    const updated = patchPage(doc, (p) => ({ ...p, color: "yellow" }));
    expect(updated.pages[1]).toBe(doc.pages[1]);
    expect(doc.pages[0].color).toBe("white");
    expect(patchPage(doc, (p) => p)).toBe(doc);
  });
});
describe("vector drawing and erasing", () => {
  it("erases a long stroke between sparse samples", () => {
    const stroke = makeStroke(
      [
        { x: 50, y: 50 },
        { x: 450, y: 50 },
      ],
      "#393735",
      3,
      "pen",
      1,
    );
    expect(strokeHit(stroke, { x: 250, y: 54 }, 4)).toBe(true);
    expect(strokeHit(stroke, { x: 250, y: 80 }, 4)).toBe(false);
  });
  it("erases transformed, resized and rotated strokes", () => {
    const stroke = makeStroke(
      [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
      ],
      "#393735",
      3,
      "pencil",
      1,
    );
    stroke.rotation = 90;
    expect(strokeHit(stroke, { x: 150.5, y: 70 }, 5)).toBe(true);
    stroke.rotation = 0;
    stroke.w = 400;
    expect(strokeHit(stroke, { x: 450, y: 100 }, 3)).toBe(true);
  });
  it("supports dots, smooth paths, and zero-length eraser segments", () => {
    const stroke = makeStroke(
      [{ x: 21, y: 31 }],
      "#393735",
      2,
      "highlighter",
      0.5,
    );
    expect(strokePoints(stroke)).toEqual([{ x: 0, y: 0 }]);
    expect(strokeHit(stroke, { x: 21, y: 31 }, 5)).toBe(true);
    expect(
      smoothPath([
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 0 },
      ]),
    ).toContain("Q");
    expect(
      segmentDistance({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 }),
    ).toBe(5);
  });
  it("keeps arrow direction for strokes drawn backwards", () => {
    expect(shapePath("arrow", 100, 50, true, true)).toContain("M 100 50 L 0 0");
    expect(shapePath("heart", 100, 80)).toContain("C");
    expect(shapePath("star", 100, 80).match(/ L /g)).toHaveLength(9);
  });
  it("wraps paragraphs and long words without losing text", () => {
    const lines = wrapText("abcdefgh\n\nideas", 3, (s) => s.length);
    expect(lines).toEqual(["abc", "def", "gh", "", "ide", "as"]);
  });
});
