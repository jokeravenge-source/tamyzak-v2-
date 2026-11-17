import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RandomDestinationGlobe } from "./RandomDestinationGlobe";

let callbacks: Map<number, FrameRequestCallback>;
let nextId: number;

beforeEach(() => {
  callbacks = new Map(); nextId = 0;
  vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => { callbacks.set(++nextId, callback); return nextId; }));
  vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => { callbacks.delete(id); }));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function frame(time: number) {
  act(() => {
    const pending = [...callbacks.values()]; callbacks.clear();
    pending.forEach(callback => callback(time));
  });
}

it.each([{ lat: 40.7128, lng: -74.006 }, { lat: -36.8509, lng: 174.7645 }])("turns the globe and stops exactly on $lat, $lng", destination => {
  const onComplete = vi.fn();
  const { container, rerender } = render(<RandomDestinationGlobe destination={destination} label="Choosing a country" onComplete={onComplete} />);
  const paths = () => [...container.querySelectorAll("svg path")].map(path => path.getAttribute("d")).join("|");
  frame(0);
  const initial = paths();
  frame(800);
  expect(paths()).not.toBe(initial);
  expect(onComplete).not.toHaveBeenCalled();
  // A language/caption update must not restart the spin.
  rerender(<RandomDestinationGlobe destination={{ ...destination }} label="اختيار الوجهة" onComplete={onComplete} />);
  frame(3199);
  expect(onComplete).not.toHaveBeenCalled();
  frame(3200);
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(container.querySelector(".trip-pop")).toHaveAttribute("transform", "translate(150 150)");
  expect(callbacks.size).toBe(0);
});

it("cancels pending animation frames when the student leaves", () => {
  const onComplete = vi.fn();
  const view = render(<RandomDestinationGlobe destination={{ lat: 48.8566, lng: 2.3522 }} label="Choosing" onComplete={onComplete} />);
  frame(0);
  view.unmount();
  expect(callbacks.size).toBe(0);
  frame(4000);
  expect(onComplete).not.toHaveBeenCalled();
});

it("shows the selected destination immediately when reduced motion is enabled", () => {
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
  const onComplete = vi.fn();
  const { container } = render(<RandomDestinationGlobe destination={{ lat: 35.6762, lng: 139.6503 }} label="Tokyo" onComplete={onComplete} />);
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(container.querySelector(".trip-pop")).toHaveAttribute("transform", "translate(150 150)");
  expect(requestAnimationFrame).not.toHaveBeenCalled();
});
