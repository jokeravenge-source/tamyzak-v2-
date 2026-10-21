import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchFAB from "./SearchFAB";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function openSearch(onSelect = vi.fn()) {
  render(<SearchFAB language="ar" onSelect={onSelect} />);
  act(() => { window.dispatchEvent(new Event("app:open-search")); });
  return onSelect;
}

describe("study tool search", () => {
  it("finds Arabic spelling variants and opens the question bank", async () => {
    const onSelect = openSearch();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "اسئله MCQ" } });
    fireEvent.click(await screen.findByRole("option", { name: /بنك أسئلة MCQ/ }));
    expect(onSelect).toHaveBeenCalledWith("mcqBank");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("allows Enter to open the selected teacher result", async () => {
    const onSelect = openSearch();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "مدرسونا" } });
    await waitFor(() => expect(screen.getByRole("option", { name: /مدرسونا/ })).toHaveAttribute("aria-selected", "true"));
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("ourTeachers");
  });
  it("offers a recovery action when nothing matches", async () => {
    openSearch();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzzzzzzzzz" } });
    fireEvent.click(await screen.findByRole("button", { name: "عرض كل الأدوات" }));
    expect(screen.getByRole("option", { name: /بنك أسئلة MCQ/ })).toBeInTheDocument();
  });
  it("respects tools hidden by the student", () => {
    localStorage.setItem("app_hidden_study_tools_v1", JSON.stringify(["mcqBank"]));
    openSearch();
    expect(screen.queryByRole("option", { name: /بنك أسئلة MCQ/ })).not.toBeInTheDocument();
  });
  it("returns keyboard focus to the control that opened search", async () => {
    render(<><button onClick={() => window.dispatchEvent(new Event("app:open-search"))}>Open search</button><SearchFAB language="en" onSelect={vi.fn()} /></>);
    const trigger = screen.getByRole("button", { name: "Open search" });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Close / إغلاق" }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
