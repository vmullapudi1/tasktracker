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
import { CalendarTab } from './screens/Calendar/CalendarTab';
import { ProjectsTab } from './screens/Projects/ProjectsTab';
import { ReadingTab } from './screens/Reading/ReadingTab';
import { KanbanTab } from './screens/Kanban/KanbanTab';
import { InsightsTab } from './screens/Insights/InsightsTab';
import { SettingsModal } from './screens/Settings/SettingsModal';
import { HelpModal } from './screens/Help/HelpModal';

export function App() {
  const [rep, setRep] = useState<Rep | null>(null);
  const [sync, setSync] = useState<SyncController | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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
    if (rep && settings && !settings.hasSeenHelp) {
      setHelpOpen(true);
    }
  }, [rep, settings?.hasSeenHelp]);

  useEffect(() => {
    const resolveTheme = () => {
      if (settings.theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return settings.theme;
    };

    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme();
      document.documentElement.dataset.density = settings.density;
      document.documentElement.style.setProperty('--accent', settings.accentColor);
    };

    apply();

    if (settings.theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => apply();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [settings.theme, settings.accentColor, settings.density]);

  const handlePickFolder = useCallback(async () => {
    if (!sync) return;
    const handle = await pickFolder();
    if (handle) await sync.setHandle(handle);
  }, [sync]);

  const handleFlushNow = useCallback(async () => {
    if (!sync) return;
    await sync.flushNow();
  }, [sync]);

  const handleCloseHelp = useCallback(() => {
    setHelpOpen(false);
    if (rep && settings && !settings.hasSeenHelp) {
      void rep.mutate.updateSettings({ hasSeenHelp: true });
    }
  }, [rep, settings?.hasSeenHelp]);

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
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        dashboardName={settings.dashboardName}
      />
      <Main tab={tab}>
        {tab === 'dashboard' && <DashboardTab rep={rep} onNav={setTab} />}
        {tab === 'calendar' && <CalendarTab rep={rep} />}
        {tab === 'kanban' && <KanbanTab rep={rep} />}
        {tab === 'insights' && <InsightsTab rep={rep} />}
        {tab === 'projects' && <ProjectsTab rep={rep} />}
        {tab === 'reading' && <ReadingTab rep={rep} />}
      </Main>
      {settingsOpen && <SettingsModal rep={rep} onClose={() => setSettingsOpen(false)} />}
      {helpOpen && <HelpModal onClose={handleCloseHelp} />}
    </div>
  );
}
