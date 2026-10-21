import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PageTransition from "./PageTransition";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("study screen changes", () => {
  it("focuses the screen title and restores its reading position on return", () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const position = vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
    const { rerender } = render(<PageTransition routeKey="review"><h1>Review</h1></PageTransition>);
    expect(screen.getByRole("heading", { name: "Review" })).toHaveFocus();
    position.mockReturnValue(280);
    rerender(<PageTransition routeKey="questions"><h1>Questions</h1></PageTransition>);
    expect(scroll).toHaveBeenLastCalledWith({ top: 0, behavior: "instant" });
    position.mockReturnValue(0);
    rerender(<PageTransition routeKey="review"><h1>Review</h1></PageTransition>);
    expect(scroll).toHaveBeenLastCalledWith({ top: 280, behavior: "instant" });
    expect(screen.getByRole("heading", { name: "Review" })).toHaveFocus();
  });
});
