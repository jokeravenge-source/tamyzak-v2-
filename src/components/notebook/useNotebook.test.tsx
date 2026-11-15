import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createNotebook, newPage, patchPage, STORAGE_KEY } from "./model";
import { loadNotebook, saveNotebook, useNotebook } from "./useNotebook";

beforeEach(() => localStorage.clear());
describe("notebook persistence", () => {
  it("persists and restores the complete notebook when IndexedDB is unavailable", async () => {
    const doc = createNotebook(),
      second = newPage("yellow", "lined");
    doc.pages.push(second);
    doc.currentPageId = second.id;
    await saveNotebook(doc);
    expect(await loadNotebook()).toEqual(doc);
  });
  it("does not overwrite an unreadable existing notebook", async () => {
    localStorage.setItem(STORAGE_KEY, "{broken");
    await expect(loadNotebook()).rejects.toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("{broken");
  });
});
describe("history transactions", () => {
  it("undoes and redoes one continuous drag as one action", async () => {
    const { result } = renderHook(() => useNotebook());
    await waitFor(() => expect(result.current.document).not.toBeNull());
    const initial = result.current.document;
    act(() => {
      result.current.begin();
      for (let i = 0; i < 20; i++)
        result.current.change((d) =>
          patchPage(d, (p) => ({ ...p, name: `drag ${i}` })),
        );
      result.current.commit();
    });
    expect(result.current.document?.pages[0].name).toBe("drag 19");
    act(() => result.current.undo());
    expect(result.current.document).toBe(initial);
    act(() => result.current.redo());
    expect(result.current.document?.pages[0].name).toBe("drag 19");
    act(() => result.current.undo());
    act(() =>
      result.current.change((d) =>
        patchPage(d, (p) => ({ ...p, name: "New idea" })),
      ),
    );
    expect(result.current.canRedo).toBe(false);
  });
  it("rolls back a gesture when a second touch starts a pinch", async () => {
    const { result } = renderHook(() => useNotebook());
    await waitFor(() => expect(result.current.document).not.toBeNull());
    const initial = result.current.document;
    act(() => {
      result.current.begin();
      result.current.change((d) =>
        patchPage(d, (p) => ({ ...p, name: "temporary" })),
      );
      result.current.cancel();
    });
    expect(result.current.document).toBe(initial);
    expect(result.current.canUndo).toBe(false);
  });
  it("restores a deleted page and its content through undo", async () => {
    const { result } = renderHook(() => useNotebook());
    await waitFor(() => expect(result.current.document).not.toBeNull());
    const original = result.current.document!;
    act(() =>
      result.current.change((d) => {
        const p = newPage();
        return { ...d, pages: [p], currentPageId: p.id };
      }),
    );
    act(() => result.current.undo());
    expect(result.current.document?.pages[0].items).toEqual(
      original.pages[0].items,
    );
  });
});
