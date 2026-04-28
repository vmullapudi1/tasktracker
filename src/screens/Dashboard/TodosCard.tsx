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
  const [draftTags, setDraftTags] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const [query, setQuery] = useState('');

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
    setAdding(true);
  };

  const submitNew = async () => {
    if (!rep) return;
    const title = draftTitle.trim();
    if (!title || !draftProject) return;
    const tags = draftTags.split(',').map(t => t.trim()).filter(Boolean);
    const todo: Todo = {
      id: uid(),
      title,
      projectId: draftProject,
      due: draftDue,
      done: false,
      scheduled: false,
      tags: tags.length > 0 ? tags : undefined,
      status: 'todo',
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
        setDraftProject(t.projectId);
        setDraftDue(t.due);
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

  return (
    <Card
      title="To-do"
      action={
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{visible.length} open</span>
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
          <Input
            value={draftTags}
            onChange={setDraftTags}
            placeholder="Tags (e.g. #writing, admin)"
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Select value={draftProject} onChange={setDraftProject} style={{ flex: 1 }}>
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
