export type DrawingPoint = { x: number; y: number };
export type DrawingRect = { left: number; top: number; width: number; height: number };
export type DrawingStroke = { tool: "pen" | "eraser"; color: string; width: number; points: DrawingPoint[] };
export type DrawingAttempt = { version: 1; diagramId: string; strokes: DrawingStroke[]; submittedAt: string | null };
export const MAX_DRAWING_POINTS = 30000;
export const MAX_STROKE_POINTS = 2048;
// Runtime helpers
export function drawingPoint(clientX: number, clientY: number, rect: DrawingRect): DrawingPoint | null {
  if (![clientX, clientY, rect.left, rect.top, rect.width, rect.height].every(Number.isFinite) || rect.width <= 0 || rect.height <= 0) return null;
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  return { x: Math.round(clamp((clientX - rect.left) / rect.width) * 100000) / 100000,
    y: Math.round(clamp((clientY - rect.top) / rect.height) * 100000) / 100000 };
}
export function appendDrawingPoint(points: DrawingPoint[], point: DrawingPoint, width: number, height: number): DrawingPoint[] {
  const last = points[points.length - 1];
  if (last && Math.hypot((point.x - last.x) * width, (point.y - last.y) * height) < 0.8) return points;
  const compact = points.length >= MAX_STROKE_POINTS ? points.filter((_, index) => index % 2 === 0) : points;
  return [...compact, point];
}
export function readDrawingAttempt(value: any, diagramId: string): DrawingAttempt | null {
  if (!value || value.version !== 1 || value.diagramId !== diagramId || !Array.isArray(value.strokes) || value.strokes.length > 1200) return null;
  if (value.submittedAt !== null && (typeof value.submittedAt !== "string" || !Number.isFinite(Date.parse(value.submittedAt)))) return null;
  let count = 0;
  for (const stroke of value.strokes) {
    if (!stroke || !["pen", "eraser"].includes(stroke.tool) || typeof stroke.color !== "string" || !/^#[0-9a-f]{6}$/i.test(stroke.color) ||
        !Number.isFinite(stroke.width) || stroke.width <= 0 || stroke.width > 0.3 || !Array.isArray(stroke.points) ||
        stroke.points.length === 0 || stroke.points.length > MAX_STROKE_POINTS) return null;
    count += stroke.points.length;
    if (count > MAX_DRAWING_POINTS) return null;
    for (const point of stroke.points) {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) return null;
    }
  }
  return { version: 1, diagramId, strokes: value.strokes, submittedAt: value.submittedAt };
}
export function paintDrawing(ctx: CanvasRenderingContext2D, strokes: DrawingStroke[], width: number, height: number): void {
  ctx.clearRect(0, 0, width, height);
  for (const stroke of strokes) {
    if (!stroke.points.length) continue;
    ctx.save();
    ctx.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = stroke.color; ctx.fillStyle = stroke.color;
    ctx.lineWidth = Math.max(1, stroke.width * width);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    const first = stroke.points[0];
    if (stroke.points.length === 1) {
      ctx.arc(first.x * width, first.y * height, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.moveTo(first.x * width, first.y * height);
      for (const point of stroke.points.slice(1)) ctx.lineTo(point.x * width, point.y * height);
      ctx.stroke();
    }
    ctx.restore();
  }
}
// End runtime helpers
let database: Promise<IDBDatabase> | null = null;
function drawingDatabase(): Promise<IDBDatabase> {
  if (database) return database;
  database = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("Drawing storage is unavailable")); return; }
    const request = indexedDB.open("tamayzak-biology-drawings-v1", 1);
    let settled = false;
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("attempts")) request.result.createObjectStore("attempts", { keyPath: ["owner", "diagramId"] });
    };
    request.onerror = () => { settled = true; database = null; reject(request.error ?? new Error("Drawing storage is unavailable")); };
    request.onblocked = () => { settled = true; database = null; reject(new Error("Drawing storage is busy in another tab")); };
    request.onsuccess = () => {
      if (settled) { request.result.close(); return; }
      const db = request.result;
      db.onversionchange = () => { db.close(); database = null; };
      resolve(db);
    };
  });
  const opening = database;
  void opening.catch(() => { if (database === opening) database = null; });
  return opening;
}
export async function loadDrawingAttempt(owner: string, diagramId: string): Promise<DrawingAttempt | null> {
  const db = await drawingDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("attempts", "readonly");
    const request = transaction.objectStore("attempts").get([owner, diagramId]);
    let result: DrawingAttempt | null = null;
    request.onsuccess = () => { result = readDrawingAttempt(request.result?.attempt, diagramId); };
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = transaction.onabort = () => reject(transaction.error ?? new Error("Could not open drawing"));
  });
}
export async function saveDrawingAttempt(owner: string, attempt: DrawingAttempt): Promise<void> {
  const valid = readDrawingAttempt(attempt, attempt.diagramId);
  if (!valid || !owner) throw new Error("Invalid drawing");
  const db = await drawingDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("attempts", "readwrite");
    transaction.objectStore("attempts").put({ owner, diagramId: valid.diagramId, attempt: valid });
    transaction.oncomplete = () => resolve();
    transaction.onerror = transaction.onabort = () => reject(transaction.error ?? new Error("Could not save drawing"));
  });
}
