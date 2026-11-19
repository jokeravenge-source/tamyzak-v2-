import { beforeEach, afterEach, expect, it, vi } from "vitest";
const pdf = vi.hoisted(() => ({
  numPages: 3,
  destroy: vi.fn(),
  getPage: vi.fn(),
  cleanup: vi.fn(),
}));
vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  GlobalWorkerOptions: {},
  getDocument: () => ({ promise: Promise.resolve(pdf), destroy: pdf.destroy }),
}));
import { extractStudyMaterial } from "./fileText";
const file = {
  name: "source.pdf",
  type: "application/pdf",
  size: 10,
  arrayBuffer: async () => new ArrayBuffer(10),
} as File;
beforeEach(() => {
  pdf.numPages = 3;
  pdf.getPage.mockImplementation(async (page: number) => ({
    getTextContent: async () => ({
      items: page === 2 ? [] : [{ str: `Scientific source page ${page}` }],
    }),
    getViewport: () => ({ width: 760, height: 1000 }),
    cleanup: vi.fn(),
    render: () => ({ promise: Promise.resolve() }),
  }));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    {} as never,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/jpeg;base64,YQ==",
  );
});
afterEach(() => vi.restoreAllMocks());
it("includes every source page as an image, including scanned pages, without carrying an unused PDF payload", async () => {
  const material = await extractStudyMaterial(file, {
    complete: true,
    maxPages: 20,
    maxChars: 90000,
  });
  expect(material.text).toContain("Scientific source page 3");
  expect(material.pageImages).toHaveLength(3);
  expect(material.fileData).toBeUndefined();
});
it("rejects oversized page counts and text rather than sampling or truncating the source", async () => {
  pdf.numPages = 21;
  await expect(
    extractStudyMaterial(file, { complete: true, maxPages: 20 }),
  ).rejects.toThrow("20");
  pdf.numPages = 1;
  await expect(
    extractStudyMaterial(file, { complete: true, maxChars: 5 }),
  ).rejects.toThrow("طويل");
});
