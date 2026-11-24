import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TodoList from "./TodoList";

const api = vi.hoisted(() => ({ pull: vi.fn(), push: vi.fn() }));
vi.mock("@/hooks/useFeatureUsed", () => ({ useFeatureUsed: vi.fn() }));
vi.mock("@/lib/todosSync", () => ({ pullTodos: api.pull, pushTodos: api.push }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      getSession: async () => ({ data: { session: { user: { id: "student" } } } }),
    },
  },
}));

const initial = [
  { id: "a", text: "Physics", day: "Monday", done: false },
  { id: "b", text: "Chemistry", day: "Tuesday", done: false },
  { id: "c", text: "English", day: "Tuesday", done: false },
];
const hitTest = vi.fn();

function touch(target: Element | Window, type: string, x: number, y: number) {
  const event = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true });
  Object.defineProperties(event, { pointerId: { value: 1 }, pointerType: { value: "touch" }, isPrimary: { value: true } });
  fireEvent(target, event);
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("app_todos_v1", JSON.stringify(initial));
  api.pull.mockReset().mockResolvedValue(null);
  api.push.mockReset().mockResolvedValue(true);
  hitTest.mockReset();
  Object.defineProperty(document, "elementFromPoint", { configurable: true, value: hitTest });
});
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(document, "elementFromPoint");
});

describe("Study calendar", () => {
  it("changes a task's day and position with a touch drag while the initial sync is in flight", async () => {
    let resolvePull!: (items: typeof initial) => void;
    api.pull.mockReturnValueOnce(new Promise((resolve) => { resolvePull = resolve; }));
    render(<TodoList language="en" onBack={vi.fn()} />);
    await waitFor(() => expect(api.pull).toHaveBeenCalled());
    const destination = screen.getByRole("region", { name: "Tuesday" });
    const rows = within(destination).getAllByRole("listitem");
    rows.forEach((row, index) => {
      vi.spyOn(row, "getBoundingClientRect").mockReturnValue({ top: 90 + 50 * index, height: 40 } as DOMRect);
    });
    hitTest.mockReturnValue(destination);
    const grip = screen.getByRole("button", { name: "Task options · Physics" });
    touch(grip, "pointerdown", 75, 170);
    touch(window, "pointermove", 120, 124);
    touch(window, "pointerup", 120, 124);
    expect(within(destination).getAllByRole("listitem").map((item) => item.textContent))
      .toEqual(["Chemistry", "Physics", "English"]);
    await act(async () => resolvePull(initial));
    await waitFor(() => expect(api.push).toHaveBeenCalledOnce());
    expect(api.push.mock.calls[0][0].map((item) => [item.id, item.day]))
      .toEqual([["b", "Tuesday"], ["a", "Tuesday"], ["c", "Tuesday"]]);
    expect(JSON.parse(localStorage.getItem("app_todos_v1")!)).toEqual(api.push.mock.calls[0][0]);
  });

  it("lets the user move a task to another day and reorder it without dragging", async () => {
    render(<TodoList language="en" onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Task options · Physics" }));
    fireEvent.change(screen.getByLabelText("Move to day"), { target: { value: "Tuesday" } });
    const day = within(screen.getByRole("region", { name: "Tuesday" }));
    expect(day.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Chemistry", "English", "Physics"]);
    fireEvent.click(day.getByRole("button", { name: "Task options · Physics" }));
    fireEvent.click(screen.getByRole("button", { name: "Move up" }));
    expect(day.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Chemistry", "Physics", "English"]);
    await waitFor(() => expect(api.push).toHaveBeenCalled());
  });
});
