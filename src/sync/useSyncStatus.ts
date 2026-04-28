import { useEffect, useState } from 'react';
import type { SyncController, SyncStatus } from './sync-controller';

const INITIAL: SyncStatus = {
  supported: false,
  folderConnected: false,
  permissionGranted: false,
  lastFlushedAt: 0,
  pendingCount: 0,
  error: null,
};

export function useSyncStatus(sync: SyncController | null): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(() => sync?.getStatus() ?? INITIAL);
  useEffect(() => {
    if (!sync) return;
    return sync.subscribe(setStatus);
  }, [sync]);
  return status;
}
