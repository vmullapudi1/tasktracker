import type { ReadTransaction } from 'replicache';
import type { AppData, Block, Paper, Project, Settings, Todo } from '../data/types';
import { DEFAULT_SETTINGS } from '../data/types';
import { KEY, PREFIX } from './schema';
import type { Rep } from './replicache';
import type { PendingEntry } from './schema';

export interface SnapshotFile {
  schemaVersion: 1;
  exportedAt: number;
  exportedFromDevice: string;
  hash: string;
  data: AppData;
}

async function scanPrefix<T>(tx: ReadTransaction, prefix: string): Promise<T[]> {
  const out: T[] = [];
  for await (const v of tx.scan({ prefix }).values()) {
    out.push(v as T);
  }
  return out;
}

export async function readAppData(rep: Rep): Promise<AppData> {
  return rep.query(async (tx) => {
    const [projects, blocks, papers, todos] = await Promise.all([
      scanPrefix<Project>(tx, PREFIX.project),
      scanPrefix<Block>(tx, PREFIX.block),
      scanPrefix<Paper>(tx, PREFIX.paper),
      scanPrefix<Todo>(tx, PREFIX.todo),
    ]);
    const settings = ((await tx.get(KEY.settings)) as Settings | undefined) ?? { ...DEFAULT_SETTINGS };
    return { projects, blocks, papers, todos, settings };
  });
}

export async function readPending(rep: Rep): Promise<PendingEntry[]> {
  return rep.query(async (tx) => {
    const out: PendingEntry[] = [];
    for await (const v of tx.scan({ prefix: KEY.pendingPrefix }).values()) {
      out.push(v as unknown as PendingEntry);
    }
    return out.sort((a, b) => a.seq - b.seq);
  });
}

export async function hashAppData(data: AppData): Promise<string> {
  // Stable JSON: sort top-level arrays by id so the hash is stable across runs.
  const stable = {
    projects: [...data.projects].sort((a, b) => a.id.localeCompare(b.id)),
    blocks: [...data.blocks].sort((a, b) => a.id.localeCompare(b.id)),
    papers: [...data.papers].sort((a, b) => a.id.localeCompare(b.id)),
    todos: [...data.todos].sort((a, b) => a.id.localeCompare(b.id)),
    settings: data.settings,
  };
  const enc = new TextEncoder().encode(JSON.stringify(stable));
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function buildSnapshotFile(rep: Rep, deviceId: string): Promise<SnapshotFile> {
  const data = await readAppData(rep);
  const hash = await hashAppData(data);
  return {
    schemaVersion: 1,
    exportedAt: Date.now(),
    exportedFromDevice: deviceId,
    hash,
    data,
  };
}

export function isSnapshotFile(value: unknown): value is SnapshotFile {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return v.schemaVersion === 1 && typeof v.hash === 'string' && typeof v.data === 'object';
}
