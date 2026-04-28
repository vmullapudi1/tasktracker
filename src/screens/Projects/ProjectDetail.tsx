import { CSSProperties, useState } from 'react';
import type { Project } from '../../data/types';
import { paletteFor } from '../../data/palette';
import { uid, fmtDateKey } from '../../data/helpers';
import { Btn } from '../../ui/Btn';
import { EditableText } from '../../ui/EditableText';
import { Field } from '../../ui/Field';
import { Input } from '../../ui/Input';
import { Check } from '../../ui/Check';
import { Empty } from '../../ui/Empty';

export const sectionTitle: CSSProperties = {
  fontSize: 11,
  fontFamily: 'var(--mono)',
  color: 'var(--ink-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 600,
  margin: '0 0 12px',
};

function PhaseRow({
  phase,
  index,
  onUpdate,
  onDelete,
}: {
  phase: Project['phases'][number];
  index: number;
  onUpdate: (patch: Partial<Project['phases'][number]>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const cps = phase.checkpoints || [];

  const updateCp = (cpId: string, patch: Partial<NonNullable<Project['phases'][number]['checkpoints']>[number]>) =>
    onUpdate({
      checkpoints: cps.map((c) => (c.id === cpId ? { ...c, ...patch } : c)),
    });
  const addCp = () =>
    onUpdate({
      checkpoints: [...cps, { id: uid(), name: 'New checkpoint', done: false }],
    });
  const deleteCp = (cpId: string) =>
    onUpdate({
      checkpoints: cps.filter((c) => c.id !== cpId),
    });

  return (
    <li
      style={{
        border: '1px solid var(--rule)',
        borderRadius: 8,
        background: phase.done ? 'var(--surface-2)' : 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
        }}
      >
        <Check checked={phase.done} onChange={(v) => onUpdate({ done: v })} />
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--ink-3)',
            width: 24,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--ink)',
            textDecoration: phase.done ? 'line-through' : 'none',
            opacity: phase.done ? 0.6 : 1,
          }}
        >
          <EditableText value={phase.name} onChange={(v) => onUpdate({ name: v })} />
        </span>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--ink-3)',
          }}
        >
          {cps.filter((c) => c.done).length}/{cps.length}
        </span>
        <button
          onClick={() => setExpanded((e) => !e)}
          style={{
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--ink-3)',
            fontSize: 11,
            font: 'inherit',
          }}
        >
          {expanded ? '▾' : '▸'}
        </button>
        <button
          onClick={onDelete}
          style={{
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--ink-3)',
            fontSize: 14,
          }}
        >
          ×
        </button>
      </div>
      {expanded && (
        <div
          style={{
            padding: '0 12px 12px 50px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {cps.map((cp) => (
            <div
              key={cp.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 0',
              }}
            >
              <Check checked={cp.done} onChange={(v) => updateCp(cp.id, { done: v })} size={14} />
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: 'var(--ink-2)',
                  textDecoration: cp.done ? 'line-through' : 'none',
                  opacity: cp.done ? 0.55 : 1,
                }}
              >
                <EditableText value={cp.name} onChange={(v) => updateCp(cp.id, { name: v })} />
              </span>
              <button
                onClick={() => deleteCp(cp.id)}
                style={{
                  appearance: 'none',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--ink-3)',
                  fontSize: 12,
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addCp}
            style={{
              appearance: 'none',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--ink-3)',
              fontSize: 12,
              font: 'inherit',
              padding: '4px 0',
              alignSelf: 'flex-start',
            }}
          >
            + checkpoint
          </button>
        </div>
      )}
    </li>
  );
}

export function ProjectDetail({
  project,
  onUpdate,
  onDelete,
}: {
  project: Project;
  onUpdate: (patch: Partial<Project>) => void;
  onDelete: () => void;
}) {
  const pal = paletteFor(project.paletteIdx);
  const totalCheckpoints = project.phases.reduce((s, ph) => s + (ph.checkpoints?.length ?? 0), 0);
  const doneCheckpoints = project.phases.reduce(
    (s, ph) => s + (ph.checkpoints?.filter((c) => c.done).length ?? 0),
    0,
  );

  const addPhase = () =>
    onUpdate({
      phases: [...project.phases, { id: uid(), name: 'New phase', done: false, checkpoints: [] }],
    });
  const updatePhase = (phId: string, patch: Partial<Project['phases'][number]>) =>
    onUpdate({
      phases: project.phases.map((ph) => (ph.id === phId ? { ...ph, ...patch } : ph)),
    });
  const deletePhase = (phId: string) =>
    onUpdate({
      phases: project.phases.filter((ph) => ph.id !== phId),
    });

  const addUpdate = () =>
    onUpdate({
      updates: [
        ...(project.updates || []),
        {
          id: uid(),
          date: fmtDateKey(new Date()),
          text: 'New update',
        },
      ],
    });
  const updateUpdate = (uid: string, patch: Partial<NonNullable<Project['updates']>[number]>) =>
    onUpdate({
      updates: (project.updates || []).map((u) => (u.id === uid ? { ...u, ...patch } : u)),
    });
  const deleteUpdate = (uid: string) =>
    onUpdate({
      updates: (project.updates || []).filter((u) => u.id !== uid),
    });

  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 10,
        padding: '24px 28px',
        overflowY: 'auto',
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          paddingBottom: 18,
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: pal.bg,
            color: pal.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          <EditableText value={project.code} onChange={(v) => onUpdate({ code: v.toUpperCase().slice(0, 6) })} />
        </div>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--serif)',
              fontSize: 24,
              fontWeight: 500,
              color: 'var(--ink)',
              letterSpacing: '-0.01em',
            }}
          >
            <EditableText value={project.name} onChange={(v) => onUpdate({ name: v })} />
          </h2>
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 8,
              fontSize: 12,
              color: 'var(--ink-3)',
              fontFamily: 'var(--mono)',
            }}
          >
            <span>
              {project.hoursLogged}h / {project.targetHours}h target
            </span>
            <span>
              {doneCheckpoints}/{totalCheckpoints} checkpoints
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant={project.active ? 'soft' : 'ghost'} onClick={() => onUpdate({ active: !project.active })}>
            {project.active ? '● active' : '○ inactive'}
          </Btn>
          <Btn variant="danger" onClick={onDelete}>
            Delete
          </Btn>
        </div>
      </div>

      {/* Specs */}
      <section style={{ marginTop: 24 }}>
        <h3 style={sectionTitle}>Project specs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Target hours">
            <Input
              type="number"
              value={project.targetHours}
              onChange={(v) => onUpdate({ targetHours: Number(v) || 0 })}
            />
          </Field>
          <Field label="Hours logged">
            <Input
              type="number"
              value={project.hoursLogged}
              onChange={(v) => onUpdate({ hoursLogged: Number(v) || 0 })}
            />
          </Field>
        </div>
      </section>

      {/* Phases */}
      <section style={{ marginTop: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h3 style={{ ...sectionTitle, marginBottom: 0 }}>Phases & checkpoints</h3>
          <Btn onClick={addPhase}>+ phase</Btn>
        </div>

        {/* Phase progress bar preview */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
          {project.phases.map((phase) => {
            const cps = phase.checkpoints || [];
            const cpsDone = cps.filter((c) => c.done).length;
            const phaseFrac = phase.done ? 1 : cps.length ? cpsDone / cps.length : 0;
            return (
              <div
                key={phase.id}
                style={{
                  flex: 1,
                  height: 8,
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
                    width: phaseFrac * 100 + '%',
                  }}
                />
              </div>
            );
          })}
        </div>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {project.phases.map((phase, i) => (
            <PhaseRow
              key={phase.id}
              phase={phase}
              index={i}
              onUpdate={(patch) => updatePhase(phase.id, patch)}
              onDelete={() => deletePhase(phase.id)}
            />
          ))}
        </ul>
      </section>

      {/* Updates */}
      <section style={{ marginTop: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h3 style={{ ...sectionTitle, marginBottom: 0 }}>Progress updates</h3>
          <Btn onClick={addUpdate}>+ update</Btn>
        </div>
        {(project.updates || []).length === 0 ? (
          <Empty>No updates yet.</Empty>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {(project.updates || [])
              .slice()
              .reverse()
              .map((u) => (
                <li
                  key={u.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid var(--rule)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 11,
                      color: 'var(--ink-3)',
                      width: 78,
                      flexShrink: 0,
                      paddingTop: 2,
                    }}
                  >
                    {u.date}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>
                    <EditableText value={u.text} onChange={(v) => updateUpdate(u.id, { text: v })} multiline />
                  </span>
                  <button
                    onClick={() => deleteUpdate(u.id)}
                    style={{
                      appearance: 'none',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--ink-3)',
                      fontSize: 14,
                      padding: '0 4px',
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
