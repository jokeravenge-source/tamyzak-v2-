export async function validateMalzamaPdf(blob: Blob) {
  const header = await blob.slice(0, 1024).text();
  if (!header.includes("%PDF-")) throw new Error("الملف المستلم ليس PDF صالحاً. حاول التحميل مرة أخرى.");
  return blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" });
}

export async function fetchMalzamaPdf(signedUrl: string) {
  const url = new URL(signedUrl);
  // Keep the signed token; remove only the attachment filename for inline reading.
  url.searchParams.delete("download");
  const response = await fetch(url.toString(), { credentials: "omit" });
  if (!response.ok) throw new Error("تعذر جلب ملف الملزمة. أعد المحاولة للحصول على رابط جديد.");
  return validateMalzamaPdf(await response.blob());
}

export function downloadMalzamaPdf(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${name.replace(/[\\/:*?"<>|\r\n]+/g, " ").trim() || "malzama"}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
