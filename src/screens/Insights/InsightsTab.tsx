import { useMemo, useState } from 'react';
import type { Rep } from '../../store/replicache';
import { useBlocks, useProjects, useTodos } from '../../store/subscriptions';
import { Card } from '../../ui/Card';
import { fmtDateKey, parseDateKey, addDays } from '../../data/helpers';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';

type Preset = '7d' | '30d' | 'all' | 'custom';

export function InsightsTab({ rep }: { rep: Rep | null }) {
  const projects = useProjects(rep);
  const blocks = useBlocks(rep);
  const todos = useTodos(rep);

  const [preset, setPreset] = useState<Preset>('7d');
  const [start, setStart] = useState(fmtDateKey(addDays(new Date(), -7)));
  const [end, setEnd] = useState(fmtDateKey(new Date()));

  const handlePresetChange = (p: Preset) => {
    setPreset(p);
    const now = new Date();
    if (p === '7d') {
      setStart(fmtDateKey(addDays(now, -7)));
      setEnd(fmtDateKey(now));
    } else if (p === '30d') {
      setStart(fmtDateKey(addDays(now, -30)));
      setEnd(fmtDateKey(now));
    } else if (p === 'all') {
      setStart('2020-01-01');
      setEnd(fmtDateKey(now));
    }
  };

  const filteredBlocks = useMemo(() => {
    return blocks.filter(b => b.date >= start && b.date <= end);
  }, [blocks, start, end]);

  const filteredTodos = useMemo(() => {
    return todos.filter(t => t.due >= start && t.due <= end);
  }, [todos, start, end]);

  const rangeDays = useMemo(() => {
    const s = parseDateKey(start).getTime();
    const e = parseDateKey(end).getTime();
    return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1);
  }, [start, end]);

  const stats = useMemo(() => {
    const hours = filteredBlocks.reduce((s, b) => s + (b.end - b.start) / 60, 0);
    const doneCount = filteredTodos.filter(t => t.done).length;
    const totalCount = filteredTodos.length;
    
    // Average hours
    const avgDay = hours / rangeDays;
    const avgWeek = avgDay * 7;
    const avgMonth = avgDay * 30.44;

    // Project breakdown
    const projectHours: Record<string, number> = {};
    const projectTasks: Record<string, number> = {};
    
    filteredBlocks.forEach(b => {
      projectHours[b.projectId] = (projectHours[b.projectId] || 0) + (b.end - b.start) / 60;
    });
    
    filteredTodos.forEach(t => {
      if (t.done) {
        projectTasks[t.projectId] = (projectTasks[t.projectId] || 0) + 1;
      }
    });

    const mostWorkedPid = Object.entries(projectHours).sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostTasksPid = Object.entries(projectTasks).sort((a, b) => b[1] - a[1])[0]?.[0];

    const mostWorkedProject = projects.find(p => p.id === mostWorkedPid);
    const mostTasksProject = projects.find(p => p.id === mostTasksPid);

    return {
      hours,
      doneCount,
      totalCount,
      avgDay,
      avgWeek,
      avgMonth,
      mostWorkedProject,
      mostWorkedHours: mostWorkedPid ? projectHours[mostWorkedPid] : 0,
      mostTasksProject,
      mostTasksCount: mostTasksPid ? projectTasks[mostTasksPid] : 0,
      projectHours
    };
  }, [filteredBlocks, filteredTodos, rangeDays, projects]);

  const dailyData = useMemo(() => {
    const data: Record<string, number> = {};
    const d = parseDateKey(start);
    for (let i = 0; i < rangeDays; i++) {
      data[fmtDateKey(addDays(d, i))] = 0;
    }
    filteredBlocks.forEach(b => {
      if (data[b.date] !== undefined) data[b.date] += (b.end - b.start) / 60;
    });
    return Object.entries(data).map(([date, h]) => ({ date, h }));
  }, [filteredBlocks, start, rangeDays]);

  const maxDaily = Math.max(...dailyData.map(d => d.h), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%', overflowY: 'auto', paddingRight: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)' }}>Research Insights</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Select value={preset} onChange={v => handlePresetChange(v as Preset)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </Select>
          {preset === 'custom' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input type="date" value={start} onChange={v => setStart(v)} />
              <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>to</span>
              <Input type="date" value={end} onChange={v => setEnd(v)} />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Hours in Range" value={stats.hours.toFixed(1)} />
        <StatCard label="Avg Hours/Day" value={stats.avgDay.toFixed(1)} />
        <StatCard label="Avg Hours/Week" value={stats.avgWeek.toFixed(1)} />
        <StatCard label="Tasks Completed" value={stats.doneCount} sub={`of ${stats.totalCount}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        <Card title="Hours Over Time">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, paddingTop: 20 }}>
            {dailyData.map(d => (
              <div 
                key={d.date} 
                title={`${d.date}: ${d.h.toFixed(1)}h`}
                style={{ 
                  flex: 1, 
                  background: 'var(--accent)', 
                  height: `${(d.h / maxDaily) * 100}%`,
                  minHeight: d.h > 0 ? 2 : 0,
                  borderRadius: '2px 2px 0 0',
                  opacity: 0.8
                }} 
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>
            <span>{start}</span>
            <span>{end}</span>
          </div>
        </Card>

        <Card title="Highlights">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Highlight 
              label="Most Focused Project" 
              name={stats.mostWorkedProject?.name || 'None'} 
              value={`${stats.mostWorkedHours.toFixed(1)}h`} 
            />
            <Highlight 
              label="Top Task Producer" 
              name={stats.mostTasksProject?.name || 'None'} 
              value={`${stats.mostTasksCount} tasks`} 
            />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>Task Completion</div>
              <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: 'var(--accent)', 
                  width: `${stats.totalCount > 0 ? (stats.doneCount / stats.totalCount) * 100 : 0}%` 
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--ink-2)' }}>
                <span>{stats.totalCount > 0 ? `${((stats.doneCount / stats.totalCount) * 100).toFixed(0)}%` : '0%'}</span>
                <span>{stats.doneCount} / {stats.totalCount}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card title="Time Allocation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {projects.map(p => {
              const h = stats.projectHours[p.id] || 0;
              const pct = stats.hours > 0 ? (h / stats.hours) * 100 : 0;
              if (h === 0) return null;
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>{p.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{pct.toFixed(0)}%</div>
                  <div style={{ width: 60, height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--accent)', width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.projectHours).length === 0 && (
              <div style={{ color: 'var(--ink-3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No activity in this range.</div>
            )}
          </div>
        </Card>

        <Card title="Monthly Intensity">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <IntensityRow label="Daily Average" value={stats.avgDay.toFixed(1)} unit="h" pct={Math.min(100, (stats.avgDay / 8) * 100)} />
            <IntensityRow label="Weekly Average" value={stats.avgWeek.toFixed(1)} unit="h" pct={Math.min(100, (stats.avgWeek / 40) * 100)} />
            <IntensityRow label="Monthly Projection" value={stats.avgMonth.toFixed(0)} unit="h" pct={Math.min(100, (stats.avgMonth / 160) * 100)} />
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

function Highlight({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{name}</div>
        <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

function IntensityRow({ label, value, unit, pct }: { label: string; value: string; unit: string; pct: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: 'var(--ink-2)' }}>{label}</span>
        <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{value}{unit}</span>
      </div>
      <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: `${pct}%`, opacity: 0.6 }} />
      </div>
    </div>
  );
}
