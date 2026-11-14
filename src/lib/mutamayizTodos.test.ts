import { beforeEach, describe, expect, it, vi } from "vitest";
import { pushTodos } from "./todosSync";

const api = vi.hoisted(() => ({ getUser: vi.fn(), read: vi.fn(), upsert: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: api.getUser },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: api.read }) }), upsert: api.upsert }),
  channel: () => ({ subscribe: async () => {}, send: async () => {} }), removeChannel: async () => {},
} }));
beforeEach(() => {
  vi.clearAllMocks();
  api.getUser.mockResolvedValue({ data: { user: { id: "student" } } });
  api.read.mockResolvedValue({ data: { items: [] }, error: null });
  api.upsert.mockResolvedValue({ error: null });
});

describe("approved assistant task sync", () => {
  it("retains tasks added on another device and the parent's latest wording", async () => {
    api.read.mockResolvedValue({ data: { items: [
      { id: "parent", text: "Parent's latest task", day: "Sunday", source: "parent", done: false },
      { id: "other-device", text: "Existing remote task", done: false },
    ] }, error: null });
    await pushTodos([
      { id: "parent", text: "Stale text", day: "Friday", done: true },
      { id: "new", text: "Approved plan task", done: false },
    ], "student");
    const sent = api.upsert.mock.calls[0][0].items;
    expect(sent).toContainEqual({ id: "other-device", text: "Existing remote task", done: false });
    expect(sent.find((task: { id: string }) => task.id === "parent")).toMatchObject({ text: "Parent's latest task", day: "Sunday", done: true });
    expect(sent.find((task: { id: string }) => task.id === "new").text).toBe("Approved plan task");
  });

  it("does not overwrite cloud tasks when the account copy cannot be read", async () => {
    api.read.mockResolvedValue({ data: null, error: new Error("offline") });
    await pushTodos([{ id: "new", text: "Task", done: false }], "student");
    expect(api.upsert).not.toHaveBeenCalled();
  });

  it("does not transfer one account's approved plan to another account", async () => {
    api.getUser.mockResolvedValue({ data: { user: { id: "other-account" } } });
    await pushTodos([{ id: "new", text: "Task", done: false }], "student");
    expect(api.read).not.toHaveBeenCalled(); expect(api.upsert).not.toHaveBeenCalled();
  });
});
