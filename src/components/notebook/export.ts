import {
  NotebookPage,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PAPER_COLORS,
  shapePath,
  smoothPath,
  strokePoints,
} from "./model";
import { TEXT_FONT, textLines } from "./Paper";
import { stickerById } from "./stickers";

const images = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string): Promise<HTMLImageElement> {
  if (!images.has(src))
    images.set(
      src,
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => {
          images.delete(src);
          reject(
            new Error("A sticker could not be exported. Please try again."),
          );
        };
        image.src = src;
      }),
    );
  return images.get(src)!;
}
export async function renderPage(
  page: NotebookPage,
  scale = 2,
): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH * scale;
  canvas.height = PAGE_HEIGHT * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser does not support image export.");
  ctx.scale(scale, scale);
  ctx.fillStyle = PAPER_COLORS[page.color];
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  if (page.style !== "plain") {
    ctx.strokeStyle = "#D2CCC2";
    ctx.fillStyle = "#C9C0B3";
    ctx.lineWidth = 0.7;
    ctx.save();
    ctx.beginPath();
    ctx.rect(40, 46, PAGE_WIDTH - 80, PAGE_HEIGHT - 92);
    ctx.clip();
    if (page.style === "dotted") {
      for (let x = 12; x < PAGE_WIDTH - 40; x += 24)
        for (let y = 12; y < PAGE_HEIGHT - 46; y += 24) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
    } else {
      ctx.beginPath();
      for (
        let y = page.style === "lined" ? 27.5 : 0;
        y < PAGE_HEIGHT - 46;
        y += 28
      ) {
        ctx.moveTo(40, y);
        ctx.lineTo(PAGE_WIDTH - 40, y);
      }
      if (page.style === "grid")
        for (let x = 0; x < PAGE_WIDTH - 40; x += 28) {
          ctx.moveTo(x, 46);
          ctx.lineTo(x, PAGE_HEIGHT - 46);
        }
      ctx.stroke();
    }
    ctx.restore();
  }
  for (const item of page.items) {
    ctx.save();
    ctx.translate(item.x + item.w / 2, item.y + item.h / 2);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.translate(-item.w / 2, -item.h / 2);
    ctx.globalAlpha = item.opacity;
    if (item.kind === "sticker") {
      const sticker = stickerById.get(item.stickerId);
      if (!sticker)
        throw new Error("An unknown sticker could not be exported.");
      const image = await loadImage(sticker.src),
        ratio = Math.min(item.w / sticker.width, item.h / sticker.height),
        w = sticker.width * ratio,
        h = sticker.height * ratio;
      ctx.drawImage(image, (item.w - w) / 2, (item.h - h) / 2, w, h);
    } else if (item.kind === "stroke") {
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha *=
        item.brush === "highlighter"
          ? 0.34
          : item.brush === "pencil"
            ? 0.66
            : 1;
      ctx.stroke(new Path2D(smoothPath(strokePoints(item))));
    } else if (item.kind === "shape") {
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = item.fill === "transparent" ? "rgba(0,0,0,0)" : item.fill;
      if (item.shape === "rectangle") {
        ctx.beginPath();
        ctx.roundRect(0, 0, item.w, item.h, 5);
        if (item.fill !== "transparent") ctx.fill();
        ctx.stroke();
      } else if (item.shape === "circle") {
        ctx.beginPath();
        ctx.ellipse(
          item.w / 2,
          item.h / 2,
          item.w / 2,
          item.h / 2,
          0,
          0,
          2 * Math.PI,
        );
        if (item.fill !== "transparent") ctx.fill();
        ctx.stroke();
      } else {
        const path = new Path2D(
          shapePath(item.shape, item.w, item.h, item.flipX, item.flipY),
        );
        if (
          (item.shape === "heart" || item.shape === "star") &&
          item.fill !== "transparent"
        )
          ctx.fill(path);
        ctx.stroke(path);
      }
    } else {
      const pad = item.kind === "sticky" ? 24 : 4;
      if (item.kind === "sticky") {
        ctx.shadowColor = "#665E4D20";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 5;
        ctx.fillStyle = item.background;
        ctx.fillRect(0, 0, item.w, item.h);
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#FFFFFF20";
        ctx.fillRect(0, 0, item.w, 13);
        ctx.fillStyle = "#9E886420";
        ctx.beginPath();
        ctx.moveTo(item.w - 20, item.h);
        ctx.lineTo(item.w, item.h - 20);
        ctx.lineTo(item.w, item.h);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.rect(
        pad,
        pad,
        Math.max(1, item.w - pad * 2),
        Math.max(1, item.h - pad * 2),
      );
      ctx.clip();
      ctx.fillStyle = item.color;
      ctx.font = `${item.italic ? "italic " : ""}${item.bold ? "bold " : ""}${item.fontSize}px ${TEXT_FONT}`;
      ctx.textAlign = item.align;
      ctx.textBaseline = "alphabetic";
      const x =
        item.align === "center"
          ? item.w / 2
          : item.align === "right"
            ? item.w - pad
            : pad;
      textLines(item).forEach((line, n) =>
        ctx.fillText(line, x, pad + item.fontSize + n * item.fontSize * 1.4),
      );
    }
    ctx.restore();
  }
  return canvas;
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
export async function exportPNG(page: NotebookPage) {
  const canvas = await renderPage(page);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("PNG export failed.")),
      "image/png",
    ),
  );
  downloadBlob(
    blob,
    `${page.name.replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "notebook-page"}.png`,
  );
}
export async function exportPDF(
  pages: NotebookPage[],
  progress: (n: number) => void,
) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [PAGE_WIDTH, PAGE_HEIGHT],
    compress: true,
  });
  for (let i = 0; i < pages.length; i++) {
    if (i) pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT], "portrait");
    const canvas = await renderPage(pages[i], 1.6);
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.94),
      "JPEG",
      0,
      0,
      PAGE_WIDTH,
      PAGE_HEIGHT,
    );
    canvas.width = 0;
    canvas.height = 0;
    progress(i + 1);
  }
  downloadBlob(pdf.output("blob"), "My Notebook.pdf");
}
