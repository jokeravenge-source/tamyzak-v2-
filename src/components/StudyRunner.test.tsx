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
  const onFinish = vi.fn();
  const props = {
    active: true,
    segment: 0,
    avatar: "runner.png",
    ar: false,
    onQuestion,
    onFinish,
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
  expect(onFinish).not.toHaveBeenCalled();
  page.unmount();
});
