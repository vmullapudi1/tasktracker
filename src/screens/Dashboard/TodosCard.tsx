import { useState } from 'react';
import type { Project, Todo } from '../../data/types';
import { addDays, fmtDateKey, uid } from '../../data/helpers';
import type { Rep } from '../../store/replicache';
import { Card } from '../../ui/Card';
import { Empty } from '../../ui/Empty';
import { Btn } from '../../ui/Btn';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { TodoRow } from './TodoRow';

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

  const visible = todos
    .filter((t) => !t.done)
    .slice()
    .sort((a, b) => (a.due ?? '').localeCompare(b.due ?? ''));

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
    const todo: Todo = {
      id: uid(),
      title,
      projectId: draftProject,
      due: draftDue,
      done: false,
      scheduled: false,
    };
    await rep.mutate.addTodo(todo);
    setDraftTitle('');
    setAdding(false);
  };

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
            <Btn variant="solid" onClick={submitNew}>
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
    </Card>
  );
}
