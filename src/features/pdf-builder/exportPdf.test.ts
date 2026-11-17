import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportBooklet } from "./exportPdf";
import type { PdfSettings } from "./model";

const mocks = vi.hoisted(() => ({ render: vi.fn() }));
vi.mock("html2canvas", () => ({ default: mocks.render }));
const settings: PdfSettings = { title: "Physics booklet", student: "", subtitle: "Capacitors", language: "ar", template: "exam", fontSize: 16, answers: "none" };
const blobs: Blob[] = [], canvases: HTMLCanvasElement[] = [];
beforeEach(() => {
  blobs.length = 0; canvases.length = 0;
  const png = `data:image/png;base64,${readFileSync("public/notebook/stickers/pink-bow.png").toString("base64")}`;
  mocks.render.mockReset().mockImplementation(async () => {
    const canvas = document.createElement("canvas"); canvas.width = 1588; canvas.height = 2246;
    canvas.toDataURL = vi.fn(() => png); canvases.push(canvas); return canvas;
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } });
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn((blob: Blob) => { blobs.push(blob); return "blob:pdf-test"; }) });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
});
afterEach(() => { vi.restoreAllMocks(); });

describe("A4 PDF export", () => {
  it("creates a real multi-page PDF, reports progress and releases page canvases", async () => {
    const pages = [document.createElement("article"), document.createElement("article")], progress = vi.fn();
    await exportBooklet(pages, settings, progress);
    expect(progress.mock.calls.map(call => call[0])).toEqual([1, 2]);
    expect(mocks.render.mock.calls.map(call => call[0])).toEqual(pages);
    expect(canvases.every(canvas => canvas.width === 0 && canvas.height === 0)).toBe(true);
    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe("application/pdf");
    const pdf = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsText(blobs[0]); });
    expect(pdf.startsWith("%PDF-")).toBe(true);
    expect(pdf.match(/\/Type \/Page\b/g)).toHaveLength(2);
    const dimensions = pdf.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/)!;
    expect(Number(dimensions[1])).toBeCloseTo(595.28, 2);
    expect(Number(dimensions[2])).toBeCloseTo(841.89, 2);
  });
  it("stops without downloading when the user leaves during rendering", async () => {
    const controller = new AbortController();
    mocks.render.mockImplementationOnce(async () => { const canvas = document.createElement("canvas"); canvas.width = 100; canvas.height = 100; canvases.push(canvas); controller.abort(); return canvas; });
    await expect(exportBooklet([document.createElement("article")], settings, vi.fn(), controller.signal)).rejects.toThrow();
    expect(blobs).toHaveLength(0);
    expect(canvases[0].width).toBe(0);
  });
});
