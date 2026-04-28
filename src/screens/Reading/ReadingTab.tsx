import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import type { Paper } from '../../data/types';
import type { Rep } from '../../store/replicache';
import { usePapers, useProjects } from '../../store/subscriptions';
import { ProjectChip } from '../../ui/ProjectChip';
import { Empty } from '../../ui/Empty';
import { PaperDetail } from './PaperDetail';
import { AddPaperModal } from './AddPaperModal';
import { Input } from '../../ui/Input';

export type ReadingFilter = 'all' | 'unread' | 'read';

export function ReadingTab({ 
  rep, 
  navigatedId, 
  onNavigated 
}: { 
  rep: Rep | null;
  navigatedId?: string | null;
  onNavigated?: () => void;
}) {
  const [filter, setFilter] = useState<ReadingFilter>('all');
  const [query, setQuery] = useState('');
  const papers = usePapers(rep);
  const projects = useProjects(rep);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (navigatedId) {
      setSelectedId(navigatedId);
      onNavigated?.();
    }
  }, [navigatedId, onNavigated]);

  const effectiveId = (selectedId && papers.some((p) => p.id === selectedId)) 
    ? selectedId 
    : (papers[0]?.id ?? null);

  const fuse = useMemo(
    () =>
      new Fuse(papers, {
        keys: ['title', 'authors', 'summary', 'takeaway', 'venue'],
        threshold: 0.35,
      }),
    [papers],
  );

  const filtered = useMemo(() => {
    let base = query ? fuse.search(query).map((r) => r.item) : papers;
    return base
      .filter((p) => {
        if (filter === 'unread') return !p.read;
        if (filter === 'read') return p.read;
        return true;
      })
      .sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''));
  }, [fuse, query, papers, filter]);

  const selected = papers.find((p) => p.id === effectiveId) ?? null;

  const updatePaper = (patch: Partial<Paper>) => {
    if (!rep || !selected) return;
    void rep.mutate.updatePaper({ id: selected.id, patch });
  };

  const deletePaper = () => {
    if (!rep || !selected) return;
    if (!confirm('Delete this paper?')) return;
    const next = papers.find((p) => p.id !== selected.id) ?? null;
    void rep.mutate.deletePaper({ id: selected.id });
    setSelectedId(next?.id ?? null);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: 20,
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Sidebar list */}
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 10,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <div
          style={{
            padding: '4px 8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'unread', 'read'] as ReadingFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  appearance: 'none',
                  border: 'none',
                  background: filter === f ? 'var(--surface-2)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: 11,
                  font: 'inherit',
                  color: filter === f ? 'var(--ink)' : 'var(--ink-3)',
                  fontWeight: filter === f ? 600 : 400,
                  padding: '4px 6px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAdding(true)}
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
            + paper
          </button>
        </div>

        <div style={{ padding: '0 8px 12px' }}>
          <Input
            value={query}
            onChange={setQuery}
            placeholder="Search papers..."
            style={{ fontSize: 13, padding: '6px 10px' }}
          />
        </div>

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
          {filtered.map((p) => {
            const proj = projects.find((pr) => pr.id === p.projectId);
            return (
              <li key={p.id}>
                <button
                  onClick={() => setSelectedId(p.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    appearance: 'none',
                    border: 'none',
                    background: effectiveId === p.id ? 'var(--surface-2)' : 'transparent',
                    padding: '12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    font: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: p.read ? 'transparent' : 'var(--accent)',
                        border: p.read ? '1px solid var(--rule-strong)' : 'none',
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--serif)',
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'var(--ink)',
                        lineHeight: 1.3,
                        flex: 1,
                      }}
                    >
                      {p.title}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--ink-3)',
                      fontStyle: 'italic',
                      paddingLeft: 16,
                    }}
                  >
                    {p.authors}
                  </div>
                  <div style={{ display: 'flex', gap: 8, paddingLeft: 16, marginTop: 2 }}>
                    {proj && <ProjectChip project={proj} />}
                  </div>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && <Empty>No papers in this view.</Empty>}
        </ul>
      </div>

      {selected ? (
        <PaperDetail
          key={selected.id}
          paper={selected}
          projects={projects}
          onUpdate={updatePaper}
          onDelete={deletePaper}
        />
      ) : (
        <div
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ink-3)',
          }}
        >
          Select a paper.
        </div>
      )}

      {adding && <AddPaperModal rep={rep} projects={projects} onClose={() => setAdding(false)} />}
    </div>
  );
}
