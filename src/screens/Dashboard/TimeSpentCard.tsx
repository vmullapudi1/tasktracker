import type { Block, Project } from '../../data/types';
import { addDays, fmtDateKey, fmtDuration, startOfWeek } from '../../data/helpers';
import { Card } from '../../ui/Card';
import { Empty } from '../../ui/Empty';
import { ProjectDot } from '../../ui/ProjectDot';
import { TimeDonut, type DonutSegment } from './TimeDonut';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function shortDate(d: Date): string {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function TimeSpentCard({ projects, blocks }: { projects: Project[]; blocks: Block[] }) {
  const monday = startOfWeek(new Date());
  const weekKeys = new Set(Array.from({ length: 7 }, (_, i) => fmtDateKey(addDays(monday, i))));
  const weekBlocks = blocks.filter((b) => weekKeys.has(b.date));

  const byProject = new Map<string, number>();
  for (const b of weekBlocks) {
    byProject.set(b.projectId, (byProject.get(b.projectId) ?? 0) + (b.end - b.start));
  }
  const total = Array.from(byProject.values()).reduce((s, x) => s + x, 0);
  const segments: DonutSegment[] = Array.from(byProject.entries())
    .map(([projectId, minutes]) => ({ projectId, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  const sunday = addDays(monday, 6);
  const range = `${shortDate(monday)} – ${shortDate(sunday)}`;

  return (
    <Card title="Time spent this week" action={range}>
      {total === 0 ? (
        <Empty style={{ padding: 60 }}>No tasks logged yet this week. Head to the calendar to log time.</Empty>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'center' }}>
          <TimeDonut segments={segments} projects={projects} total={total} />
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {segments.map((s) => {
              const proj = projects.find((p) => p.id === s.projectId);
              if (!proj) return null;
              const pct = Math.round((s.minutes / total) * 100);
              return (
                <li
                  key={s.projectId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto',
                    gap: 10,
                    alignItems: 'center',
                    fontSize: 13,
                  }}
                >
                  <ProjectDot project={proj} size={9} />
                  <span
                    style={{
                      color: 'var(--ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {proj.name}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-3)' }}>
                    {fmtDuration(s.minutes)}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                      color: 'var(--ink-2)',
                      fontWeight: 500,
                      minWidth: 32,
                      textAlign: 'right',
                    }}
                  >
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
