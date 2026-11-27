import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import BottomGroupNav from "./BottomGroupNav";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.documentElement.style.removeProperty("--nav-safe");
});

it("puts Study second and keeps Community selected while its pages are open", () => {
  const onSelect = vi.fn();
  const props = { language: "en" as const, onSelect, onGuide: vi.fn() };
  const view = render(<BottomGroupNav {...props} active="basics" />);
  const nav = within(screen.getByRole("navigation", { name: "Primary navigation" }));
  const study = nav.getByRole("button", { name: "Study" });
  const community = nav.getByRole("button", { name: "Community" });
  expect(nav.getAllByRole("button")[1]).toBe(study);
  expect(nav.getAllByRole("button")[3]).toBe(community);
  fireEvent.click(study);
  fireEvent.click(community);
  expect(onSelect.mock.calls).toEqual([["more"], ["community"]]);
  for (const active of ["community", "friends", "sessions", "communityChat"] as const) {
    view.rerender(<BottomGroupNav {...props} active={active} />);
    expect(community).toHaveAttribute("aria-current", "page");
    expect(study).not.toHaveAttribute("aria-current");
  }
  view.rerender(<BottomGroupNav {...props} active="subjectsHub" />);
  expect(study).toHaveAttribute("aria-current", "page");
  expect(community).not.toHaveAttribute("aria-current");
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
