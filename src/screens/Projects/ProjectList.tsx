import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import type { Project } from '../../data/types';
import { ProjectDot } from '../../ui/ProjectDot';
import { Input } from '../../ui/Input';

export function ProjectList({
  projects,
  selectedId,
  onSelect,
  onAdd,
}: {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(
    () => new Fuse(projects, { keys: ['name', 'code'], threshold: 0.35 }),
    [projects],
  );

  const filtered = useMemo(
    () => (query ? fuse.search(query).map((r) => r.item) : projects),
    [fuse, query, projects],
  );

  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 10,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        gap: 12,
      }}
    >
      <div
        style={{
          padding: '0 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--mono)',
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {projects.length} projects
        </span>
        <button
          onClick={onAdd}
          style={{
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--accent)',
            font: 'inherit',
            fontWeight: 500,
          }}
        >
          + new
        </button>
      </div>

      <Input
        value={query}
        onChange={setQuery}
        placeholder="Filter projects..."
        style={{ fontSize: 13, padding: '6px 10px' }}
      />

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {filtered.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => onSelect(p.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                appearance: 'none',
                border: 'none',
                background: selectedId === p.id ? 'var(--surface-2)' : 'transparent',
                padding: '10px 12px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                font: 'inherit',
                opacity: p.active ? 1 : 0.55,
              }}
            >
              <ProjectDot project={p} size={9} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--ink)',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    fontFamily: 'var(--mono)',
                    color: 'var(--ink-3)',
                    marginTop: 1,
                  }}
                >
                  {p.code} · {p.phases.filter((ph) => ph.done).length}/{p.phases.length} phases
                  {!p.active && ' · inactive'}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
