import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import type { Project, Todo } from '../../data/types';
import { addDays, fmtDateKey, uid } from '../../data/helpers';
import type { Rep } from '../../store/replicache';
import { Card } from '../../ui/Card';
import { Empty } from '../../ui/Empty';
import { Btn } from '../../ui/Btn';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { TodoRow } from './TodoRow';
import { ContextMenu, type ContextMenuItem } from '../../ui/ContextMenu';

export function TodosCard({
  rep,
  todos,
  projects,
}: {
  rep: Rep | null;
  todos: Todo[];
  projects: Project[];
}) {
  const [adding, setAdding] = useState(false);
  const activeProjects = projects.filter((p) => p.active);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftProject, setDraftProject] = useState('');
  const [draftDue, setDraftDue] = useState(() => fmtDateKey(addDays(new Date(), 1)));
  const [draftPriority, setDraftPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [draftTags, setDraftTags] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const openTodos = useMemo(() => todos.filter((t) => !t.done), [todos]);

  const fuse = useMemo(
    () => new Fuse(openTodos, { keys: ['title', 'tags'], threshold: 0.35 }),
    [openTodos],
  );

  const visible = useMemo(() => {
    const base = query ? fuse.search(query).map((r) => r.item) : openTodos;
    return base.slice().sort((a, b) => (a.due ?? '').localeCompare(b.due ?? ''));
  }, [fuse, query, openTodos]);

  const startAdd = () => {
    setDraftTitle('');
    setDraftProject(activeProjects[0]?.id ?? projects[0]?.id ?? '');
    setDraftDue(fmtDateKey(addDays(new Date(), 1)));
    setDraftPriority('medium');
    setAdding(true);
  };

  const submitNew = async () => {
    if (!rep) return;
    const title = draftTitle.trim();
    if (!title) return;
    const tags = draftTags.split(',').map(t => t.trim()).filter(Boolean);
    const todo: Todo = {
      id: uid(),
      title,
      projectId: draftProject || undefined,
      due: draftDue,
      done: false,
      scheduled: false,
      tags: tags.length > 0 ? tags : undefined,
      status: 'todo',
      priority: draftPriority,
    };
    await rep.mutate.addTodo(todo);
    setDraftTitle('');
    setDraftTags('');
    setAdding(false);
  };

  const handlePaste = () => {
    try {
      const raw = sessionStorage.getItem('TASKTRACK_CLIPBOARD');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.type === 'todo') {
        const t = data.data as Todo;
        setDraftTitle(t.title);
        setDraftProject(t.projectId || '');
        setDraftDue(t.due);
        setDraftPriority(t.priority || 'medium');
      }
    } catch (e) {
      console.error('Paste failed', e);
    }
  };

  const hasClipboard = sessionStorage.getItem('TASKTRACK_CLIPBOARD')?.includes('"type":"todo"');

  const updateTodo = (id: string, patch: Partial<Todo>) => {
    if (!rep) return;
    void rep.mutate.updateTodo({ id, patch });
  };

  const deleteTodo = (id: string) => {
    if (!rep) return;
    void rep.mutate.deleteTodo({ id });
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const bulkAction = (patch: Partial<Todo>) => {
    if (!rep || selectedIds.size === 0) return;
    void rep.mutate.bulkUpdateTodos({ ids: Array.from(selectedIds), patch });
    setSelectedIds(new Set());
  };

  return (
    <Card
      title="Inbox"
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {selectedIds.size > 0 ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, marginRight: 4 }}>SET PRIORITY:</span>
              <Btn size="sm" onClick={() => bulkAction({ priority: 'high' })}>High</Btn>
              <Btn size="sm" onClick={() => bulkAction({ priority: 'medium' })}>Med</Btn>
              <Btn size="sm" onClick={() => bulkAction({ priority: 'low' })}>Low</Btn>
              <Btn size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Btn>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, marginRight: 2 }}>KEY:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'oklch(0.6 0.18 20)' }} />
                <span style={{ fontSize: 10, color: 'var(--ink-2)', fontWeight: 500 }}>High</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'oklch(0.75 0.15 70)' }} />
                <span style={{ fontSize: 10, color: 'var(--ink-2)', fontWeight: 500 }}>Med</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'oklch(0.8 0.1 140)' }} />
                <span style={{ fontSize: 10, color: 'var(--ink-2)', fontWeight: 500 }}>Low</span>
              </div>
            </div>
          )}
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{visible.length} open</span>
        </div>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <Input
          value={query}
          onChange={setQuery}
          placeholder="Filter tasks..."
          style={{ fontSize: 13, padding: '6px 10px' }}
        />
      </div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {visible.map((t) => (
          <TodoRow
            key={t.id}
            todo={t}
            projects={projects}
            onUpdate={(patch) => updateTodo(t.id, patch)}
            onDelete={() => deleteTodo(t.id)}
            selected={selectedIds.has(t.id)}
            onSelect={() => toggleSelection(t.id)}
            onContextMenu={(e) => {
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                items: [
                  {
                    label: 'Copy Task',
                    onClick: () => {
                      sessionStorage.setItem('TASKTRACK_CLIPBOARD', JSON.stringify({ type: 'todo', data: t }));
                    },
                  },
                  {
                    label: 'Delete',
                    danger: true,
                    onClick: () => deleteTodo(t.id),
                  },
                ],
              });
            }}
          />
        ))}
        {visible.length === 0 && !adding && <Empty>All caught up.</Empty>}
      </ul>

      {adding ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: 'var(--surface-2)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase' }}>
              New Task
            </span>
            {hasClipboard && (
              <button
                onClick={handlePaste}
                style={{
                  appearance: 'none',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--accent)',
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                PASTE
              </button>
            )}
          </div>
          <Input
            value={draftTitle}
            onChange={setDraftTitle}
            placeholder="What needs doing?"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submitNew();
              if (e.key === 'Escape') setAdding(false);
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Select value={draftPriority} onChange={(v) => setDraftPriority(v as 'low' | 'medium' | 'high')}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </Select>
            <Input
              value={draftTags}
              onChange={setDraftTags}
              placeholder="Tags (e.g. #writing, admin)"
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Select value={draftProject} onChange={setDraftProject} style={{ flex: 1 }}>
              <option value="">— No Project (Inbox) —</option>
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </Select>
            <Input type="date" value={draftDue} onChange={setDraftDue} />
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <Btn onClick={() => setAdding(false)}>Cancel</Btn>
            <Btn variant="accent" onClick={submitNew}>
              Add
            </Btn>
          </div>
        </div>
      ) : (
        <button
          onClick={startAdd}
          style={{
            marginTop: 10,
            alignSelf: 'flex-start',
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 12,
            color: 'var(--ink-3)',
            padding: '4px 0',
            font: 'inherit',
          }}
        >
          + new task
        </button>
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </Card>
  );
}
