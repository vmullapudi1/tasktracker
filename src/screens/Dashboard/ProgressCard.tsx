import type { Project } from '../../data/types';
import { paletteFor } from '../../data/palette';
import { Card } from '../../ui/Card';
import { Empty } from '../../ui/Empty';
import { ProjectDot } from '../../ui/ProjectDot';

export function ProgressCard({ projects }: { projects: Project[] }) {
  const active = projects.filter((p) => p.active);
  return (
    <Card title="Long-term progress" action="active projects">
      {active.length === 0 ? (
        <Empty>No active projects yet.</Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {active.map((p) => (
            <ProgressRow key={p.id} project={p} />
          ))}
        </div>
      )}
    </Card>
  );
}

export function ProgressRow({ project }: { project: Project }) {
  const pal = paletteFor(project.paletteIdx);
  const total = project.phases.length;
  const doneCount = project.phases.filter((ph) => ph.done).length;
  const currentPhaseIdx = project.phases.findIndex((ph) => !ph.done);

  let fractionalProgress = doneCount;
  if (currentPhaseIdx >= 0) {
    const cur = project.phases[currentPhaseIdx];
    const cps = cur.checkpoints ?? [];
    if (cps.length > 0) {
      fractionalProgress += cps.filter((c) => c.done).length / cps.length;
    }
  }
  const pct = total > 0 ? Math.round((fractionalProgress / total) * 100) : 0;
  const phaseLabel = Math.min(currentPhaseIdx === -1 ? total : currentPhaseIdx + 1, total);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ProjectDot project={project} size={9} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{project.name}</span>
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>
          {pct}% · phase {phaseLabel} of {total}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
        {project.phases.map((phase) => {
          const cps = phase.checkpoints ?? [];
          const cpsDone = cps.filter((c) => c.done).length;
          const cpsTotal = cps.length || 1;
          const phaseFrac = phase.done ? 1 : cps.length ? cpsDone / cpsTotal : 0;
          return (
            <div
              key={phase.id}
              title={`${phase.name} — ${cpsDone}/${cps.length} checkpoints`}
              style={{
                flex: 1,
                height: 10,
                borderRadius: 3,
                background: 'var(--rule)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: pal.fg,
                  opacity: phase.done ? 1 : 0.55,
                  width: `${phaseFrac * 100}%`,
                  transition: 'width .3s',
                }}
              />
              {cps.map((cp, j) => (
                <div
                  key={cp.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${((j + 1) / cps.length) * 100}%`,
                    width: 1,
                    background: 'var(--paper)',
                    opacity: j === cps.length - 1 ? 0 : 0.7,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 3,
          fontSize: 10,
          color: 'var(--ink-3)',
          fontFamily: 'var(--mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {project.phases.map((phase) => (
          <div
            key={phase.id}
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: phase.done ? pal.fg : 'var(--ink-3)',
              fontWeight: phase.done ? 500 : 400,
            }}
          >
            {phase.name}
          </div>
        ))}
      </div>
    </div>
  );
}
