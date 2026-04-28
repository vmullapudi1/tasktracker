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
import type { Todo, Project, Checkpoint, Phase } from '../../data/types';

interface KanbanCheckpoint {
  checkpoint: Checkpoint;
  phase: Phase;
  project: Project;
}

export function KanbanTab({ rep }: { rep: Rep | null }) {
  const todos = useTodos(rep);
  const projects = useProjects(rep);
  const [projectId, setProjectId] = useState<string>('all');
  const [inboxOpen, setInboxOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const inboxTodos = useMemo(() => {
    return todos.filter(t => !t.projectId && !t.done);
  }, [todos]);

  const checkpointItems = useMemo(() => {
    const list: KanbanCheckpoint[] = [];
    const filteredProjects = projectId === 'all' ? projects : projects.filter(p => p.id === projectId);
    
    for (const p of filteredProjects) {
      for (const ph of p.phases) {
        for (const cp of ph.checkpoints) {
          list.push({ checkpoint: cp, phase: ph, project: p });
        }
      }
    }
    return list;
  }, [projects, projectId]);

  const columns = useMemo(() => {
    const todo: KanbanCheckpoint[] = [];
    const doing: KanbanCheckpoint[] = [];
    const done: KanbanCheckpoint[] = [];

    for (const item of checkpointItems) {
      if (item.checkpoint.done) {
        done.push(item);
      } else {
        const firstUndonePhase = item.project.phases.find(ph => !ph.done);
        if (firstUndonePhase?.id === item.phase.id) {
          doing.push(item);
        } else {
          todo.push(item);
        }
      }
    }
    return { todo, doing, done };
  }, [checkpointItems]);

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const moveItem = async (id: string, newStatus: 'todo' | 'doing' | 'done', type: 'todo' | 'checkpoint') => {
    if (!rep) return;

    if (type === 'todo') {
      const t = todos.find(todo => todo.id === id);
      if (!t) return;
      
      // Moving from inbox to a project column?
      const targetProjectId = t.projectId || (projectId !== 'all' ? projectId : projects.find(p => p.active)?.id || projects[0]?.id);
      
      await rep.mutate.updateTodo({
        id,
        patch: {
          status: newStatus,
          done: newStatus === 'done',
          projectId: targetProjectId
        }
      });
    } else {
      // Checkpoint move logic
      const item = checkpointItems.find(i => i.checkpoint.id === id);
      if (!item) return;

      if (newStatus === 'done') {
        await rep.mutate.updateCheckpoint({
          projectId: item.project.id,
          phaseId: item.phase.id,
          checkpointId: item.checkpoint.id,
          patch: { done: true }
        });
      } else if (newStatus === 'doing' || newStatus === 'todo') {
        // If moving back from done
        if (item.checkpoint.done) {
          await rep.mutate.updateCheckpoint({
            projectId: item.project.id,
            phaseId: item.phase.id,
            checkpointId: item.checkpoint.id,
            patch: { done: false }
          });
        }
        // Changing phases is not directly supported via drag-drop yet as it requires 
        // choosing which phase to move to. For now, we just toggle 'done' status.
      }
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
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
                  onDragStart={() => {
                    setDraggedId(t.id);
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                  }}
                  onSelect={() => toggleSelection(t.id)}
                  onClick={() => setEditingTodo(t)}
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
                const id = e.dataTransfer.getData('itemId');
                const type = e.dataTransfer.getData('itemType') as 'todo' | 'checkpoint';
                if (id && type) moveItem(id, col, type);
              }}
            >
              <h3 style={{ margin: 0, fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', color: 'var(--ink-3)', letterSpacing: '0.05em' }}>
                {col} ({columns[col].length})
              </h3>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {columns[col].map((item) => (
                  <CheckpointCard 
                    key={item.checkpoint.id} 
                    item={item}
                    isDragged={draggedId === item.checkpoint.id}
                    onDragStart={() => {
                      setDraggedId(item.checkpoint.id);
                    }}
                    onDragEnd={() => {
                      setDraggedId(null);
                    }}
                  />
                ))}
                {columns[col].length === 0 && <Empty>No checkpoints here.</Empty>}
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

function CheckpointCard({ item, isDragged, onDragStart, onDragEnd }: { 
  item: KanbanCheckpoint; 
  isDragged: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      style={{
        background: 'var(--paper)',
        padding: '12px',
        borderRadius: 8,
        border: '1px solid var(--rule)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'grab',
        opacity: isDragged ? 0.5 : 1,
        transition: 'opacity .1s',
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('itemId', item.checkpoint.id);
        e.dataTransfer.setData('itemType', 'checkpoint');
        onDragStart();
      }}
      onDragEnd={onDragEnd}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
          {item.checkpoint.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
          {item.project.code}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', opacity: 0.8 }}>
          Phase: {item.phase.name}
        </div>
        <ProjectChip project={item.project} />
      </div>
    </div>
  );
}

function TodoCard({ 
  todo, 
  projects, 
  isDragged, 
  isSelected,
  onDragStart, 
  onDragEnd, 
  onSelect,
  onClick,
}: { 
  todo: Todo; 
  projects: Project[]; 
  isDragged: boolean;
  isSelected: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onSelect: () => void;
  onClick: () => void;
}) {
  const priorityColor = (p?: string) => {
    if (p === 'high') return 'oklch(0.6 0.18 20)';
    if (p === 'medium') return 'oklch(0.75 0.15 70)';
    if (p === 'low') return 'oklch(0.8 0.1 140)';
    return 'transparent';
  };

  return (
    <div
      style={{
        background: 'var(--paper)',
        padding: '12px',
        borderRadius: 8,
        border: '1px solid var(--rule)',
        borderLeft: `4px solid ${priorityColor(todo.priority)}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'grab',
        opacity: isDragged ? 0.5 : 1,
        transition: 'opacity .1s',
        position: 'relative'
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('itemId', todo.id);
        e.dataTransfer.setData('itemType', 'todo');
        onDragStart();
      }}
      onDragEnd={onDragEnd}
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
