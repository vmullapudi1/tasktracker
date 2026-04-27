import type { ReadonlyJSONValue, WriteTransaction } from 'replicache';
import type { Block, Paper, Project, Settings, Todo, AppData } from '../data/types';
import { DEFAULT_SETTINGS } from '../data/types';
import { DEFAULT_META, KEY, PREFIX } from './schema';
import type { MetaSnapshot, PendingEntry } from './schema';

// Replicache's KV API uses ReadonlyJSONValue, which is structurally
// equivalent to "anything serializable" but doesn't permit named
// interfaces without explicit index signatures. We trust our entities
// are JSON-safe (they only contain primitives, arrays, and nested
// records) and cast at the write/read boundary.
const j = <T>(v: T): ReadonlyJSONValue => v as unknown as ReadonlyJSONValue;
const r = <T>(v: ReadonlyJSONValue | undefined): T | undefined =>
  v === undefined ? undefined : (v as unknown as T);

async function getMeta(tx: WriteTransaction): Promise<MetaSnapshot> {
  return r<MetaSnapshot>(await tx.get(KEY.meta)) ?? { ...DEFAULT_META };
}

async function appendPending(tx: WriteTransaction, name: string, args: unknown): Promise<void> {
  const meta = await getMeta(tx);
  const seq = meta.pendingSeq + 1;
  await tx.set(KEY.pending(seq), j<PendingEntry>({ seq, ts: Date.now(), name, args: args as PendingEntry['args'] }));
  await tx.set(KEY.meta, j({ ...meta, pendingSeq: seq }));
}

export const mutators = {
  // ── Projects ──────────────────────────────────────────────────────────────
  async addProject(tx: WriteTransaction, project: Project): Promise<void> {
    await tx.set(KEY.project(project.id), j(project));
    await appendPending(tx, 'addProject', project);
  },
  async updateProject(tx: WriteTransaction, args: { id: string; patch: Partial<Project> }): Promise<void> {
    const existing = r<Project>(await tx.get(KEY.project(args.id)));
    if (!existing) return;
    await tx.set(KEY.project(args.id), j({ ...existing, ...args.patch }));
    await appendPending(tx, 'updateProject', args);
  },
  async deleteProject(tx: WriteTransaction, args: { id: string }): Promise<void> {
    await tx.del(KEY.project(args.id));
    await appendPending(tx, 'deleteProject', args);
  },

  // ── Blocks ────────────────────────────────────────────────────────────────
  async addBlock(tx: WriteTransaction, block: Block): Promise<void> {
    await tx.set(KEY.block(block.id), j(block));
    await appendPending(tx, 'addBlock', block);
  },
  async updateBlock(tx: WriteTransaction, args: { id: string; patch: Partial<Block> }): Promise<void> {
    const existing = r<Block>(await tx.get(KEY.block(args.id)));
    if (!existing) return;
    await tx.set(KEY.block(args.id), j({ ...existing, ...args.patch }));
    await appendPending(tx, 'updateBlock', args);
  },
  async deleteBlock(tx: WriteTransaction, args: { id: string }): Promise<void> {
    await tx.del(KEY.block(args.id));
    await appendPending(tx, 'deleteBlock', args);
  },

  // ── Papers ────────────────────────────────────────────────────────────────
  async addPaper(tx: WriteTransaction, paper: Paper): Promise<void> {
    await tx.set(KEY.paper(paper.id), j(paper));
    await appendPending(tx, 'addPaper', paper);
  },
  async updatePaper(tx: WriteTransaction, args: { id: string; patch: Partial<Paper> }): Promise<void> {
    const existing = r<Paper>(await tx.get(KEY.paper(args.id)));
    if (!existing) return;
    await tx.set(KEY.paper(args.id), j({ ...existing, ...args.patch }));
    await appendPending(tx, 'updatePaper', args);
  },
  async deletePaper(tx: WriteTransaction, args: { id: string }): Promise<void> {
    await tx.del(KEY.paper(args.id));
    await appendPending(tx, 'deletePaper', args);
  },

  // ── Todos ─────────────────────────────────────────────────────────────────
  async addTodo(tx: WriteTransaction, todo: Todo): Promise<void> {
    await tx.set(KEY.todo(todo.id), j(todo));
    await appendPending(tx, 'addTodo', todo);
  },
  async updateTodo(tx: WriteTransaction, args: { id: string; patch: Partial<Todo> }): Promise<void> {
    const existing = r<Todo>(await tx.get(KEY.todo(args.id)));
    if (!existing) return;
    await tx.set(KEY.todo(args.id), j({ ...existing, ...args.patch }));
    await appendPending(tx, 'updateTodo', args);
  },
  async deleteTodo(tx: WriteTransaction, args: { id: string }): Promise<void> {
    await tx.del(KEY.todo(args.id));
    await appendPending(tx, 'deleteTodo', args);
  },

  // Drag-todo-onto-calendar: creates a block AND marks the todo scheduled.
  async scheduleTodo(tx: WriteTransaction, args: { todoId: string; block: Block }): Promise<void> {
    const todo = r<Todo>(await tx.get(KEY.todo(args.todoId)));
    await tx.set(KEY.block(args.block.id), j(args.block));
    if (todo) {
      await tx.set(KEY.todo(todo.id), j({ ...todo, scheduled: true }));
    }
    await appendPending(tx, 'scheduleTodo', args);
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  async updateSettings(tx: WriteTransaction, patch: Partial<Settings>): Promise<void> {
    const existing = r<Settings>(await tx.get(KEY.settings)) ?? { ...DEFAULT_SETTINGS };
    await tx.set(KEY.settings, j({ ...existing, ...patch }));
    await appendPending(tx, 'updateSettings', patch);
  },

  // ── Bulk ──────────────────────────────────────────────────────────────────
  // Wipes domain entities and writes the supplied snapshot. Does NOT touch
  // pending/* or meta/* — caller manages those.
  async importSnapshot(tx: WriteTransaction, data: AppData): Promise<void> {
    for (const prefix of [PREFIX.project, PREFIX.block, PREFIX.paper, PREFIX.todo]) {
      const keys: string[] = [];
      for await (const [k] of tx.scan({ prefix }).entries()) {
        keys.push(k as string);
      }
      for (const k of keys) await tx.del(k);
    }
    for (const p of data.projects) await tx.set(KEY.project(p.id), j(p));
    for (const b of data.blocks) await tx.set(KEY.block(b.id), j(b));
    for (const p of data.papers) await tx.set(KEY.paper(p.id), j(p));
    for (const t of data.todos) await tx.set(KEY.todo(t.id), j(t));
    await tx.set(KEY.settings, j(data.settings));
  },

  async clearPending(tx: WriteTransaction): Promise<void> {
    const keys: string[] = [];
    for await (const [k] of tx.scan({ prefix: KEY.pendingPrefix }).entries()) {
      keys.push(k as string);
    }
    for (const k of keys) await tx.del(k);
    const meta = await getMeta(tx);
    await tx.set(KEY.meta, j({ ...meta, pendingSeq: 0 }));
  },

  async clearPendingThrough(tx: WriteTransaction, args: { upToSeq: number }): Promise<void> {
    const keys: string[] = [];
    for await (const [k, v] of tx.scan({ prefix: KEY.pendingPrefix }).entries()) {
      const entry = r<PendingEntry>(v);
      if (entry && entry.seq <= args.upToSeq) keys.push(k as string);
    }
    for (const k of keys) await tx.del(k);
  },

  async setMeta(tx: WriteTransaction, patch: Partial<MetaSnapshot>): Promise<void> {
    const meta = await getMeta(tx);
    await tx.set(KEY.meta, j({ ...meta, ...patch }));
  },
};

export type Mutators = typeof mutators;
