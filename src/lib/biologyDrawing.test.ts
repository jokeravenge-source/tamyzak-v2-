import "fake-indexeddb/auto";
import { describe, expect, it, vi } from "vitest";
import { appendDrawingPoint, drawingPoint, loadDrawingAttempt, MAX_DRAWING_POINTS, MAX_STROKE_POINTS,
  paintDrawing, readDrawingAttempt, saveDrawingAttempt, type DrawingAttempt, type DrawingStroke } from "./biologyDrawing";
const pen = (): DrawingStroke => ({ tool: "pen", color: "#e11d48", width: 0.01, points: [{ x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 }] });
const attempt = (diagramId = "ch1-animal-cell"): DrawingAttempt => ({ version: 1, diagramId, strokes: [pen()], submittedAt: null });
let ownerNumber = 0;
const owner = () => "biology-drawing-test-" + (++ownerNumber);

describe("biology drawing model", () => {
  it("maps finger coordinates consistently across size, offset and orientation changes", () => {
    expect(drawingPoint(85, 170, { left: 10, top: 20, width: 300, height: 300 })).toEqual({ x: 0.25, y: 0.5 });
    expect(drawingPoint(180, 145, { left: 30, top: 70, width: 600, height: 150 })).toEqual({ x: 0.25, y: 0.5 });
    expect(drawingPoint(-10, 900, { left: 0, top: 0, width: 300, height: 300 })).toEqual({ x: 0, y: 1 });
    expect(drawingPoint(1, 1, { left: 0, top: 0, width: 0, height: 300 })).toBeNull();
    expect(drawingPoint(Number.NaN, 1, { left: 0, top: 0, width: 300, height: 300 })).toBeNull();
  });
  it("filters pointer noise and compacts a long stroke while retaining its newest point", () => {
    const first = [{ x: 0, y: 0 }];
    expect(appendDrawingPoint(first, { x: 0.0001, y: 0.0001 }, 300, 300)).toBe(first);
    const points = Array.from({ length: MAX_STROKE_POINTS }, (_, index) => ({ x: index / MAX_STROKE_POINTS, y: 0.2 }));
    const result = appendDrawingPoint(points, { x: 1, y: 0.3 }, 600, 300);
    expect(result.length).toBeLessThanOrEqual(MAX_STROKE_POINTS);
    expect(result[result.length - 1]).toEqual({ x: 1, y: 0.3 });
    expect(points.length).toBe(MAX_STROKE_POINTS);
  });
  it("rejects corrupted, cross-diagram and oversized stored attempts", () => {
    const data = attempt();
    expect(readDrawingAttempt(data, "different-diagram")).toBeNull();
    expect(readDrawingAttempt({ ...data, strokes: [{ ...pen(), color: "url(https://example.test)" }] }, data.diagramId)).toBeNull();
    expect(readDrawingAttempt({ ...data, strokes: [{ ...pen(), points: [{ x: 2, y: 0 }] }] }, data.diagramId)).toBeNull();
    const large = { ...data, strokes: Array.from({ length: Math.ceil(MAX_DRAWING_POINTS / MAX_STROKE_POINTS) },
      () => ({ ...pen(), points: Array.from({ length: MAX_STROKE_POINTS }, () => ({ x: 0.5, y: 0.5 })) })) };
    expect(readDrawingAttempt(large, data.diagramId)).toBeNull();
  });
  it("replays erasing on the transparent ink layer and permits new ink afterwards", () => {
    const modes: string[] = [];
    const ctx = {
      clearRect: vi.fn(), save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(),
      moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), arc: vi.fn(), fill: vi.fn(),
      set globalCompositeOperation(value: string) { modes.push(value); },
    };
    paintDrawing(ctx as unknown as CanvasRenderingContext2D, [pen(), { ...pen(), tool: "eraser" }, pen()], 300, 200);
    expect(modes).toEqual(["source-over", "destination-out", "source-over"]);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 300, 200);
  });
  it("renders a tap as a visible dot", () => {
    const ctx = { clearRect: vi.fn(), save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), stroke: vi.fn() };
    paintDrawing(ctx as unknown as CanvasRenderingContext2D, [{ ...pen(), points: [{ x: 0.25, y: 0.5 }] }], 300, 200);
    expect(ctx.arc).toHaveBeenCalledWith(75, 100, 1.5, 0, Math.PI * 2);
    expect(ctx.fill).toHaveBeenCalledOnce();
  });
});
describe("device-local drawing submissions", () => {
  it("keeps accounts and diagrams separate", async () => {
    const a = owner(), b = owner(), data = attempt();
    await saveDrawingAttempt(a, data);
    expect(await loadDrawingAttempt(a, data.diagramId)).toEqual(data);
    expect(await loadDrawingAttempt(b, data.diagramId)).toBeNull();
    expect(await loadDrawingAttempt(a, "ch3-fruit")).toBeNull();
  });
  it("retains a submitted attempt, then allows an edited draft and an empty clear", async () => {
    const id = owner(), data = { ...attempt(), submittedAt: "2026-11-16T18:00:00.000Z" };
    await saveDrawingAttempt(id, data);
    expect((await loadDrawingAttempt(id, data.diagramId))?.submittedAt).toBe(data.submittedAt);
    await saveDrawingAttempt(id, { ...data, submittedAt: null });
    expect((await loadDrawingAttempt(id, data.diagramId))?.submittedAt).toBeNull();
    await saveDrawingAttempt(id, { ...data, strokes: [], submittedAt: null });
    expect((await loadDrawingAttempt(id, data.diagramId))?.strokes).toEqual([]);
  });
  it("does not replace a good saved attempt with invalid input", async () => {
    const id = owner(), data = attempt();
    await saveDrawingAttempt(id, data);
    await expect(saveDrawingAttempt(id, { ...data, strokes: [{ ...pen(), width: Number.NaN }] })).rejects.toThrow();
    expect(await loadDrawingAttempt(id, data.diagramId)).toEqual(data);
  });
});
