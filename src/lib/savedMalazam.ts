export type SavedMalzama = {
  key: string; owner: string; id: string; name: string; subject: string;
  topic: string; cover_path: string; savedAt: number; page: number;
};
export type MalzamaMetadata = Pick<SavedMalzama, "id" | "name" | "subject" | "topic" | "cover_path">;
const keyFor = (owner: string, id: string) => `${owner}:${id}`;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(new Error("الحفظ غير متاح في هذا المتصفح.")); return; }
    const request = indexedDB.open("tamayzak-saved-malazam", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("metadata", { keyPath: "key" }).createIndex("owner", "owner");
      request.result.createObjectStore("files", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("أغلق تبويبات تميزك القديمة ثم أعد المحاولة."));
  });
}

async function transact<T>(stores: string[], mode: IDBTransactionMode, work: (tx: IDBTransaction, result: (value: T) => void) => void): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let value: T;
    const tx = db.transaction(stores, mode);
    tx.oncomplete = () => { db.close(); resolve(value); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error ?? new Error("تعذر حفظ الملف. تحقق من مساحة الجهاز.")); };
    try { work(tx, (next) => { value = next; }); } catch (error) { tx.abort(); db.close(); reject(error); }
  });
}

export function listSavedMalazam(owner: string) {
  return transact<SavedMalzama[]>(["metadata"], "readonly", (tx, done) => {
    const request = tx.objectStore("metadata").index("owner").getAll(owner);
    request.onsuccess = () => done((request.result as SavedMalzama[]).sort((a, b) => b.savedAt - a.savedAt));
  });
}

export function getSavedMalzama(owner: string, id: string) {
  return transact<Blob | null>(["files"], "readonly", (tx, done) => {
    const request = tx.objectStore("files").get(keyFor(owner, id));
    request.onsuccess = () => done(request.result?.blob ?? null);
  });
}

export function saveMalzama(owner: string, item: MalzamaMetadata, blob: Blob) {
  return transact<SavedMalzama>(["metadata", "files"], "readwrite", (tx, done) => {
    const record: SavedMalzama = { ...item, key: keyFor(owner, item.id), owner, savedAt: Date.now(), page: 1 };
    tx.objectStore("files").put({ key: record.key, blob });
    tx.objectStore("metadata").put(record);
    done(record);
  });
}

export function removeSavedMalzama(owner: string, id: string) {
  return transact<void>(["metadata", "files"], "readwrite", (tx) => {
    const key = keyFor(owner, id);
    tx.objectStore("metadata").delete(key);
    tx.objectStore("files").delete(key);
  });
}

export function saveMalzamaPage(owner: string, id: string, page: number) {
  return transact<void>(["metadata"], "readwrite", (tx) => {
    const store = tx.objectStore("metadata");
    const request = store.get(keyFor(owner, id));
    request.onsuccess = () => { if (request.result) store.put({ ...request.result, page }); };
  });
}
