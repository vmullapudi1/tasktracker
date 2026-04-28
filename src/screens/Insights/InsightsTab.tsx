import { useMemo } from 'react';
import type { Rep } from '../../store/replicache';
import { useBlocks, usePapers, useProjects, useTodos } from '../../store/subscriptions';
import { Card } from '../../ui/Card';

export function InsightsTab({ rep }: { rep: Rep | null }) {
  const projects = useProjects(rep);
  const blocks = useBlocks(rep);
  const papers = usePapers(rep);
  const todos = useTodos(rep);

  const stats = useMemo(() => {
    const totalHoursLogged = projects.reduce((s, p) => s + (p.hoursLogged || 0), 0);
    const totalTargetHours = projects.reduce((s, p) => s + (p.targetHours || 0), 0);
    const papersRead = papers.filter((p) => p.read).length;
    const todosDone = todos.filter((t) => t.done).length;
    const progressFrac = totalTargetHours > 0 ? totalHoursLogged / totalTargetHours : 0;

    return {
      totalHoursLogged,
      totalTargetHours,
      papersRead,
      todosDone,
      progressFrac
    };
  }, [projects, papers, todos]);

  const projectsSummary = projects.map(p => {
    const pBlocks = blocks.filter(b => b.projectId === p.id);
    const actualHours = pBlocks.reduce((s, b) => s + (b.end - b.start) / 60, 0);
    return {
      ...p,
      actualHours
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%', overflowY: 'auto' }}>
      <h2 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)' }}>Research Insights</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Logged Hours" value={stats.totalHoursLogged.toFixed(1)} sub={`of ${stats.totalTargetHours}h`} />
        <StatCard label="Papers Read" value={stats.papersRead} />
        <StatCard label="Tasks Done" value={stats.todosDone} />
        <StatCard label="Overall Progress" value={`${(stats.progressFrac * 100).toFixed(0)}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card title="Hours by Project">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {projectsSummary.map(p => (
              <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                  <span>{p.name}</span>
                  <span>{p.hoursLogged}h</span>
                </div>
                <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'var(--accent)', 
                    width: `${Math.min(100, (p.hoursLogged / (p.targetHours || 1)) * 100)}%` 
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent Velocity">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: 'var(--ink-3)', fontSize: 13 }}>
            Activity heatmap and velocity charts coming soon.
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: 'var(--paper)', padding: 20, borderRadius: 12, border: '1px solid var(--rule)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8, letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--serif)' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{sub}</div>}
      </div>
    </div>
  );
}
