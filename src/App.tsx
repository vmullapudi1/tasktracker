import { useCallback, useEffect, useState } from 'react';
import { bootstrap, getRep, getSync } from './store/bootstrap';
import { useSettings } from './store/subscriptions';
import { useSyncStatus } from './sync/useSyncStatus';
import { pickFolder } from './sync/fsaccess';
import type { Rep } from './store/replicache';
import type { SyncController } from './sync/sync-controller';
import { Sidebar, type Tab } from './layout/Sidebar';
import { Main } from './layout/Main';
import { DashboardTab } from './screens/Dashboard/DashboardTab';

export function App() {
  const [rep, setRep] = useState<Rep | null>(null);
  const [sync, setSync] = useState<SyncController | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    let mounted = true;
    bootstrap()
      .then(() => {
        if (!mounted) return;
        setRep(getRep());
        setSync(getSync());
      })
      .catch((e) => console.error('bootstrap failed', e));
    return () => {
      mounted = false;
    };
  }, []);

  const settings = useSettings(rep);
  const syncStatus = useSyncStatus(sync);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light';
    document.documentElement.style.setProperty('--accent', `oklch(0.5 0.13 ${settings.accentHue})`);
  }, [settings.darkMode, settings.accentHue]);

  const handlePickFolder = useCallback(async () => {
    if (!sync) return;
    const handle = await pickFolder();
    if (handle) await sync.setHandle(handle);
  }, [sync]);

  const handleFlushNow = useCallback(async () => {
    if (!sync) return;
    await sync.flushNow();
  }, [sync]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '212px 1fr',
        height: '100vh',
        minHeight: 0,
      }}
    >
      <Sidebar
        current={tab}
        onSelect={setTab}
        sync={syncStatus}
        onPickFolder={handlePickFolder}
        onFlushNow={handleFlushNow}
      />
      <Main tab={tab}>
        {tab === 'dashboard' && <DashboardTab rep={rep} onNav={setTab} />}
        {tab === 'calendar' && <Stub label="Calendar coming next." />}
        {tab === 'projects' && <Stub label="Projects coming next." />}
        {tab === 'reading' && <Stub label="Reading coming next." />}
      </Main>
    </div>
  );
}

function Stub({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '60px 20px',
        textAlign: 'center',
        color: 'var(--ink-3)',
        fontStyle: 'italic',
        fontSize: 13,
      }}
    >
      {label}
    </div>
  );
}
