import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BiologySketchCanvas from "./BiologySketchCanvas";
import type { DiagramDef } from "./LabeledDiagram";

const storage = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn() }));
vi.mock("@/lib/biologyDrawing", async (original) => ({
  ...await original<typeof import("@/lib/biologyDrawing")>(),
  loadDrawingAttempt: storage.load,
  saveDrawingAttempt: storage.save,
}));
const paper: DiagramDef = { id: "sketchbook:blank", title: { en: "Blank paper", ar: "ورقة فارغة" }, art: null, parts: [] };
let inkVisible = true;
function stroke(canvas: HTMLCanvasElement) {
  for (const type of ["pointerdown", "pointermove", "pointerup"]) {
    const event = new MouseEvent(type, { bubbles: true, clientX: type === "pointerdown" ? 20 : 100, clientY: 50, button: 0 });
    Object.defineProperties(event, { pointerId: { value: 1 }, pointerType: { value: "touch" }, isPrimary: { value: true } });
    fireEvent(canvas, event);
  }
}

beforeEach(() => {
  storage.load.mockReset().mockResolvedValue(null);
  storage.save.mockReset().mockResolvedValue(undefined);
  inkVisible = true;
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 300, height: 300, right: 300, bottom: 300, x: 0, y: 0, toJSON() {} });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    setTransform() {}, clearRect() {}, save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, arc() {}, fill() {},
    getImageData: () => ({ data: new Uint8ClampedArray([0, 0, 0, inkVisible ? 255 : 0]) }),
  } as any);
});
afterEach(() => vi.restoreAllMocks());

describe("sketch paper interaction", () => {
  it("draws by touch, supports erasing and undo, and clears the paper reversibly", async () => {
    render(<BiologySketchCanvas diagram={paper} language="en" ownerId="guest" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Pen" })).toBeEnabled());
    const canvas = screen.getByTestId("biology-sketch-paper") as HTMLCanvasElement;
    await act(async () => stroke(canvas));
    await waitFor(() => expect(storage.save).toHaveBeenCalled());
    expect(storage.save.mock.calls.at(-1)[1].strokes[0].tool).toBe("pen");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Eraser" })));
    await act(async () => stroke(canvas));
    expect(storage.save.mock.calls.at(-1)[1].strokes.at(-1).tool).toBe("eraser");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Undo" })));
    expect(storage.save.mock.calls.at(-1)[1].strokes).toHaveLength(1);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Clear all" })));
    expect(storage.save.mock.calls.at(-1)[1].strokes).toHaveLength(0);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Undo" })));
    expect(storage.save.mock.calls.at(-1)[1].strokes).toHaveLength(1);
  });

  it("zooms in and out while keeping the paper scrollable in hand mode", async () => {
    render(<BiologySketchCanvas diagram={paper} language="en" ownerId="guest" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Pen" })).toBeEnabled());
    const stage = screen.getByTestId("biology-sketch-stage");
    expect(stage).toHaveStyle({ width: "100%" });
    expect(screen.getByLabelText("Zoom level")).toHaveTextContent("100%");

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Zoom in" })));
    expect(stage).toHaveStyle({ width: "125%" });
    expect(screen.getByLabelText("Zoom level")).toHaveTextContent("125%");

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Zoom out" })));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Zoom out" })));
    expect(stage).toHaveStyle({ width: "75%" });
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled();

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Scroll" })));
    expect(screen.getByTestId("biology-sketch-paper")).toHaveStyle({ touchAction: "pan-x pan-y pinch-zoom" });
  });

  it("confirms Submit only after saving, then permits editing the sketch", async () => {
    render(<BiologySketchCanvas diagram={paper} language="en" ownerId="user:a" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Pen" })).toBeEnabled());
    await act(async () => stroke(screen.getByTestId("biology-sketch-paper") as HTMLCanvasElement));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Submit drawing" })));
    expect(await screen.findByText("Your attempt was submitted and saved on this device.")).toBeVisible();
    expect(storage.save.mock.calls.at(-1)[0]).toBe("user:a");
    expect(storage.save.mock.calls.at(-1)[1].submittedAt).toEqual(expect.any(String));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Edit sketch" })));
    expect(storage.save.mock.calls.at(-1)[1].submittedAt).toBeNull();
    expect(screen.getByRole("button", { name: "Pen" })).toBeEnabled();
  });

  it("rejects a fully erased drawing and keeps a failed submission editable", async () => {
    render(<BiologySketchCanvas diagram={paper} language="en" ownerId="guest" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Pen" })).toBeEnabled());
    await act(async () => stroke(screen.getByTestId("biology-sketch-paper") as HTMLCanvasElement));
    inkVisible = false;
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Submit drawing" })));
    expect(screen.getByRole("alert")).toHaveTextContent("Draw something on the paper before submitting.");
    inkVisible = true;
    storage.save.mockRejectedValueOnce(new Error("Quota exceeded"));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Submit drawing" })));
    expect(screen.getByRole("alert")).toHaveTextContent("Could not save on this device.");
    expect(screen.getByRole("button", { name: "Pen" })).toBeEnabled();
    expect(screen.queryByText("Your attempt was submitted and saved on this device.")).not.toBeInTheDocument();
  });
});
