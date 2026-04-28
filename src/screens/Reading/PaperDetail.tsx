import type { Paper, Project } from '../../data/types';
import { PROJECT_PALETTE } from '../../data/palette';
import { Btn } from '../../ui/Btn';
import { EditableText } from '../../ui/EditableText';
import { Field } from '../../ui/Field';
import { Select } from '../../ui/Select';
import { sectionTitle } from '../Projects/ProjectDetail';

export function PaperDetail({
  paper,
  projects,
  onUpdate,
  onDelete,
}: {
  paper: Paper;
  projects: Project[];
  onUpdate: (patch: Partial<Paper>) => void;
  onDelete: () => void;
}) {
  const proj = projects.find((p) => p.id === paper.projectId);

  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 10,
        padding: '32px 40px',
        overflowY: 'auto',
        minHeight: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--serif)',
              fontSize: 24,
              fontWeight: 500,
              color: 'var(--ink)',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}
          >
            <EditableText value={paper.title} onChange={(v) => onUpdate({ title: v })} multiline />
          </h2>
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: 'var(--ink-3)',
              fontStyle: 'italic',
            }}
          >
            <EditableText value={paper.authors} onChange={(v) => onUpdate({ authors: v })} />
            <span style={{ margin: '0 6px' }}>·</span>
            <EditableText value={paper.venue} onChange={(v) => onUpdate({ venue: v })} />
            <span style={{ margin: '0 6px' }}>·</span>
            <span style={{ fontFamily: 'var(--mono)', fontStyle: 'normal' }}>added {paper.addedAt}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant={paper.read ? 'soft' : 'solid'} onClick={() => onUpdate({ read: !paper.read })}>
            {paper.read ? '✓ read' : 'mark as read'}
          </Btn>
          <Btn variant="danger" onClick={onDelete}>
            Delete
          </Btn>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Field label="Project">
          <Select value={paper.projectId || ''} onChange={(v) => onUpdate({ projectId: v })}>
            <option value="">— none —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div
        style={{
          padding: '20px 24px',
          background: 'var(--surface)',
          borderRadius: 8,
          marginBottom: 16,
          borderLeft: '3px solid ' + (proj ? PROJECT_PALETTE[proj.paletteIdx].fg : 'var(--rule-strong)'),
        }}
      >
        <div style={sectionTitle}>Summary</div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, fontFamily: 'var(--sans)' }}>
          <EditableText
            value={paper.summary}
            onChange={(v) => onUpdate({ summary: v })}
            placeholder="What did the paper do?"
            multiline
          />
        </div>
      </div>

      <div
        style={{
          padding: '20px 24px',
          background: 'var(--surface)',
          borderRadius: 8,
          borderLeft: '3px solid var(--accent)',
        }}
      >
        <div style={sectionTitle}>Key takeaway</div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 16,
            color: 'var(--ink)',
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          <EditableText
            value={paper.takeaway}
            onChange={(v) => onUpdate({ takeaway: v })}
            placeholder="The one thing worth remembering."
            multiline
          />
        </div>
      </div>
    </div>
  );
}
