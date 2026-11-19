import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import StudyRunner from "./StudyRunner";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("asks once after ten active seconds, preserves partial time over pauses and waits for the next segment", () => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  const onQuestion = vi.fn();
  const onHit = vi.fn();
  const props = {
    active: true,
    segment: 0,
    avatar: "runner.png",
    ar: false,
    onQuestion,
    onHit,
    lives: 3,
  };
  const page = render(<StudyRunner {...props} />);
  act(() => vi.advanceTimersByTime(6000));
  expect(onQuestion).not.toHaveBeenCalled();
  page.rerender(<StudyRunner {...props} active={false} />);
  act(() => vi.advanceTimersByTime(30000));
  expect(onQuestion).not.toHaveBeenCalled();
  page.rerender(<StudyRunner {...props} />);
  act(() => vi.advanceTimersByTime(4000));
  expect(onQuestion).toHaveBeenCalledTimes(1);
  act(() => vi.advanceTimersByTime(30000));
  expect(onQuestion).toHaveBeenCalledTimes(1);
  page.rerender(<StudyRunner {...props} segment={1} />);
  act(() => vi.advanceTimersByTime(10000));
  expect(onQuestion).toHaveBeenCalledTimes(2);
  expect(onHit).not.toHaveBeenCalled();
  page.unmount();
});

it("shows hearts above the runner, animates collisions and increases running speed", () => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0.34);
  const onHit = vi.fn();
  const props = {
    active: true,
    segment: 0,
    avatar: "runner.png",
    ar: false,
    onQuestion: vi.fn(),
    onHit,
    lives: 3,
  };
  const page = render(<StudyRunner {...props} />);
  act(() => vi.advanceTimersByTime(5600));
  expect(onHit).toHaveBeenCalledTimes(1);
  expect(
    page.container.querySelector(".runner-hit .runner-impact"),
  ).toBeInTheDocument();
  expect(
    Number(
      (
        page.container.querySelector(".runner-field") as HTMLElement
      ).style.getPropertyValue("--runner-speed"),
    ),
  ).toBeGreaterThan(1);
  page.rerender(<StudyRunner {...props} lives={2} />);
  expect(
    page.container.querySelectorAll(".runner-sprite .runner-lives .lost"),
  ).toHaveLength(1);
  page.unmount();
});
