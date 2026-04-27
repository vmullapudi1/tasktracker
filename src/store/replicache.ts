import { Replicache, TEST_LICENSE_KEY } from 'replicache';
import { mutators, type Mutators } from './mutators';

export type Rep = Replicache<Mutators>;

const LICENSE_KEY =
  (import.meta.env.VITE_REPLICACHE_LICENSE_KEY as string | undefined) ?? TEST_LICENSE_KEY;

export function createRep(): Rep {
  return new Replicache<Mutators>({
    name: 'phd-dashboard',
    licenseKey: LICENSE_KEY,
    mutators,
    // Local-only: no push/pull URLs. Cross-device sync happens via the
    // OneDrive snapshot file written by sync-controller.ts.
    pullInterval: null,
  });
}
