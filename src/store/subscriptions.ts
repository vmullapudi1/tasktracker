import { useEffect, useState } from 'react';
import type { ReadTransaction } from 'replicache';
import type { Block, Paper, Project, Settings, Todo } from '../data/types';
import { DEFAULT_SETTINGS } from '../data/types';
import { KEY, PREFIX } from './schema';
import type { Rep } from './replicache';

function useSubscribe<T>(rep: Rep | null, query: (tx: ReadTransaction) => Promise<T>, fallback: T, deps: unknown[] = []): T {
  const [val, setVal] = useState<T>(fallback);
  useEffect(() => {
    if (!rep) return;
    const unsub = rep.subscribe(query, {
      onData: (v) => setVal(v),
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rep, ...deps]);
  return val;
}

async function scanAll<T>(tx: ReadTransaction, prefix: string): Promise<T[]> {
  const out: T[] = [];
  for await (const v of tx.scan({ prefix }).values()) {
    out.push(v as T);
  }
  return out;
}

export function useProjects(rep: Rep | null): Project[] {
  return useSubscribe(rep, (tx) => scanAll<Project>(tx, PREFIX.project), []);
}

export function useBlocks(rep: Rep | null): Block[] {
  return useSubscribe(rep, (tx) => scanAll<Block>(tx, PREFIX.block), []);
}

export function usePapers(rep: Rep | null): Paper[] {
  return useSubscribe(rep, (tx) => scanAll<Paper>(tx, PREFIX.paper), []);
}

export function useTodos(rep: Rep | null): Todo[] {
  return useSubscribe(rep, (tx) => scanAll<Todo>(tx, PREFIX.todo), []);
}

export function useSettings(rep: Rep | null): Settings {
  return useSubscribe(
    rep,
    async (tx) => ((await tx.get(KEY.settings)) as Settings | undefined) ?? { ...DEFAULT_SETTINGS },
    { ...DEFAULT_SETTINGS },
  );
}
