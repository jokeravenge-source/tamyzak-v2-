export type PodcastPdfSource = { name: string; text: string; images: string[] };

export function readPodcastPdf(
  body: Record<string, unknown>,
): PodcastPdfSource | null {
  if (
    body.pdf_name === undefined &&
    body.pdf_text === undefined &&
    body.pdf_images === undefined
  )
    return null;
  const name = typeof body.pdf_name === "string" ? body.pdf_name.trim() : "";
  const text = typeof body.pdf_text === "string" ? body.pdf_text.trim() : "";
  const images = body.pdf_images ?? [];
  if (!name || name.length > 240 || !/\.pdf$/i.test(name))
    throw new Error("اختَر ملف PDF صالحاً.");
  if (text.length > 90000)
    throw new Error("قسّم ملف PDF إلى أجزاء أصغر حتى نشرحه بالكامل.");
  if (
    !Array.isArray(images) ||
    images.length > 20 ||
    !images.every(
      (image) =>
        typeof image === "string" &&
        image.length < 2_000_000 &&
        /^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(image),
    )
  ) {
    throw new Error("صور صفحات PDF غير صالحة. أعد رفع الملف.");
  }
  if (images.reduce((size, image) => size + image.length, 0) > 18_000_000)
    throw new Error("حجم صفحات PDF كبير. قسّم الملف إلى أجزاء أصغر.");
  if (text.length < 80 && !images.length)
    throw new Error("ما كدرنا نقرأ الملف. جرّب نسخة أوضح من PDF.");
  return { name, text, images };
}
