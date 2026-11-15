import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  baseItem,
  createNotebook,
  newPage,
  PAGE_HEIGHT,
  PAGE_WIDTH,
} from "./model";
import { exportPDF, exportPNG, renderPage } from "./export";

let ctx: CanvasRenderingContext2D;
const blobs: Blob[] = [];
const jpegFallback = `data:image/png;base64,${readFileSync("public/notebook/stickers/pink-bow.png").toString("base64")}`;
beforeEach(() => {
  blobs.length = 0;
  const noop = () => {};
  ctx = Object.fromEntries(
    [
      "scale",
      "fillRect",
      "save",
      "beginPath",
      "rect",
      "clip",
      "arc",
      "fill",
      "restore",
      "moveTo",
      "lineTo",
      "stroke",
      "translate",
      "rotate",
      "drawImage",
      "roundRect",
      "ellipse",
      "fillText",
    ].map((k) => [k, vi.fn(noop)]),
  ) as unknown as CanvasRenderingContext2D;
  ctx.measureText = vi.fn(
    (text) => ({ width: text.length * 7 }) as TextMetrics,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    jpegFallback,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (callback) => callback(new Blob(["PNG test"], { type: "image/png" })),
  );
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(noop);
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn((blob) => {
      blobs.push(blob);
      return "blob:notebook-export";
    }),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
  vi.stubGlobal(
    "Path2D",
    class {
      constructor(public d: string) {}
    },
  );
  vi.stubGlobal(
    "Image",
    class {
      onload?: () => void;
      onerror?: () => void;
      set src(_src: string) {
        queueMicrotask(() => this.onload?.());
      }
    },
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("page export rendering", () => {
  it("renders full-resolution paper, actual sticker assets, notes and text without editor controls", async () => {
    const page = createNotebook().pages[0],
      canvas = await renderPage(page);
    expect(canvas.width).toBe(PAGE_WIDTH * 2);
    expect(canvas.height).toBe(PAGE_HEIGHT * 2);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    expect(ctx.drawImage).toHaveBeenCalledTimes(3);
    expect(ctx.fillText).toHaveBeenCalledWith("A little space", 4, 55);
    expect(ctx.fillText).not.toHaveBeenCalledWith(
      "Duplicate item",
      expect.anything(),
      expect.anything(),
    );
  });
  it.each(["plain", "lined", "grid", "dotted"] as const)(
    "exports %s paper without requiring a viewport",
    async (style) => {
      const p = newPage("yellow", style);
      await renderPage(p, 1);
      expect(ctx.fillStyle).toBe(style === "plain" ? "#FFF4C7" : "#C9C0B3");
      if (style === "plain") expect(ctx.stroke).not.toHaveBeenCalled();
      if (style === "dotted") expect(ctx.arc).toHaveBeenCalled();
    },
  );
  it("renders all six shapes with their transforms and fills", async () => {
    const p = newPage();
    p.items = (
      ["rectangle", "circle", "arrow", "line", "heart", "star"] as const
    ).map((shape, n) => ({
      ...baseItem(30 + n * 100, 100, 70, 80),
      kind: "shape",
      shape,
      color: "#393735",
      fill: "#F4C6CF",
      size: 3,
      rotation: 15,
    }));
    await renderPage(p);
    expect(ctx.rotate).toHaveBeenCalledTimes(6);
    expect(ctx.roundRect).toHaveBeenCalled();
    expect(ctx.ellipse).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalledTimes(6);
  });
  it("downloads a PNG blob for the complete current page", async () => {
    await exportPNG(newPage("white", "plain", "My ideas"));
    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe("image/png");
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
  });
  it("creates a real multi-page PDF with jsPDF", async () => {
    const progress = vi.fn();
    await exportPDF([newPage(), newPage("yellow", "grid")], progress);
    expect(progress.mock.calls.map((c) => c[0])).toEqual([1, 2]);
    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe("application/pdf");
    const pdf = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsText(blobs[0]);
    });
    expect(pdf.startsWith("%PDF-")).toBe(true);
    expect(pdf.match(/\/Type \/Page\b/g)).toHaveLength(2);
  });
});
