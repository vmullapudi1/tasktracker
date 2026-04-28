// Orchestrates startup reconciliation, debounced flushes, and beforeunload
// flushes between Replicache (canonical local store) and the OneDrive
// snapshot file picked via the File System Access API.

import type { Rep } from '../store/replicache';
import { KEY } from '../store/schema';
import type { MetaSnapshot } from '../store/schema';
import { DEFAULT_META } from '../store/schema';
import {
  buildSnapshotFile,
  hashAppData,
  isSnapshotFile,
  readAppData,
  readPending,
  type SnapshotFile,
} from '../store/snapshot';
import {
  ensurePermission,
  isFsAccessSupported,
  readSnapshotRaw,
  restoreHandle,
  writeSnapshotRaw,
} from './fsaccess';
import type { Mutators } from '../store/mutators';
import { uid } from '../data/helpers';

const DEBOUNCE_MS = 2000;

export interface SyncStatus {
  supported: boolean;
  folderConnected: boolean;
  permissionGranted: boolean;
  lastFlushedAt: number;
  pendingCount: number;
  error: string | null;
}

export type StatusListener = (status: SyncStatus) => void;

export class SyncController {
  private rep: Rep;
  private handle: FileSystemDirectoryHandle | null = null;
  private deviceId = '';
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;
  private subUnsub: (() => void) | null = null;
  private listeners = new Set<StatusListener>();
  private status: SyncStatus = {
    supported: isFsAccessSupported(),
    folderConnected: false,
    permissionGranted: false,
    lastFlushedAt: 0,
    pendingCount: 0,
    error: null,
  };

  constructor(rep: Rep) {
    this.rep = rep;
  }

  getStatus(): SyncStatus {
    return { ...this.status };
  }

  subscribe(fn: StatusListener): () => void {
    this.listeners.add(fn);
    fn(this.getStatus());
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit(): void {
    const snap = this.getStatus();
    for (const fn of this.listeners) fn(snap);
  }

  private patch(patch: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...patch };
    this.emit();
  }

  async init(): Promise<void> {
    await this.ensureDeviceId();
    if (!this.status.supported) return;
    const handle = await restoreHandle();
    if (!handle) return;
    this.handle = handle;
    this.patch({ folderConnected: true });
    const granted = await ensurePermission(handle, false);
    this.patch({ permissionGranted: granted });
    if (granted) {
      try {
        await this.reconcileFromRemote();
      } catch (e) {
        this.patch({ error: String(e) });
      }
    }
    this.subscribeForFlush();
    this.attachBeforeUnload();
  }

  async setHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    this.handle = handle;
    this.patch({ folderConnected: true, permissionGranted: true, error: null });
    try {
      await this.reconcileFromRemote();
      await this.flushNow();
    } catch (e) {
      this.patch({ error: String(e) });
    }
    this.subscribeForFlush();
  }

  hasHandle(): boolean {
    return this.handle !== null;
  }

  scheduleFlush(): void {
    if (!this.handle) return;
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flushNow().catch((e) => this.patch({ error: String(e) }));
    }, DEBOUNCE_MS);
  }

  async flushNow(): Promise<void> {
    if (!this.handle || this.flushing) return;
    if (!(await ensurePermission(this.handle, false))) return;
    this.flushing = true;
    try {
      const meta = await this.readMeta();
      const upToSeq = meta.pendingSeq;
      const snap = await buildSnapshotFile(this.rep, this.deviceId);
      if (snap.hash === meta.lastImportedSnapshotHash) {
        // No-op: state matches what's already on disk.
        await this.rep.mutate.clearPendingThrough({ upToSeq });
        this.patch({ pendingCount: 0 });
        return;
      }
      await writeSnapshotRaw(this.handle, JSON.stringify(snap, null, 2));
      await this.rep.mutate.clearPendingThrough({ upToSeq });
      await this.rep.mutate.setMeta({
        lastImportedSnapshotHash: snap.hash,
        lastFlushedAt: snap.exportedAt,
      });
      const pending = await readPending(this.rep);
      this.patch({ lastFlushedAt: snap.exportedAt, pendingCount: pending.length, error: null });
    } finally {
      this.flushing = false;
    }
  }

  private async reconcileFromRemote(): Promise<void> {
    if (!this.handle) return;
    const raw = await readSnapshotRaw(this.handle);
    if (!raw) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.patch({ error: 'Snapshot file is not valid JSON.' });
      return;
    }
    if (!isSnapshotFile(parsed)) {
      this.patch({ error: 'Snapshot file has unexpected shape.' });
      return;
    }
    const remote: SnapshotFile = parsed;
    const meta = await this.readMeta();
    if (meta.lastImportedSnapshotHash === remote.hash) {
      // Already aligned.
      return;
    }
    const localData = await readAppData(this.rep);
    const localHash = await hashAppData(localData);
    if (localHash === remote.hash) {
      // Same content, just unrecorded — record it so future writes skip.
      await this.rep.mutate.setMeta({ lastImportedSnapshotHash: remote.hash });
      return;
    }
    // Read pending mutations, replace state with remote, replay pending.
    const pending = await readPending(this.rep);
    await this.rep.mutate.importSnapshot(remote.data);
    await this.rep.mutate.clearPending();
    for (const p of pending) {
      const fn = (this.rep.mutate as unknown as Record<string, (args: unknown) => Promise<void>>)[p.name];
      if (typeof fn !== 'function') continue;
      try {
        await fn(p.args);
      } catch {
        // Skip invalid replay (e.g. references a deleted entity).
      }
    }
    await this.rep.mutate.setMeta({ lastImportedSnapshotHash: remote.hash });
  }

  private subscribeForFlush(): void {
    if (this.subUnsub) return;
    this.subUnsub = this.rep.subscribe(
      async (tx) => {
        const scanner = tx.scan({ prefix: KEY.pendingPrefix }).values();
        let count = 0;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of scanner) {
          count++;
        }
        return count;
      },
      {
        onData: (n) => {
          this.patch({ pendingCount: n });
          if (n > 0) this.scheduleFlush();
        },
      },
    );
  }

  private async ensureDeviceId(): Promise<void> {
    const meta = await this.readMeta();
    if (meta.deviceId) {
      this.deviceId = meta.deviceId;
      return;
    }
    const id = uid() + uid();
    await this.rep.mutate.setMeta({ deviceId: id });
    this.deviceId = id;
  }

  private async readMeta(): Promise<MetaSnapshot> {
    return this.rep.query(async (tx) => {
      const m = (await tx.get(KEY.meta)) as MetaSnapshot | undefined;
      return m ?? { ...DEFAULT_META };
    });
  }

  private beforeUnload = (): void => {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    // Fire-and-forget; we have no way to await synchronously here.
    this.flushNow();
  };

  private attachBeforeUnload(): void {
    window.addEventListener('beforeunload', this.beforeUnload);
  }
}

export type { Mutators };
