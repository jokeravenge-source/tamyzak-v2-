import type { ExtractedPdfPage } from "./fileText";
import type { BoardInput } from "../../supabase/functions/_shared/whiteboard";

export type AssistantFile = { name: string; text: string; pages?: ExtractedPdfPage[] };

export function attachmentForBoard(file: AssistantFile): NonNullable<BoardInput["attachment"]> {
  return file.pages ? { name: file.name, pages: file.pages } : { name: file.name, text: file.text };
}

export async function readAssistantFile(input: File): Promise<AssistantFile> {
  const maxBytes = 100 * 1024 * 1024;
  const maxChars = 80_000;
  if (input.size > maxBytes) throw new Error("file_too_large");
  if (/\.pdf$/i.test(input.name) || input.type === "application/pdf") {
    const { extractStudyMaterial, materializeFile } = await import("./fileText");
    const file = await materializeFile(input);
    if (file.size > maxBytes) throw new Error("file_too_large");
    const { pdfText } = await extractStudyMaterial(file, { textOnly: true, maxChars });
    if (!pdfText?.pages.length) return { name: file.name, text: "", pages: [] };

    const extracted = pdfText.pages.map(({ page, text }) =>
      "\n[PDF page " + page + " — file page, not a verified printed textbook page]\n" + text + "\n"
    ).join("");
    const summary = "[PDF extracted text: " + pdfText.inspectedPages + " of " + pdfText.totalPages
      + " pages inspected; " + pdfText.emptyPages + " inspected pages had no extractable text. Images are not included.";
    const status = summary + (pdfText.truncated || summary.length + 2 + extracted.length > maxChars
      ? " Text is limited; some content is omitted.]\n"
      : "]\n");
    return { name: file.name, text: status + extracted.slice(0, maxChars - status.length), pages: pdfText.pages };
  }
  if (!/\.(txt|md)$/i.test(input.name)) throw new Error("unsupported_file");
  const text = await input.slice(0, maxChars * 4).text();
  if (text.length <= maxChars) return { name: input.name, text };
  const status = "[Attached text truncated: only the beginning of this file is included.]\n";
  return { name: input.name, text: status + text.slice(0, maxChars - status.length) };
}
