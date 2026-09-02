import type { Point, Stroke } from "./types";

/** نقاط ناعمة عبر منحنيات quadratic بين منتصفات النقاط */
function tracePath(ctx: CanvasRenderingContext2D, pts: Point[]) {
  const first = pts[0];
  if (!first) return;
  ctx.beginPath();
  if (pts.length === 1) {
    ctx.moveTo(first.x, first.y);
    ctx.lineTo(first.x + 0.01, first.y);
    return;
  }
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i]!;
    const n = pts[i + 1]!;
    ctx.quadraticCurveTo(p.x, p.y, (p.x + n.x) / 2, (p.y + n.y) / 2);
  }
  const last = pts[pts.length - 1]!;
  ctx.lineTo(last.x, last.y);
}

/** أشكال هندسية نظيفة من نقطة البداية إلى نقطة النهاية */
function traceShape(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const a = stroke.points[0]!;
  const b = stroke.points[stroke.points.length - 1]!;
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const w = Math.abs(b.x - a.x);
  const h = Math.abs(b.y - a.y);

  ctx.beginPath();
  switch (stroke.shape) {
    case "line":
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      break;
    case "arrow": {
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const head = Math.max(12, stroke.size * 3.5);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.moveTo(
        b.x - head * Math.cos(angle - Math.PI / 6),
        b.y - head * Math.sin(angle - Math.PI / 6),
      );
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(
        b.x - head * Math.cos(angle + Math.PI / 6),
        b.y - head * Math.sin(angle + Math.PI / 6),
      );
      break;
    }
    case "rect":
      ctx.rect(x, y, w, h);
      break;
    case "roundRect": {
      const r = Math.min(18, w / 4, h / 4);
      if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
      break;
    }
    case "circle":
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    case "triangle":
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      break;
    default:
      break;
  }
  ctx.stroke();
}

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.points.length === 0) return;
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = stroke.size;

  if (stroke.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = stroke.size * 3.2;
    tracePath(ctx, stroke.points);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = stroke.color;

  const isChalk = stroke.mode === "green";
  ctx.globalAlpha = isChalk ? 0.92 : 1;

  if (stroke.shape !== "free") {
    if (stroke.points.length >= 2) {
      ctx.globalAlpha = 1;
      ctx.miterLimit = 4;
      traceShape(ctx, stroke);
    }
  } else {
    const pts = stroke.points;
    tracePath(ctx, pts);
    ctx.stroke();

    // نسيج طباشير خفيف جداً: مسار مزاح قليلاً بشفافية منخفضة
    if (isChalk && stroke.shape === "free" && pts.length > 1) {
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = Math.max(1, stroke.size * 0.7);
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]!;
        const jx = p.x + ((i * 37) % 7) / 7 - 0.5;
        const jy = p.y + ((i * 53) % 5) / 5 - 0.5;
        if (i === 0) ctx.moveTo(jx, jy);
        else ctx.lineTo(jx, jy);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function redraw(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  live: Stroke | null,
  dpr: number,
  zoom: number,
  pan: Point,
  width: number,
  height: number,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width * dpr, height * dpr);
  ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, pan.x * dpr, pan.y * dpr);
  for (const s of strokes) drawStroke(ctx, s);
  if (live) drawStroke(ctx, live);
}

