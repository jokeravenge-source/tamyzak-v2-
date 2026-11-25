import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

type ExtractOptions = {
  complete?: boolean;
  maxPages?: number;
  maxChars?: number;
  textOnly?: boolean;
};

export type ExtractedPdfPage = { page: number; text: string };

type StudyMaterial = {
  text: string;
  pageImages?: string[];
  fileData?: string;
  fileName?: string;
  pdfText?: { pages: ExtractedPdfPage[]; inspectedPages: number; emptyPages: number; totalPages: number; truncated: boolean };
};

const DEFAULT_MAX_CHARS = 180000;
const DEFAULT_MAX_PDF_PAGES = 450;
const PDF_FRONT_PAGES = 25;
const PDF_END_PAGES = 10;
const PDF_IMAGE_PAGES = 20;
const MAX_INLINE_PDF_BYTES = 8 * 1024 * 1024;

let pdfWorkerReady = false;

const PDFJS_VERSION = "5.7.284";
const PDFJS_CDN_BASE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}`;
const PDF_CMAP_URL = `${PDFJS_CDN_BASE}/cmaps/`;
const PDF_STANDARD_FONTS_URL = `${PDFJS_CDN_BASE}/standard_fonts/`;

const isPdfFile = (file: File) =>
  file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";

const isDocxFile = (file: File) => file.name.toLowerCase().endsWith(".docx");

const isTextFile = (file: File) =>
  file.name.toLowerCase().endsWith(".txt") || file.type.startsWith("text/");

const configurePdfWorker = () => {
  if (pdfWorkerReady || typeof window === "undefined") return;
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  pdfWorkerReady = true;
};

const waitForBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Unable to read PDF"));
    reader.onerror = () => reject(reader.error || new Error("Unable to read PDF"));
    reader.readAsDataURL(file);
  });

const normalizePageText = (text: string) => text.replace(/\s+/g, " ").trim();

async function openPdfDocument(file: File) {
  configurePdfWorker();
  const objectUrl = typeof URL !== "undefined" && URL.createObjectURL ? URL.createObjectURL(file) : null;
  const task = pdfjs.getDocument({
    ...(objectUrl ? { url: objectUrl } : { data: new Uint8Array(await file.arrayBuffer()) }),
    cMapUrl: PDF_CMAP_URL,
    cMapPacked: true,
    standardFontDataUrl: PDF_STANDARD_FONTS_URL,
    useSystemFonts: true,
    useWorkerFetch: false,
    disableFontFace: false,
  });
  let closed = false;
  const close = async () => {
    if (closed) return;
    closed = true;
    try { await task.destroy(); }
    finally { if (objectUrl) URL.revokeObjectURL(objectUrl); }
  };
  try { return { pdf: await task.promise, close }; }
  catch (error) {
    await close();
    throw error;
  }
}

type PdfDocument = Awaited<ReturnType<typeof pdfjs.getDocument>["promise"]>;

async function readPdfPageText(pdf: PdfDocument, pageNumber: number) {
  const page = await pdf.getPage(pageNumber);
  try {
    const content = await page.getTextContent({ includeMarkedContent: false });
    return normalizePageText(content.items.map(item => "str" in item ? item.str : "").filter(Boolean).join(" "));
  } finally {
    page.cleanup();
  }
}

export type PdfTextPages = {
  name: string;
  totalPages: number;
  readPage: (number: number) => Promise<ExtractedPdfPage>;
  close: () => Promise<void>;
};

/** Open a chapter locally and extract only the requested file page. */
export async function openPdfTextPages(input: File, maxBytes: number, maxChars: number): Promise<PdfTextPages> {
  if (!isPdfFile(input)) throw new Error("unsupported_file");
  if (input.size > maxBytes) throw new Error("file_too_large");
  const file = await materializeFile(input);
  if (file.size > maxBytes) throw new Error("file_too_large");
  const { pdf, close } = await openPdfDocument(file);
  return {
    name: file.name,
    totalPages: pdf.numPages,
    close,
    async readPage(page) {
      if (!Number.isInteger(page) || page < 1 || page > pdf.numPages) throw new Error("invalid_pdf_page");
      return { page, text: (await readPdfPageText(pdf, page)).slice(0, maxChars) };
    },
  };
}

const buildPagePlan = (totalPages: number, maxPages: number) => {
  if (totalPages <= maxPages) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = new Set<number>();
  const startCount = Math.min(PDF_FRONT_PAGES, totalPages, maxPages);
  for (let page = 1; page <= startCount; page++) pages.add(page);

  const endCount = Math.min(PDF_END_PAGES, totalPages - pages.size, maxPages - pages.size);
  for (let page = totalPages - endCount + 1; page <= totalPages; page++) pages.add(page);

  const remainingSlots = maxPages - pages.size;
  const middleStart = startCount + 1;
  const middleEnd = totalPages - endCount;
  const middlePages = Math.max(0, middleEnd - middleStart + 1);

  for (let i = 0; i < remainingSlots && middlePages > 0; i++) {
    const offset = Math.floor((i * (middlePages - 1)) / Math.max(1, remainingSlots - 1));
    pages.add(middleStart + offset);
  }

  return Array.from(pages).sort((a, b) => a - b).slice(0, maxPages);
};

const buildImagePagePlan = (totalPages: number) => buildPagePlan(totalPages, Math.min(totalPages, PDF_IMAGE_PAGES));

async function renderPdfPageImage(pdf: Awaited<ReturnType<typeof pdfjs.getDocument>["promise"]>, pageNumber: number) {
  if (typeof document === "undefined") return null;

  const page = await pdf.getPage(pageNumber);
  try {
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(1.1, 760 / Math.max(baseViewport.width, 1));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return null;

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({ canvas, canvasContext: context, viewport } as Parameters<typeof page.render>[0]).promise;
    const image = canvas.toDataURL("image/jpeg", 0.55);
    canvas.width = 0;
    canvas.height = 0;
    return image;
  } finally {
    page.cleanup();
  }
}

async function extractPdfMaterial(file: File, options: ExtractOptions = {}): Promise<StudyMaterial> {
  const maxPagesLimit = options.maxPages ?? DEFAULT_MAX_PDF_PAGES;
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  const { pdf, close } = await openPdfDocument(file);
  try {
    if (options.complete && pdf.numPages > maxPagesLimit) {
      throw new Error(`قسّم الملف إلى أجزاء لا تتجاوز ${maxPagesLimit} صفحة للجلسة الواحدة.`);
    }
    const pagePlan = buildPagePlan(pdf.numPages, Math.min(pdf.numPages, maxPagesLimit));
    const chunks: string[] = [];
    const pageImages: string[] = [];
    const pages: ExtractedPdfPage[] = [];
    let inspectedPages = 0;
    let emptyPages = 0;
    let truncated = pagePlan.length < pdf.numPages;
    let totalLength = 0;

    for (let index = 0; index < pagePlan.length; index++) {
      const pageNumber = pagePlan[index];
      try {
        const pageText = await readPdfPageText(pdf, pageNumber);
        inspectedPages++;

        if (!pageText) emptyPages++;
        else {
          const pageLabel = `[Page ${pageNumber}]\n`;
          const labelledText = pageLabel + pageText;
          if (options.complete && totalLength + labelledText.length > maxChars) {
            throw new Error("محتوى الملف طويل. قسّمه إلى أجزاء أصغر حتى نشرحه بالكامل.");
          }
          const remaining = maxChars - totalLength;
          const included = labelledText.slice(0, remaining);
          chunks.push(included);
          if (options.textOnly) {
            const text = included.slice(pageLabel.length).trim();
            if (text) pages.push({ page: pageNumber, text });
            truncated ||= included.length < labelledText.length;
          }
          totalLength += Math.min(labelledText.length, remaining);
        }
      } catch (error) {
        if (options.complete) throw error;
        console.warn(`Skipped unreadable PDF page ${pageNumber}`, error);
      }

      if (totalLength >= maxChars && !options.complete) {
        truncated ||= index < pagePlan.length - 1;
        break;
      }
      if (index % 5 === 4) {
        pdf.cleanup();
        await waitForBrowser();
      }
    }

    if (options.textOnly) {
      return {
        text: chunks.join("\n\n").slice(0, maxChars),
        fileName: file.name,
        pdfText: { pages, inspectedPages, emptyPages, totalPages: pdf.numPages, truncated },
      };
    }

    const imagePages = buildImagePagePlan(pdf.numPages);
    for (let index = 0; index < imagePages.length; index++) {
      try {
        const image = await renderPdfPageImage(pdf, imagePages[index]);
        if (!image && options.complete) throw new Error("تعذّر قراءة إحدى صفحات الملف. جرّب PDF أوضح.");
        if (image) pageImages.push(image);
      } catch (error) {
        if (options.complete) throw error;
        console.warn(`Skipped PDF page image ${imagePages[index]}`, error);
      }
      if (index % 3 === 2) await waitForBrowser();
    }

    const fileData = !options.complete && file.size <= MAX_INLINE_PDF_BYTES ? await fileToDataUrl(file) : undefined;
    return {
      text: chunks.join("\n\n").slice(0, maxChars),
      pageImages,
      fileData,
      fileName: file.name,
    };
  } finally {
    await close();
  }
}

/**
 * Some pickers (Android/iOS cloud providers, Drive, PWA share targets) hand back a
 * File whose `size` is 0 until the bytes are actually pulled. Re-materialize it into
 * a real in-memory File so size/reading work everywhere.
 */
export async function materializeFile(file: File): Promise<File> {
  if (file.size > 0) return file;
  const buffer = await file.arrayBuffer();
  if (!buffer.byteLength) throw new Error("empty-file");
  return new File([buffer], file.name, { type: file.type || "application/octet-stream" });
}

export async function extractStudyMaterial(input: File, options: ExtractOptions = {}): Promise<StudyMaterial> {
  const file = await materializeFile(input);

  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;

  if (isPdfFile(file)) return await extractPdfMaterial(file, options);

  if (isTextFile(file)) return { text: (await file.slice(0, maxChars * 4).text()).slice(0, maxChars) };

  if (isDocxFile(file)) {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return { text: value.slice(0, maxChars) };
  }

  throw new Error("unsupported");
}

export async function extractTextFromFile(file: File, options: ExtractOptions = {}) {
  const material = await extractStudyMaterial(file, options);
  return material.text;
}
