import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStudyBackHistory } from "./useStudyBackHistory";

type Location = { menu: string | null; subject: string | null; category: string | null };
const home: Location = { menu: "basics", subject: null, category: null };

describe("study section back history", () => {
  beforeEach(() => window.history.replaceState({}, "", "/"));

  it("returns through the previous sections with their subject and curriculum", () => {
    const restore = vi.fn();
    const { result, rerender } = renderHook(({ location }) => useStudyBackHistory(location, restore), { initialProps: { location: home } });
    const subjects = { menu: "subjectsHub", subject: "biology", category: "grammar" };
    rerender({ location: subjects });
    rerender({ location: { ...subjects, menu: "mcqBank" } });
    act(() => { expect(result.current.goBack()).toBe(true); });
    expect(restore).toHaveBeenLastCalledWith(subjects);
    rerender({ location: subjects });
    act(() => { expect(result.current.goBack()).toBe(true); });
    expect(restore).toHaveBeenLastCalledWith(home);
    rerender({ location: home });
    expect(result.current.goBack()).toBe(false);
  });

  it("does not turn same-section subject changes into extra Back steps", () => {
    const restore = vi.fn();
    const { result, rerender } = renderHook(({ location }) => useStudyBackHistory(location, restore), { initialProps: { location: home } });
    rerender({ location: { ...home, subject: "physics" } });
    expect(result.current.goBack()).toBe(false);
    rerender({ location: { menu: "flashcards", subject: "physics", category: null } });
    act(() => { result.current.goBack(); });
    expect(restore).toHaveBeenCalledWith({ ...home, subject: "physics" });
  });

  it("restores the source URL and lets language reset discard the history", () => {
    const restore = vi.fn();
    window.history.replaceState({}, "", "/?menu=subjectsHub");
    const { result, rerender } = renderHook(({ location }) => useStudyBackHistory(location, restore), { initialProps: { location: home } });
    window.history.replaceState({}, "", "/ministerial-questions-for-nadia-al-nuamey");
    rerender({ location: { ...home, menu: "ministerialBank" } });
    act(() => { result.current.goBack(); });
    expect(window.location.pathname + window.location.search).toBe("/?menu=subjectsHub");
    rerender({ location: home });
    rerender({ location: { ...home, menu: "account" } });
    result.current.clear();
    expect(result.current.goBack()).toBe(false);
  });
});
