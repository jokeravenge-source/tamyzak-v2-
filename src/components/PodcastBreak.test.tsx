import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import PodcastBreak from "./PodcastBreak";
afterEach(() => vi.useRealTimers());
it("lets students skip rest or finish the timer without automatically starting the next lesson", () => {
  vi.useFakeTimers();
  const resume = vi.fn();
  render(
    <PodcastBreak
      plan={{ minutes: 2, reason: "استراحة بالنص" }}
      onContinue={resume}
    />,
  );
  expect(screen.getByRole("button", { name: "نكمل هسه" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "آخذ استراحة" }));
  act(() => vi.advanceTimersByTime(120000));
  expect(screen.getByRole("status")).toHaveTextContent("خلصت الاستراحة");
  expect(resume).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "جاهز، نكمّل المراجعة" }));
  expect(resume).toHaveBeenCalledOnce();
});
