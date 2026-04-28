import { useMemo, useState } from 'react';
import type { Rep } from '../../store/replicache';
import { useTodos, useProjects } from '../../store/subscriptions';
import { Empty } from '../../ui/Empty';
import { ProjectChip } from '../../ui/ProjectChip';
import { Select } from '../../ui/Select';
import { Btn } from '../../ui/Btn';
import { Modal } from '../../ui/Modal';
import { Field } from '../../ui/Field';
import { Input } from '../../ui/Input';
import { Check } from '../../ui/Check';
import type { Todo, Project } from '../../data/types';

export function KanbanTab({ rep }: { rep: Rep | null }) {
  const todos = useTodos(rep);
  const projects = useProjects(rep);
  const [projectId, setProjectId] = useState<string>('all');
  const [inboxOpen, setInboxOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const filtered = useMemo(() => {
    // Only show tasks with a project in the main board (if not in 'all' mode)
    // Or if projectId is 'all', show everything that has A project.
    const list = projectId === 'all' 
      ? todos.filter(t => !!t.projectId) 
      : todos.filter((t) => t.projectId === projectId);
    
    return [...list].sort((a, b) => {
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      if (ao !== bo) return ao - bo;
      return a.id.localeCompare(b.id);
    });
  }, [todos, projectId]);

  const inboxTodos = useMemo(() => {
    return todos.filter(t => !t.projectId && !t.done);
  }, [todos]);

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

    // If it was in the inbox, it needs a project now
    const targetProjectId = movingTodo.projectId || (projectId !== 'all' ? projectId : projects.find(p => p.active)?.id || projects[0]?.id);

    // 1. Get current items for this column (excluding moving one)
    const columnTodos = columns[newStatus].filter((t) => t.id !== id);

    // 2. Determine insertion index
    const targetIdx = targetId ? columnTodos.findIndex((t) => t.id === targetId) : columnTodos.length;

    // 3. Create new list with moving item at target index
    const resultList = [...columnTodos];
    resultList.splice(targetIdx === -1 ? resultList.length : targetIdx, 0, { ...movingTodo, status: newStatus, projectId: targetProjectId });

    // 4. Re-assign orders to ALL items in this column to ensure stable, clean spacing
    resultList.forEach((t, i) => {
      const newOrder = (i + 1) * 100;
      const isMoving = t.id === id;
      const statusChanged = t.status !== newStatus;
      const doneChanged = (newStatus === 'done') !== t.done;
      const orderChanged = t.order !== newOrder;
      const projectChanged = isMoving && t.projectId !== movingTodo.projectId;

      if (isMoving || statusChanged || doneChanged || orderChanged || projectChanged) {
        void rep.mutate.updateTodo({
          id: t.id,
          patch: {
            status: newStatus,
            done: newStatus === 'done',
            order: newOrder,
            projectId: isMoving ? targetProjectId : t.projectId
          },
        });
      }
    });
    setDragOverId(null);
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

  const priorityColor = (p?: string) => {
    if (p === 'high') return 'oklch(0.6 0.18 20)';
    if (p === 'medium') return 'oklch(0.75 0.15 70)';
    if (p === 'low') return 'oklch(0.8 0.1 140)';
    return 'transparent';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--ink)' }}>Kanban Board</h2>
          <Btn onClick={() => setInboxOpen(!inboxOpen)} variant={inboxOpen ? 'accent' : 'ghost'} size="sm">
            {inboxOpen ? 'Hide Inbox' : 'Show Inbox'}
          </Btn>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {selectedIds.size > 0 && (
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, marginRight: 8 }}>{selectedIds.size} selected:</span>
              <Btn size="sm" onClick={() => bulkAction({ status: 'todo', done: false })}>Todo</Btn>
              <Btn size="sm" onClick={() => bulkAction({ status: 'doing', done: false })}>Doing</Btn>
              <Btn size="sm" onClick={() => bulkAction({ status: 'done', done: true })}>Done</Btn>
              <Btn size="sm" onClick={() => bulkAction({ priority: 'high' })}>High</Btn>
              <Btn size="sm" onClick={() => bulkAction({ priority: 'medium' })}>Med</Btn>
              <Btn size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Btn>
            </div>
          )}
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
      </div>

      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {inboxOpen && (
          <div
            style={{
              width: 260,
              background: 'var(--surface-2)',
              borderRadius: 12,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              border: '1px solid var(--rule)',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--ink-3)', letterSpacing: '0.05em' }}>
              Inbox ({inboxTodos.length})
            </h3>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inboxTodos.map(t => (
                <TodoCard 
                  key={t.id} 
                  todo={t} 
                  projects={projects}
                  isDragged={draggedId === t.id}
                  isSelected={selectedIds.has(t.id)}
                  onDragStart={() => setDraggedId(t.id)}
                  onDragEnd={() => setDraggedId(null)}
                  onSelect={() => toggleSelection(t.id)}
                  onClick={() => setEditingTodo(t)}
                  priorityColor={priorityColor(t.priority)}
                />
              ))}
              {inboxTodos.length === 0 && <Empty>Inbox empty.</Empty>}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, flex: 1 }}>
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
              <h3 style={{ margin: 0, fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--ink-3)', letterSpacing: '0.05em' }}>
                {col} ({columns[col].length})
              </h3>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {columns[col].map((t) => (
                  <TodoCard 
                    key={t.id} 
                    todo={t} 
                    projects={projects}
                    isDragged={draggedId === t.id}
                    isDragOver={dragOverId === t.id}
                    isSelected={selectedIds.has(t.id)}
                    onDragStart={() => setDraggedId(t.id)}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDragOverId(null);
                    }}
                    onDragOver={() => {
                      if (draggedId !== t.id) setDragOverId(t.id);
                    }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(id) => moveTodo(id, col, t.id)}
                    onSelect={() => toggleSelection(t.id)}
                    onClick={() => setEditingTodo(t)}
                    priorityColor={priorityColor(t.priority)}
                  />
                ))}
                {columns[col].length === 0 && <Empty>No tasks here.</Empty>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingTodo && (
        <TodoEditModal 
          todo={editingTodo} 
          projects={projects} 
          onClose={() => setEditingTodo(null)} 
          onSave={(patch) => {
            if (rep) void rep.mutate.updateTodo({ id: editingTodo.id, patch });
            setEditingTodo(null);
          }}
          onDelete={() => {
            if (rep) void rep.mutate.deleteTodo({ id: editingTodo.id });
            setEditingTodo(null);
          }}
        />
      )}
    </div>
  );
}

function TodoCard({ 
  todo, 
  projects, 
  isDragged, 
  isDragOver, 
  isSelected,
  onDragStart, 
  onDragEnd, 
  onDragOver, 
  onDragLeave, 
  onDrop,
  onSelect,
  onClick,
  priorityColor
}: { 
  todo: Todo; 
  projects: Project[]; 
  isDragged: boolean;
  isDragOver?: boolean;
  isSelected: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver?: () => void;
  onDragLeave?: () => void;
  onDrop?: (id: string) => void;
  onSelect: () => void;
  onClick: () => void;
  priorityColor: string;
}) {
  return (
    <div
      style={{
        background: 'var(--paper)',
        padding: '12px',
        borderRadius: 8,
        border: '1px solid var(--rule)',
        borderTop: isDragOver ? '3px solid var(--accent)' : '1px solid var(--rule)',
        borderLeft: `4px solid ${priorityColor}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'grab',
        opacity: isDragged ? 0.5 : 1,
        transition: 'border-top .1s, border-left .1s',
        position: 'relative'
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('todoId', todo.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOver?.();
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = e.dataTransfer.getData('todoId');
        if (id && id !== todo.id) {
          onDrop?.(id);
        }
      }}
      onClick={onClick}
    >
      <div style={{ position: 'absolute', top: 8, right: 8 }}>
        <Check checked={isSelected} onChange={onSelect} size={14} />
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, marginBottom: 8, paddingRight: 20 }}>
        {todo.title}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {projects.find((p) => p.id === todo.projectId) && (
          <ProjectChip project={projects.find((p) => p.id === todo.projectId)!} />
        )}
        {todo.tags && todo.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4 }}>
            {todo.tags.map((tag) => (
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
  );
}

function TodoEditModal({ todo, projects, onClose, onSave, onDelete }: { 
  todo: Todo; 
  projects: Project[]; 
  onClose: () => void; 
  onSave: (patch: Partial<Todo>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(todo.title);
  const [projectId, setProjectId] = useState(todo.projectId || '');
  const [due, setDue] = useState(todo.due);
  const [priority, setPriority] = useState<Todo['priority']>(todo.priority || 'medium');
  const [tags, setTags] = useState(todo.tags?.join(', ') || '');

  return (
    <Modal title="Edit Task" onClose={onClose} open={!!todo}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Title">
          <Input value={title} onChange={setTitle} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Project">
            <Select value={projectId} onChange={setProjectId}>
              <option value="">— none (Inbox) —</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Due Date">
            <Input type="date" value={due} onChange={setDue} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Priority">
            <Select value={priority || 'medium'} onChange={(v) => setPriority(v as Todo['priority'])}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </Field>
          <Field label="Tags (comma separated)">
            <Input value={tags} onChange={setTags} />
          </Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Btn variant="ghost" onClick={onDelete} style={{ color: 'var(--p1-fg)' }}>Delete Task</Btn>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn variant="accent" onClick={() => {
              onSave({
                title,
                projectId: projectId || undefined,
                due,
                priority: priority || 'medium',
                tags: tags.split(',').map(s => s.trim()).filter(Boolean)
              });
            }}>Save Changes</Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
}

