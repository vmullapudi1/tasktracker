import type { CSSProperties } from 'react';
import type { Project } from '../../data/types';
import { paletteFor } from '../../data/palette';
import { Btn } from '../../ui/Btn';
import { EditableText } from '../../ui/EditableText';
import { Field } from '../../ui/Field';
import { Input } from '../../ui/Input';

export const sectionTitle: CSSProperties = {
  fontSize: 11,
  fontFamily: 'var(--mono)',
  color: 'var(--ink-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 600,
  margin: '0 0 12px',
};

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
    </div>
  );
}
