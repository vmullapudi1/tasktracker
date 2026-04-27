import { seedData } from '../data/seed';
import { createRep, type Rep } from './replicache';
import { PREFIX } from './schema';
import { SyncController } from '../sync/sync-controller';

let _rep: Rep | null = null;
let _sync: SyncController | null = null;
let _ready: Promise<void> | null = null;

async function isStoreEmpty(rep: Rep): Promise<boolean> {
  return rep.query(async (tx) => {
    for await (const _ of tx.scan({ prefix: PREFIX.project }).values()) {
      return false;
    }
    return true;
  });
}

async function seedIfEmpty(rep: Rep): Promise<void> {
  if (!(await isStoreEmpty(rep))) return;
  await rep.mutate.importSnapshot(seedData());
}

export function getRep(): Rep {
  if (!_rep) _rep = createRep();
  return _rep;
}

export function getSync(): SyncController {
  if (!_sync) _sync = new SyncController(getRep());
  return _sync;
}

export function bootstrap(): Promise<void> {
  if (_ready) return _ready;
  _ready = (async () => {
    const rep = getRep();
    await seedIfEmpty(rep);
    await getSync().init();
  })();
  return _ready;
}
