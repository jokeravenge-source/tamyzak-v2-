export async function readAssistantFile(file: File): Promise<string> {
  if (file.size > 100 * 1024 * 1024) throw new Error("file_too_large");
  const limit = 80_000;
  if (file.name.toLowerCase().endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    let text = "", inspectedPages = 0, emptyPages = 0;
    try {
      for (let i = 1; i <= doc.numPages && text.length < limit; i++) {
        const page = await doc.getPage(i);
        try {
          const content = await page.getTextContent();
          const pageText = content.items.map(item => "str" in item ? item.str : "").join(" ").trim();
          inspectedPages++;
          // Page labels alone must never make a scanned/empty PDF look readable.
          if (!pageText) { emptyPages++; continue; }
          text += `\n[PDF page ${i} — file page, not a verified printed textbook page]\n${pageText}\n`;
        } finally { page.cleanup(); }
      }
      if (!text.trim()) return "";
      const summary = `[PDF extracted text: ${inspectedPages} of ${doc.numPages} pages inspected; ${emptyPages} inspected pages had no extractable text. Images are not included.`;
      const truncated = inspectedPages < doc.numPages || summary.length + 2 + text.length > limit;
      const status = summary + (truncated ? " Text is limited; some content is omitted.]\n" : "]\n");
      return status + text.slice(0, limit - status.length);
    } finally { await doc.destroy(); }
  }
  if (!/\.(txt|md)$/i.test(file.name)) throw new Error("unsupported_file");
  const text = await file.text();
  if (text.length <= limit) return text;
  const status = "[Attached text truncated: only the beginning of this file is included.]\n";
  return status + text.slice(0, limit - status.length);
}
