import { IDBFactory, IDBDatabase } from "fake-indexeddb";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { createNotebook, newPage, STORAGE_KEY } from "./model";
import { loadNotebook, saveNotebook } from "./useNotebook";

beforeAll(() => vi.stubGlobal("indexedDB", new IDBFactory()));
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("IndexedDB and local recovery", () => {
  it("stores all page content and settings in IndexedDB", async () => {
    const doc = createNotebook(),
      next = newPage("yellow", "grid");
    doc.pages.push(next);
    doc.currentPageId = next.id;
    await saveNotebook(doc, 100);
    localStorage.clear();
    expect(await loadNotebook()).toEqual(doc);
  });
  it("loads the newer IndexedDB copy when the local copy is old", async () => {
    const old = createNotebook(),
      latest = createNotebook();
    latest.pages[0].name = "Newest ideas";
    await saveNotebook(latest, 200);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ document: old, savedAt: 100 }),
    );
    expect(await loadNotebook()).toEqual(latest);
  });
  it("keeps saving large notebooks when localStorage reaches its quota", async () => {
    const old = createNotebook(),
      latest = createNotebook();
    latest.pages[0].name = "A large notebook";
    await saveNotebook(old, 300);
    const quota = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("Storage is full", "QuotaExceededError");
      });
    await saveNotebook(latest, 400);
    quota.mockRestore();
    expect(await loadNotebook()).toEqual(latest);
  });
  it("recovers the latest pagehide copy before an older queued write", async () => {
    const old = createNotebook(),
      latest = createNotebook();
    latest.pages[0].name = "Last-second edit";
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ document: latest, savedAt: 600 }),
    );
    await saveNotebook(old, 500);
    expect(await loadNotebook()).toEqual(latest);
  });
  it("recovers from a damaged local copy without erasing it on read", async () => {
    const healthy = createNotebook();
    await saveNotebook(healthy, 700);
    localStorage.setItem(STORAGE_KEY, "{broken");
    expect(await loadNotebook()).toEqual(healthy);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("{broken");
  });
  it("uses localStorage if IndexedDB becomes unavailable", async () => {
    const doc = createNotebook();
    vi.spyOn(IDBDatabase.prototype, "transaction").mockImplementation(() => {
      throw new DOMException("Storage is blocked", "SecurityError");
    });
    await saveNotebook(doc, 800);
    expect(await loadNotebook()).toEqual(doc);
  });
  it("reports a save failure if both storage mechanisms fail", async () => {
    vi.spyOn(IDBDatabase.prototype, "transaction").mockImplementation(() => {
      throw new Error("Database unavailable");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is full", "QuotaExceededError");
    });
    await expect(saveNotebook(createNotebook(), 900)).rejects.toThrow(
      "Storage is full",
    );
  });
});
