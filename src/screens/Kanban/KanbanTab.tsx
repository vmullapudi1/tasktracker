import { useMemo, useState } from 'react';
import type { Rep } from '../../store/replicache';
import { useTodos, useProjects } from '../../store/subscriptions';
import { Empty } from '../../ui/Empty';
import { ProjectChip } from '../../ui/ProjectChip';
import { Select } from '../../ui/Select';

export function KanbanTab({ rep }: { rep: Rep | null }) {
  const todos = useTodos(rep);
  const projects = useProjects(rep);
  const [projectId, setProjectId] = useState<string>('all');

  const filtered = useMemo(() => {
    const list = projectId === 'all' ? todos : todos.filter((t) => t.projectId === projectId);
    return [...list].sort((a, b) => {
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      if (ao !== bo) return ao - bo;
      return a.id.localeCompare(b.id);
    });
  }, [todos, projectId]);

  const columns = {
    todo: filtered.filter((t) => !t.done && (t.status === 'todo' || !t.status)),
    doing: filtered.filter((t) => !t.done && t.status === 'doing'),
    done: filtered.filter((t) => t.done || t.status === 'done'),
  };

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const moveTodo = (id: string, newStatus: 'todo' | 'doing' | 'done', targetId?: string) => {
    if (!rep) return;
    const movingTodo = todos.find((t) => t.id === id);
    if (!movingTodo) return;

    // 1. Get current items for this column (excluding moving one)
    const columnTodos = columns[newStatus].filter((t) => t.id !== id);

    // 2. Determine insertion index
    const targetIdx = targetId ? columnTodos.findIndex((t) => t.id === targetId) : columnTodos.length;

    // 3. Create new list with moving item at target index
    const resultList = [...columnTodos];
    resultList.splice(targetIdx === -1 ? resultList.length : targetIdx, 0, { ...movingTodo, status: newStatus });

    // 4. Re-assign orders to ALL items in this column to ensure stable, clean spacing
    resultList.forEach((t, i) => {
      const newOrder = (i + 1) * 100;
      const isMoving = t.id === id;
      const statusChanged = t.status !== newStatus;
      const doneChanged = (newStatus === 'done') !== t.done;
      const orderChanged = t.order !== newOrder;

      if (isMoving || statusChanged || doneChanged || orderChanged) {
        void rep.mutate.updateTodo({
          id: t.id,
          patch: {
            status: newStatus,
            done: newStatus === 'done',
            order: newOrder,
          },
        });
      }
    });
    setDragOverId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)' }}>Kanban Board</h2>
        <div style={{ width: 240 }}>
          <Select value={projectId} onChange={setProjectId}>
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, flex: 1, minHeight: 0 }}>
        {(['todo', 'doing', 'done'] as const).map((col) => (
          <div
            key={col}
            style={{
              background: 'var(--surface)',
              borderRadius: 12,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              border: '1px solid var(--rule)',
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData('todoId');
              if (id) moveTodo(id, col);
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontFamily: 'var(--mono)',
                  textTransform: 'uppercase',
                  color: 'var(--ink-3)',
                  letterSpacing: '0.05em',
                }}
              >
                {col} ({columns[col].length})
              </h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {columns[col].map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: 'var(--paper)',
                    padding: '12px',
                    borderRadius: 8,
                    border: '1px solid var(--rule)',
                    borderTop: dragOverId === t.id ? '3px solid var(--accent)' : '1px solid var(--rule)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'grab',
                    opacity: draggedId === t.id ? 0.5 : 1,
                    transition: 'border-top .1s',
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('todoId', t.id);
                    setDraggedId(t.id);
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggedId !== t.id) setDragOverId(t.id);
                  }}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = e.dataTransfer.getData('todoId');
                    if (id && id !== t.id) {
                      moveTodo(id, col, t.id);
                    }
                  }}
                >
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, marginBottom: 8 }}>
                    {t.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {projects.find((p) => p.id === t.projectId) && (
                      <ProjectChip project={projects.find((p) => p.id === t.projectId)!} />
                    )}
                    {t.tags && t.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {t.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: 10,
                              color: 'var(--accent)',
                              background: 'var(--surface-2)',
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {columns[col].length === 0 && <Empty>No tasks here.</Empty>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
