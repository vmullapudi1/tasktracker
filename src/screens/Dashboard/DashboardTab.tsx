import type { Rep } from '../../store/replicache';
import type { Tab } from '../../layout/Sidebar';
import { useBlocks, usePapers, useProjects, useTodos } from '../../store/subscriptions';
import { TimeSpentCard } from './TimeSpentCard';
import { ProgressCard } from './ProgressCard';
import { RecentPapersCard } from './RecentPapersCard';
import { TodosCard } from './TodosCard';

export function DashboardTab({ rep, onNav }: { rep: Rep | null; onNav: (tab: Tab) => void }) {
  const projects = useProjects(rep);
  const blocks = useBlocks(rep);
  const papers = usePapers(rep);
  const todos = useTodos(rep);

  return (
    <div
      className="dashboard-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: 'var(--section-gap)',
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--section-gap)' }}>
        <TimeSpentCard projects={projects} blocks={blocks} />
        <ProgressCard projects={projects} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--section-gap)' }}>
        <RecentPapersCard papers={papers} projects={projects} onGoToReading={() => onNav('reading')} />
        <TodosCard rep={rep} todos={todos} projects={projects} />
      </div>
    </div>
  );
}
