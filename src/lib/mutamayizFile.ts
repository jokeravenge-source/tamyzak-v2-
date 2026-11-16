export async function readAssistantFile(file: File): Promise<string> {
  if (file.size > 15 * 1024 * 1024) throw new Error("file_too_large");
  const limit = 80_000;
  if (file.name.toLowerCase().endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    let text = "";
    try {
      for (let i = 1; i <= doc.numPages && text.length < limit; i++) {
        const page = await doc.getPage(i);
        try { const content = await page.getTextContent(); text += `\n[PDF page ${i} — file page, not a verified printed textbook page]\n` + content.items.map(item => "str" in item ? item.str : "").join(" ") + "\n"; }
        finally { page.cleanup(); }
      }
    } finally { await doc.destroy(); }
    return text.slice(0, limit);
  }
  if (!/\.(txt|md)$/i.test(file.name)) throw new Error("unsupported_file");
  return (await file.text()).slice(0, limit);
}
