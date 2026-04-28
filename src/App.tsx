import { useCallback, useEffect, useState } from 'react';
import { bootstrap, getRep, getSync } from './store/bootstrap';
import { useSettings, useProjects, useTodos, usePapers } from './store/subscriptions';
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
import { GlobalSearchModal } from './screens/Search/GlobalSearchModal';

export function App() {
  const [rep, setRep] = useState<Rep | null>(null);
  const [sync, setSync] = useState<SyncController | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navigatedProjectId, setNavigatedProjectId] = useState<string | null>(null);
  const [navigatedPaperId, setNavigatedPaperId] = useState<string | null>(null);

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
  const projects = useProjects(rep);
  const todos = useTodos(rep);
  const papers = usePapers(rep);
  const syncStatus = useSyncStatus(sync);

  // Auto-open help for new users. We use a separate state to track if we've auto-opened it this session.
  const [autoHelpOpened, setAutoHelpOpened] = useState(false);
  if (rep && settings && !settings.hasSeenHelp && !autoHelpOpened && !helpOpen) {
    setAutoHelpOpened(true);
    setHelpOpen(true);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
  }, [settings.theme, settings.accentColor, settings.density, settings]);

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
  }, [rep, settings]);

  const handleSelectResult = (t: Tab, id: string) => {
    setTab(t);
    if (t === 'projects') setNavigatedProjectId(id);
    if (t === 'reading') setNavigatedPaperId(id);
  };

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
        onOpenSearch={() => setSearchOpen(true)}
        dashboardName={settings.dashboardName}
      />
      <Main tab={tab}>
        {tab === 'dashboard' && <DashboardTab rep={rep} onNav={setTab} />}
        {tab === 'calendar' && <CalendarTab rep={rep} />}
        {tab === 'kanban' && <KanbanTab rep={rep} />}
        {tab === 'insights' && <InsightsTab rep={rep} />}
        {tab === 'projects' && (
          <ProjectsTab
            rep={rep}
            navigatedId={navigatedProjectId}
            onNavigated={() => setNavigatedProjectId(null)}
          />
        )}
        {tab === 'reading' && (
          <ReadingTab
            rep={rep}
            navigatedId={navigatedPaperId}
            onNavigated={() => setNavigatedPaperId(null)}
          />
        )}
      </Main>
      {settingsOpen && <SettingsModal rep={rep} onClose={() => setSettingsOpen(false)} />}
      {helpOpen && <HelpModal onClose={handleCloseHelp} />}
      <GlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        projects={projects}
        todos={todos}
        papers={papers}
        onSelect={handleSelectResult}
      />
    </div>
  );
}
