import { paperReviewImage } from "../../supabase/functions/_shared/paperReview";

export async function readPaperPhoto(file: File): Promise<string> {
  if (file.size > 20 * 1024 * 1024) throw new Error("image_too_large");
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("invalid_image"));
      image.src = objectUrl;
    });
    const { naturalWidth: width, naturalHeight: height } = image;
    if (!width || !height || width * height > 80_000_000) throw new Error("invalid_image");
    const scale = Math.min(1, 1920 / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("invalid_image");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    // The preview is the exact, orientation-corrected JPEG sent to the reviewer.
    // Re-encoding also drops camera metadata.
    const encoded = paperReviewImage(canvas.toDataURL("image/jpeg", 0.88))
      ?? paperReviewImage(canvas.toDataURL("image/jpeg", 0.72));
    if (!encoded) throw new Error("image_too_large");
    return encoded;
  } finally {
    image.onload = image.onerror = null;
    URL.revokeObjectURL(objectUrl);
  }
}
