export const KEY = {
  project: (id: string) => `project/${id}`,
  block: (id: string) => `block/${id}`,
  paper: (id: string) => `paper/${id}`,
  todo: (id: string) => `todo/${id}`,
  highlight: (id: string) => `highlight/${id}`,
  settings: 'settings/user',
  meta: 'meta/snapshot',
  pending: (seq: number) => `pending/${String(seq).padStart(12, '0')}`,
  pendingPrefix: 'pending/',
};

export const PREFIX = {
  project: 'project/',
  block: 'block/',
  paper: 'paper/',
  todo: 'todo/',
  highlight: 'highlight/',
} as const;

export interface MetaSnapshot {
  lastImportedSnapshotHash: string | null;
  lastFlushedAt: number;
  deviceId: string;
  pendingSeq: number;
}

export interface PendingEntry {
  seq: number;
  ts: number;
  name: string;
  args: unknown;
}

export const DEFAULT_META: MetaSnapshot = {
  lastImportedSnapshotHash: null,
  lastFlushedAt: 0,
  deviceId: '',
  pendingSeq: 0,
};
