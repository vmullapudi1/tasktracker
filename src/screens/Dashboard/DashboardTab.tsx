import type { Rep } from '../../store/replicache';
import type { Tab } from '../../layout/Sidebar';
import { useBlocks, usePapers, useProjects, useTodos } from '../../store/subscriptions';

export function DashboardTab({ rep, onNav: _onNav }: { rep: Rep | null; onNav: (tab: Tab) => void }) {
  const projects = useProjects(rep);
  const blocks = useBlocks(rep);
  const papers = usePapers(rep);
  const todos = useTodos(rep);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: 20,
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Placeholder title="Time spent this week" detail={`${blocks.length} blocks · ${projects.length} projects`} />
        <Placeholder title="Long-term progress" detail={`${projects.filter((p) => p.active).length} active projects`} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Placeholder title="Recent reading" detail={`${papers.filter((p) => p.read).length} read`} />
        <Placeholder title="To-do" detail={`${todos.filter((t) => !t.done).length} open`} />
      </div>
    </div>
  );
}

function Placeholder({ title, detail }: { title: string; detail: string }) {
  return (
    <section
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 10,
        padding: 20,
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, margin: 0, color: 'var(--ink)' }}>
        {title}
      </h2>
      <span style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic' }}>{detail}</span>
    </section>
  );
}
