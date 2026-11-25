import { beforeEach, describe, expect, it, vi } from "vitest";
import { readAssistantFile } from "./mutamayizFile";
const pdf = vi.hoisted(() => ({ pages: [] as string[], getPage: vi.fn(), destroy: vi.fn(), cleanup: vi.fn(), open: vi.fn() }));
vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({ GlobalWorkerOptions: {}, getDocument: pdf.open }));
vi.mock("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url", () => ({ default: "worker.js" }));
beforeEach(() => {
  vi.clearAllMocks(); pdf.pages = [];
  pdf.getPage.mockImplementation(async (i: number) => ({ getTextContent: async () => ({ items: [{ str: pdf.pages[i - 1] }] }), cleanup: pdf.cleanup }));
  pdf.open.mockImplementation(() => ({ destroy: pdf.destroy, promise: Promise.resolve({ numPages: pdf.pages.length, getPage: pdf.getPage }) }));
});
const file = (name = "lesson.pdf", size = 10) => ({ name, size, type: "application/pdf", arrayBuffer: async () => new ArrayBuffer(0) }) as File;
describe("assistant attachment extraction", () => {
  it("does not treat PDF page markers as text for scanned or empty documents", async () => {
    pdf.pages = ["", "   "];
    expect(await readAssistantFile(file())).toEqual({ name: "lesson.pdf", text: "", pages: [] }); expect(pdf.destroy).toHaveBeenCalledOnce(); expect(pdf.cleanup).toHaveBeenCalledTimes(2);
  });
  it("preserves real page locations and reports unreadable pages without inventing their contents", async () => {
    pdf.pages = ["", "Solid geometry: a plane intersects a sphere."];
    const { text, pages } = await readAssistantFile(file());
    expect(text).toContain("PDF page 2"); expect(text).not.toContain("PDF page 1 —");
    expect(text).toContain("1 inspected pages had no extractable text"); expect(text).toContain("Solid geometry");
    expect(pages).toEqual([{ page: 2, text: "Solid geometry: a plane intersects a sphere." }]);
  });
  it("bounds long PDF text and explicitly marks omitted content", async () => {
    pdf.pages = ["x".repeat(90_000), "later page"];
    const { text } = await readAssistantFile(file());
    expect(text.length).toBeLessThanOrEqual(80_000); expect(text).toContain("some content is omitted"); expect(pdf.getPage).toHaveBeenCalledTimes(1);
  });
  it("rejects files over 100 MiB before attempting to parse them", async () => {
    await expect(readAssistantFile(file("lesson.pdf", 100 * 1024 * 1024 + 1))).rejects.toThrow("file_too_large"); expect(pdf.open).not.toHaveBeenCalled();
  });
});
