import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import BottomGroupNav from "./BottomGroupNav";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.documentElement.style.removeProperty("--nav-safe");
});

it("reserves the measured navigation height, updates after resizing, and restores the page on unmount", () => {
  let height = 90;
  let resized: () => void = () => {};
  const disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { resized = callback; }
    observe() {}
    disconnect = disconnect;
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({
    height, width: 390, x: 0, y: 700, top: 700, left: 0, right: 390, bottom: 700 + height,
    toJSON: () => ({}),
  }));
  document.documentElement.style.setProperty("--nav-safe", "80px");
  const view = render(<BottomGroupNav language="en" active="sessions" onSelect={() => {}} onGuide={() => {}} />);
  expect(document.documentElement.style.getPropertyValue("--nav-safe")).toBe("106px");
  height = 120;
  act(() => resized());
  expect(document.documentElement.style.getPropertyValue("--nav-safe")).toBe("136px");
  view.unmount();
  expect(disconnect).toHaveBeenCalled();
  expect(document.documentElement.style.getPropertyValue("--nav-safe")).toBe("80px");
  expect(document.documentElement.classList.contains("has-study-nav")).toBe(false);
});
