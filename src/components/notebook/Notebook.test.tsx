import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Notebook } from "./Notebook";
import { newPage, NotebookDocument, STORAGE_KEY } from "./model";

vi.mock("./export", () => ({
  exportPNG: vi.fn().mockResolvedValue(undefined),
  exportPDF: vi
    .fn()
    .mockImplementation(async (_pages, progress) => progress(1)),
}));
const rect = {
  x: 0,
  y: 0,
  left: 0,
  top: 0,
  right: 760,
  bottom: 1040,
  width: 760,
  height: 1040,
  toJSON: () => ({}),
};
class TestPointerEvent extends MouseEvent {
  pointerId: number;
  pointerType: string;
  constructor(type: string, params: PointerEventInit = {}) {
    super(type, params);
    this.pointerId = params.pointerId ?? 1;
    this.pointerType = params.pointerType ?? "mouse";
  }
  getCoalescedEvents() {
    return [this];
  }
}
function stored(): NotebookDocument {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)!).document;
}
const paper = () => screen.getByTestId("notebook-paper");
const viewport = () => document.querySelector(".nb-viewport")!;
function drag(
  target: Element,
  x: number,
  y: number,
  x2: number,
  y2: number,
  type = "mouse",
  id = 1,
) {
  fireEvent.pointerDown(target, {
    clientX: x,
    clientY: y,
    pointerId: id,
    pointerType: type,
    button: 0,
  });
  fireEvent.pointerMove(viewport(), {
    clientX: x2,
    clientY: y2,
    pointerId: id,
    pointerType: type,
  });
  fireEvent.pointerUp(viewport(), {
    clientX: x2,
    clientY: y2,
    pointerId: id,
    pointerType: type,
  });
}
async function boot() {
  render(<Notebook />);
  await screen.findByTestId("notebook-paper");
}
beforeEach(() => {
  localStorage.clear();
  const p = newPage("white", "plain", "Test page");
  const d: NotebookDocument = {
    version: 1,
    pages: [p],
    currentPageId: p.id,
    defaults: { color: "white", style: "plain" },
  };
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ document: d, savedAt: Date.now() }),
  );
  vi.stubGlobal("PointerEvent", TestPointerEvent);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private cb: ResizeObserverCallback) {}
      observe() {
        this.cb(
          [
            { contentRect: { width: 1000, height: 850 } },
          ] as ResizeObserverEntry[],
          this as unknown as ResizeObserver,
        );
      }
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    font: "",
    measureText: (text: string) => ({ width: text.length * 12 }),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(SVGSVGElement.prototype, "getBoundingClientRect").mockReturnValue(
    rect,
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    ...rect,
    width: 1000,
    height: 850,
  });
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.hasPointerCapture = () => true;
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("interactive stationery notebook", () => {
  it("adds, drags, rotates, duplicates, layers and deletes a sticker", async () => {
    await boot();
    fireEvent.click(screen.getByLabelText("Add Pink bow sticker"));
    let item = paper().querySelector('[data-item-kind="sticker"]')!;
    const start = item.getAttribute("transform");
    drag(item.querySelector("image")!, 330, 380, 420, 470);
    expect(item.getAttribute("transform")).not.toBe(start);
    fireEvent.click(screen.getByLabelText("Rotate item 15 degrees"));
    expect(item.getAttribute("transform")).toContain("rotate(15");
    fireEvent.click(screen.getByLabelText("Duplicate item"));
    expect(paper().querySelectorAll('[data-item-kind="sticker"]')).toHaveLength(
      2,
    );
    fireEvent.click(screen.getByLabelText("Send item backward"));
    fireEvent.click(screen.getByLabelText("Bring item to front"));
    fireEvent.click(screen.getByLabelText("Delete selected item"));
    expect(paper().querySelectorAll('[data-item-kind="sticker"]')).toHaveLength(
      1,
    );
    fireEvent.click(screen.getByLabelText("Undo"));
    expect(paper().querySelectorAll('[data-item-kind="sticker"]')).toHaveLength(
      2,
    );
    fireEvent.click(screen.getByLabelText("Redo"));
    expect(paper().querySelectorAll('[data-item-kind="sticker"]')).toHaveLength(
      1,
    );
  });
  it("resizes and rotates stickers with touch handles", async () => {
    await boot();
    fireEvent.click(screen.getByLabelText("Add Pink bow sticker"));
    const item = paper().querySelector('[data-item-kind="sticker"]')!;
    const before = item.querySelector("image")!.getAttribute("width");
    drag(
      paper().querySelector('[data-handle="se"]')!,
      450,
      500,
      520,
      570,
      "touch",
    );
    expect(item.querySelector("image")!.getAttribute("width")).not.toBe(before);
    drag(
      paper().querySelector('[data-handle="rotate"]')!,
      400,
      300,
      540,
      430,
      "touch",
    );
    expect(item.getAttribute("transform")).not.toContain("rotate(0 ");
  });
  it.each(["Pen", "Pencil", "Highlighter"])(
    "draws with %s and really erases sparse strokes",
    async (label) => {
      await boot();
      fireEvent.click(screen.getByLabelText(`${label} tool`));
      drag(paper(), 100, 100, 500, 140, "touch");
      expect(
        paper().querySelectorAll('[data-item-kind="stroke"]'),
      ).toHaveLength(1);
      const stroke = paper().querySelector('[data-item-kind="stroke"] path')!;
      expect(stroke.getAttribute("d")).toContain("L");
      fireEvent.click(screen.getByLabelText("Eraser tool"));
      drag(paper(), 300, 110, 300, 140, "touch");
      expect(
        paper().querySelectorAll('[data-item-kind="stroke"]'),
      ).toHaveLength(0);
      fireEvent.click(screen.getByLabelText("Undo"));
      expect(
        paper().querySelectorAll('[data-item-kind="stroke"]'),
      ).toHaveLength(1);
    },
  );
  it("edits, formats, recolors and resizes text and sticky notes", async () => {
    await boot();
    fireEvent.click(screen.getByLabelText("Text tool"));
    fireEvent.pointerDown(paper(), {
      clientX: 100,
      clientY: 120,
      pointerId: 1,
    });
    fireEvent.pointerUp(viewport(), { pointerId: 1 });
    const text = await screen.findByLabelText("Edit page text");
    fireEvent.change(text, { target: { value: "My ideas\nتميّزك" } });
    fireEvent.blur(text);
    expect(paper().textContent).toContain("تميّزك");
    fireEvent.click(screen.getByLabelText("Item properties"));
    fireEvent.click(screen.getByLabelText("Bold"));
    fireEvent.click(screen.getByLabelText("Italic"));
    fireEvent.click(screen.getByLabelText("Align right"));
    fireEvent.change(screen.getByLabelText("Font size"), {
      target: { value: "34" },
    });
    fireEvent.click(screen.getByLabelText("Ink color #9D596B"));
    const svgText = paper().querySelector('[data-item-kind="text"] text')!;
    expect(svgText.getAttribute("font-size")).toBe("34");
    expect(svgText.getAttribute("font-weight")).toBe("700");
    expect(svgText.getAttribute("text-anchor")).toBe("end");
    expect(svgText.getAttribute("fill")).toBe("#9D596B");
    fireEvent.change(screen.getByLabelText("Item width"), {
      target: { value: "400" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Add a sticky note/ }));
    const note = await screen.findByLabelText("Edit page text");
    fireEvent.change(note, { target: { value: "Remember this" } });
    fireEvent.blur(note);
    fireEvent.click(screen.getByLabelText("Item properties"));
    fireEvent.click(screen.getByLabelText("Note color #BFD8E8"));
    expect(
      paper()
        .querySelector('[data-item-kind="sticky"] rect')!
        .getAttribute("fill"),
    ).toBe("#BFD8E8");
  });
  it.each(["Rectangle", "Circle", "Arrow", "Line", "Heart", "Star"])(
    "draws a real %s shape",
    async (shape) => {
      await boot();
      fireEvent.click(screen.getByLabelText("Shapes tool"));
      fireEvent.click(screen.getByLabelText(shape, { exact: true }));
      drag(paper(), 200, 250, 400, 430);
      expect(paper().querySelectorAll('[data-item-kind="shape"]')).toHaveLength(
        1,
      );
    },
  );
  it("keeps per-page paper choices, clean defaults, and current page after remount", async () => {
    await boot();
    fireEvent.click(screen.getByLabelText("Pale yellow paper"));
    fireEvent.change(screen.getByLabelText("Paper style"), {
      target: { value: "grid" },
    });
    fireEvent.click(screen.getByLabelText("Add new page"));
    expect(paper().querySelectorAll("[data-item-id]")).toHaveLength(0);
    expect(screen.getByLabelText("Paper style")).toHaveValue("grid");
    fireEvent.click(screen.getByLabelText("White paper"));
    fireEvent.change(screen.getByLabelText("Paper style"), {
      target: { value: "plain" },
    });
    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(screen.getByLabelText("Paper style")).toHaveValue("grid");
    expect(screen.getByLabelText("Pale yellow paper")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByLabelText("Next page"));
    await waitFor(() => expect(stored().pages).toHaveLength(2));
    const saved = stored();
    cleanup();
    await boot();
    expect(screen.getByLabelText("Paper style")).toHaveValue("plain");
    expect(screen.getByLabelText("Page 2 of 2")).toBeInTheDocument();
    expect(stored().currentPageId).toBe(saved.currentPageId);
  });
  it("manages pages from real thumbnails and can restore a deleted page", async () => {
    await boot();
    fireEvent.click(screen.getByLabelText("Page overview"));
    fireEvent.click(screen.getByLabelText("Duplicate page 1"));
    expect(
      screen.getByLabelText("Open page 2: Test page (copy)"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Delete page 2"));
    fireEvent.click(screen.getByRole("button", { name: "Remove page" }));
    fireEvent.click(screen.getByLabelText("Close dialog"));
    expect(screen.getByLabelText("Page 1 of 1")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Undo"));
    expect(screen.getByLabelText("Page 2 of 2")).toBeInTheDocument();
  });
  it("supports hand panning, zoom controls, two-touch pinch, and fullscreen fallback", async () => {
    await boot();
    const before = screen.getByLabelText(
      "Reset zoom to 100 percent",
    ).textContent;
    fireEvent.click(screen.getByLabelText("Zoom in"));
    expect(
      screen.getByLabelText("Reset zoom to 100 percent").textContent,
    ).not.toBe(before);
    fireEvent.click(screen.getByLabelText("Reset zoom to 100 percent"));
    expect(
      screen.getByLabelText("Reset zoom to 100 percent"),
    ).toHaveTextContent("100%");
    fireEvent.click(screen.getByLabelText("Hand tool"));
    const position = document.querySelector(".nb-paper")!.getAttribute("style");
    drag(paper(), 200, 200, 300, 300, "touch");
    expect(document.querySelector(".nb-paper")!.getAttribute("style")).not.toBe(
      position,
    );
    fireEvent.pointerDown(paper(), {
      clientX: 200,
      clientY: 300,
      pointerId: 1,
      pointerType: "touch",
    });
    fireEvent.pointerDown(paper(), {
      clientX: 400,
      clientY: 300,
      pointerId: 2,
      pointerType: "touch",
    });
    fireEvent.pointerMove(viewport(), {
      clientX: 600,
      clientY: 300,
      pointerId: 2,
      pointerType: "touch",
    });
    fireEvent.pointerUp(viewport(), { pointerId: 2, pointerType: "touch" });
    fireEvent.pointerUp(viewport(), { pointerId: 1, pointerType: "touch" });
    expect(
      screen.getByLabelText("Reset zoom to 100 percent"),
    ).toHaveTextContent("200%");
    fireEvent.click(screen.getByLabelText("Fullscreen"));
    await screen.findByLabelText("Exit fullscreen");
    fireEvent.click(screen.getByLabelText("Exit fullscreen"));
    await screen.findByLabelText("Fullscreen");
  });
  it("has working PNG and full-notebook PDF export actions", async () => {
    const exports = await import("./export");
    await boot();
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    fireEvent.click(screen.getByRole("button", { name: /Current page/ }));
    await waitFor(() => expect(exports.exportPNG).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Export" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    fireEvent.click(screen.getByRole("button", { name: /Entire notebook/ }));
    await waitFor(() => expect(exports.exportPDF).toHaveBeenCalled());
  });
});
