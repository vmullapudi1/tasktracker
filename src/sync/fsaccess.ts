// Wraps the File System Access API with a tiny IndexedDB store for
// persisting the directory handle across sessions. Browser support is
// Chrome / Edge / Opera; Safari and Firefox return false from
// `isFsAccessSupported()` and the app falls back to manual import/export.

export const SNAPSHOT_FILENAME = 'phd-dashboard.json';

const HANDLE_DB = 'phd-dashboard-fs';
const HANDLE_STORE = 'handles';
const HANDLE_KEY = 'syncFolder';

export function isFsAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

function openHandleDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(HANDLE_DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(HANDLE_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withHandleStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>,
): Promise<T> {
  const db = await openHandleDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(HANDLE_STORE, mode);
    const store = tx.objectStore(HANDLE_STORE);
    let result: T;
    Promise.resolve(fn(store)).then((r) => {
      if (r && typeof (r as IDBRequest).onsuccess !== 'undefined') {
        (r as IDBRequest).onsuccess = () => {
          result = (r as IDBRequest<T>).result;
        };
        (r as IDBRequest).onerror = () => reject((r as IDBRequest).error);
      } else {
        result = r as T;
      }
    });
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function pickFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFsAccessSupported()) return null;
  try {
    const handle = await (window as unknown as {
      showDirectoryPicker: (opts: { mode: 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
    }).showDirectoryPicker({ mode: 'readwrite' });
    await persistHandle(handle);
    return handle;
  } catch {
    return null;
  }
}

async function persistHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  await withHandleStore('readwrite', (store) => store.put(handle, HANDLE_KEY));
}

export async function restoreHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await withHandleStore<FileSystemDirectoryHandle | undefined>(
      'readonly',
      (store) => store.get(HANDLE_KEY) as IDBRequest<FileSystemDirectoryHandle | undefined>,
    );
    return handle ?? null;
  } catch {
    return null;
  }
}

export async function clearHandle(): Promise<void> {
  await withHandleStore('readwrite', (store) => store.delete(HANDLE_KEY));
}

type PermissionMode = 'read' | 'readwrite';
type PermissionState = 'granted' | 'denied' | 'prompt';

interface HandleWithPermissions extends FileSystemDirectoryHandle {
  queryPermission(opts: { mode: PermissionMode }): Promise<PermissionState>;
  requestPermission(opts: { mode: PermissionMode }): Promise<PermissionState>;
}

export async function ensurePermission(
  handle: FileSystemDirectoryHandle,
  prompt = true,
): Promise<boolean> {
  const h = handle as HandleWithPermissions;
  const opts = { mode: 'readwrite' as const };
  const cur = await h.queryPermission(opts);
  if (cur === 'granted') return true;
  if (!prompt) return false;
  const next = await h.requestPermission(opts);
  return next === 'granted';
}

export async function readSnapshotRaw(handle: FileSystemDirectoryHandle): Promise<string | null> {
  try {
    const fh = await handle.getFileHandle(SNAPSHOT_FILENAME);
    const file = await fh.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

export async function writeSnapshotRaw(
  handle: FileSystemDirectoryHandle,
  json: string,
): Promise<void> {
  const fh = await handle.getFileHandle(SNAPSHOT_FILENAME, { create: true });
  const w = await fh.createWritable();
  try {
    await w.write(json);
  } finally {
    await w.close();
  }
}

export async function readSnapshotMtime(handle: FileSystemDirectoryHandle): Promise<number | null> {
  try {
    const fh = await handle.getFileHandle(SNAPSHOT_FILENAME);
    const file = await fh.getFile();
    return file.lastModified;
  } catch {
    return null;
  }
}
