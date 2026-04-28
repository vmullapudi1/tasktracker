import { useMemo, useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import type { Project, Todo, Paper, Tab } from '../../data/types';
import { ProjectDot } from '../../ui/ProjectDot';

interface SearchItem {
  id: string;
  type: 'project' | 'todo' | 'paper';
  title: string;
  subtitle?: string;
  projectId?: string;
  // Raw fields for fuse to search
  name?: string;
  code?: string;
  authors?: string;
  venue?: string;
  summary?: string;
  takeaway?: string;
  tags?: string[];
}

export function GlobalSearchModal({
  open,
  onClose,
  projects,
  todos,
  papers,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  todos: Todo[];
  papers: Paper[];
  onSelect: (tab: Tab, id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<SearchItem[]>(() => {
    const data: SearchItem[] = [];

    projects.forEach((p) => {
      data.push({
        id: p.id,
        type: 'project',
        title: p.name,
        subtitle: p.code,
        name: p.name,
        code: p.code,
      });
    });

    todos.forEach((t) => {
      data.push({
        id: t.id,
        type: 'todo',
        title: t.title,
        subtitle: projects.find((p) => p.id === t.projectId)?.name,
        projectId: t.projectId,
        tags: t.tags,
      });
    });

    papers.forEach((p) => {
      data.push({
        id: p.id,
        type: 'paper',
        title: p.title,
        subtitle: p.authors,
        authors: p.authors,
        venue: p.venue,
        summary: p.summary,
        takeaway: p.takeaway,
        projectId: p.projectId,
      });
    });

    return data;
  }, [projects, todos, papers]);

  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys: [
        { name: 'title', weight: 1 },
        { name: 'code', weight: 0.8 },
        { name: 'subtitle', weight: 0.5 },
        { name: 'tags', weight: 0.7 },
        { name: 'authors', weight: 0.6 },
        { name: 'venue', weight: 0.4 },
        { name: 'summary', weight: 0.3 },
        { name: 'takeaway', weight: 0.3 },
      ],
      threshold: 0.4,
    });
  }, [items]);

  const results = useMemo(() => {
    if (!query) return items.slice(0, 10);
    return fuse.search(query).map((r) => r.item);
  }, [fuse, query, items]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = (item: SearchItem) => {
    let tab: Tab = 'dashboard';
    if (item.type === 'project') tab = 'projects';
    else if (item.type === 'todo') tab = 'dashboard';
    else if (item.type === 'paper') tab = 'reading';
    onSelect(tab, item.id);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Search everything...">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input
          ref={inputRef}
          autoFocus
          placeholder="Search projects, tasks, papers..."
          value={query}
          onChange={setQuery}
          onKeyDown={onKeyDown}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: 400,
            overflowY: 'auto',
            margin: '0 -8px',
          }}
        >
          {results.map((item, i) => {
            const active = i === activeIndex;
            const proj = projects.find((p) => p.id === item.projectId);
            return (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setActiveIndex(i)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: active ? 'var(--surface-2)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'background .1s',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                  }}
                >
                  {item.type === 'project' && '🚀'}
                  {item.type === 'todo' && '✅'}
                  {item.type === 'paper' && '📚'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--ink-3)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {proj && <ProjectDot project={proj} />}
                    {item.subtitle}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--ink-3)',
                    fontFamily: 'var(--mono)',
                  }}
                >
                  {item.type}
                </div>
              </div>
            );
          })}
          {results.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
