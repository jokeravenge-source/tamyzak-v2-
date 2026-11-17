import type { PdfSettings } from "./model";

export async function exportBooklet(pages: readonly HTMLElement[], settings: PdfSettings, progress: (page: number) => void, signal?: AbortSignal) {
  if (!pages.length) throw new Error("no_pages");
  const checkCancelled = () => { if (signal?.aborted) throw new DOMException("Export cancelled", "AbortError"); };
  await document.fonts?.ready;
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const pdf = new jsPDF({ format: "a4", unit: "mm", compress: true });
  pdf.setProperties({ title: settings.title, author: "Tamayzak", subject: settings.subtitle });
  for (let index = 0; index < pages.length; index++) {
    checkCancelled();
    // Render one A4 page at a time, keeping mobile memory bounded.
    const canvas = await html2canvas(pages[index], { scale: 2, backgroundColor: "#ffffff", useCORS: true,
      onclone: document => document.querySelectorAll<HTMLElement>(".pdf-measure").forEach(host => { host.style.visibility = "visible"; host.style.left = "0"; host.style.right = "auto"; }) });
    if (signal?.aborted) { canvas.width = 0; canvas.height = 0; checkCancelled(); }
    if (index) pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/jpeg", .95), "JPEG", 0, 0, 210, 297, undefined, "FAST");
    canvas.width = 0; canvas.height = 0; progress(index + 1);
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  }
  const filename = settings.title.replace(/[\\/:*?"<>|\r\n]+/g, " ").trim().slice(0, 100) || "Tamayzak-Study-Booklet";
  checkCancelled();
  const url = URL.createObjectURL(pdf.output("blob"));
  const link = document.createElement("a");
  link.href = url; link.download = `${filename}.pdf`;
  document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
