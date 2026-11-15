import { useCallback, useEffect, useRef, useState } from "react";
import {
  createNotebook,
  NotebookDocument,
  parseNotebook,
  STORAGE_KEY,
} from "./model";

type Change = (document: NotebookDocument) => NotebookDocument;
type SaveStatus = "loading" | "saving" | "saved" | "error";
type SavedSnapshot = { document: NotebookDocument; savedAt: number };
let database: Promise<IDBDatabase> | undefined;
let lastSaveTime = 0;
const saveTime = () => (lastSaveTime = Math.max(Date.now(), lastSaveTime + 1));
function openDatabase(): Promise<IDBDatabase> {
  if (!database)
    database = new Promise((resolve, reject) => {
      const request = indexedDB.open("tamayzak-stationery", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("notebooks");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        database = undefined;
        reject(request.error);
      };
      request.onblocked = () => {
        database = undefined;
        reject(new Error("Notebook storage is blocked by another tab."));
      };
    });
  return database;
}
async function readDatabase(): Promise<unknown> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db
      .transaction("notebooks")
      .objectStore("notebooks")
      .get(STORAGE_KEY);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function readSnapshot(raw: unknown): SavedSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const snapshot = raw as Partial<SavedSnapshot>;
  const document = parseNotebook(snapshot.document ?? raw);
  return document
    ? {
        document,
        savedAt: typeof snapshot.savedAt === "number" ? snapshot.savedAt : 0,
      }
    : null;
}
function writeLocal(snapshot: SavedSnapshot) {
  const raw = localStorage.getItem(STORAGE_KEY);
  let previous: SavedSnapshot | null = null;
  try {
    previous = raw ? readSnapshot(JSON.parse(raw)) : null;
  } catch {
    /* A healthy IndexedDB copy has already been loaded. */
  }
  if (!previous || previous.savedAt <= snapshot.savedAt)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
export async function saveNotebook(
  document: NotebookDocument,
  savedAt = saveTime(),
): Promise<void> {
  const snapshot = { document, savedAt };
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("notebooks", "readwrite");
      tx.objectStore("notebooks").put(snapshot, STORAGE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    // The synchronous copy also protects edits when a browser closes immediately.
    try {
      writeLocal(snapshot);
    } catch {
      /* IndexedDB has saved the full notebook. */
    }
  } catch {
    writeLocal(snapshot);
  }
}
export async function loadNotebook(): Promise<NotebookDocument> {
  let local: SavedSnapshot | null = null;
  let stored: SavedSnapshot | null = null;
  let unreadable = false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      local = readSnapshot(JSON.parse(raw));
      if (!local) unreadable = true;
    }
  } catch (error) {
    if (error instanceof SyntaxError) unreadable = true;
  }
  try {
    const raw = await readDatabase();
    if (raw) {
      stored = readSnapshot(raw);
      if (!stored) unreadable = true;
    }
  } catch {
    /* Private browsing or blocked IndexedDB can still use localStorage. */
  }
  // Prefer the newest healthy copy. Large notebooks may outgrow localStorage
  // while their complete IndexedDB copy continues to save successfully.
  const newest =
    local && stored
      ? local.savedAt > stored.savedAt
        ? local
        : stored
      : (local ?? stored);
  if (newest) {
    lastSaveTime = Math.max(lastSaveTime, newest.savedAt);
    return newest.document;
  }
  if (unreadable)
    throw new Error(
      "The saved notebook could not be read. Its data has been kept.",
    );
  return createNotebook();
}

export function useNotebook() {
  const [document, setDocument] = useState<NotebookDocument | null>(null);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [, renderHistory] = useState(0);
  const current = useRef<NotebookDocument | null>(null);
  const history = useRef<{
    past: NotebookDocument[];
    future: NotebookDocument[];
  }>({ past: [], future: [] });
  const transaction = useRef<NotebookDocument | null>(null);
  const saveQueue = useRef(Promise.resolve());
  const loaded = useRef(false);

  useEffect(() => {
    let active = true;
    loadNotebook()
      .then((value) => {
        if (active) {
          current.current = value;
          setDocument(value);
          loaded.current = true;
          setStatus("saved");
        }
      })
      .catch((error) => {
        if (active) {
          setLoadError(String(error.message || error));
          setStatus("error");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(
    (value: NotebookDocument, savedAt = saveTime()) => {
      setStatus("saving");
      saveQueue.current = saveQueue.current
        .catch(() => {})
        .then(() => saveNotebook(value, savedAt))
        .then(() => {
          if (current.current === value) setStatus("saved");
        })
        .catch(() => setStatus("error"));
      return saveQueue.current;
    },
    [],
  );

  useEffect(() => {
    if (!document || !loaded.current) return;
    setStatus("saving");
    const timer = window.setTimeout(() => void persist(document), 350);
    return () => window.clearTimeout(timer);
  }, [document, persist]);

  useEffect(() => {
    const flush = () => {
      if (!current.current || !loaded.current) return;
      const savedAt = saveTime();
      try {
        writeLocal({ document: current.current, savedAt });
      } catch {
        /* Fall back to the queued IndexedDB write. */
      }
      void persist(current.current, savedAt);
    };
    const hidden = () => {
      if (window.document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    window.document.addEventListener("visibilitychange", hidden);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      window.document.removeEventListener("visibilitychange", hidden);
    };
  }, [persist]);

  const remember = (value: NotebookDocument) => {
    history.current.past = [...history.current.past.slice(-79), value];
    history.current.future = [];
    renderHistory((n) => n + 1);
  };
  const change = useCallback((update: Change, track = true) => {
    const before = current.current;
    if (!before) return;
    const after = update(before);
    if (before === after) return;
    if (track && !transaction.current) remember(before);
    current.current = after;
    setDocument(after);
  }, []);
  const begin = useCallback(() => {
    if (!transaction.current) transaction.current = current.current;
  }, []);
  const commit = useCallback(() => {
    if (transaction.current && transaction.current !== current.current)
      remember(transaction.current);
    transaction.current = null;
  }, []);
  const cancel = useCallback(() => {
    if (transaction.current) {
      current.current = transaction.current;
      setDocument(transaction.current);
    }
    transaction.current = null;
  }, []);
  const undo = useCallback(() => {
    commit();
    const previous = history.current.past.pop();
    if (!previous || !current.current) return;
    history.current.future.push(current.current);
    current.current = previous;
    setDocument(previous);
    renderHistory((n) => n + 1);
  }, [commit]);
  const redo = useCallback(() => {
    commit();
    const next = history.current.future.pop();
    if (!next || !current.current) return;
    history.current.past.push(current.current);
    current.current = next;
    setDocument(next);
    renderHistory((n) => n + 1);
  }, [commit]);
  return {
    document,
    current,
    status,
    loadError,
    change,
    begin,
    commit,
    cancel,
    undo,
    redo,
    canUndo: history.current.past.length > 0,
    canRedo: history.current.future.length > 0,
    retrySave: () => current.current && persist(current.current),
  };
}
