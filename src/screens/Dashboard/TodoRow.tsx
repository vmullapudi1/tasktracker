import { useState } from 'react';
import type { MouseEvent } from 'react';
import type { Project, Todo } from '../../data/types';
import { fmtDateKey, formatDueShort, isOverdue, isToday } from '../../data/helpers';
import { Check } from '../../ui/Check';
import { ProjectChip } from '../../ui/ProjectChip';

export function TodoRow({
  todo,
  projects,
  onUpdate,
  onDelete: _onDelete,
  onContextMenu,
}: {
  todo: Todo;
  projects: Project[];
  onUpdate: (patch: Partial<Todo>) => void;
  onDelete: () => void;
  onContextMenu?: (e: MouseEvent) => void;
}) {
  const [hover, setHover] = useState(false);
  const proj = projects.find((p) => p.id === todo.projectId);
  const overdue = todo.due ? !todo.done && isOverdue(todo.due) && !isToday(todo.due) : false;
  const dueToday = todo.due ? isToday(todo.due) : false;

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-todo', todo.id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onContextMenu={(e) => {
        if (onContextMenu) {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(e);
        }
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto',
        alignItems: 'center',
        gap: 10,
        padding: '8px 8px',
        margin: '0 -8px',
        borderRadius: 6,
        background: hover ? 'var(--surface-2)' : 'transparent',
        cursor: 'grab',
        transition: 'background .12s',
      }}
    >
      <Check checked={todo.done} onChange={(v) => onUpdate({ done: v })} size={15} />
      <span
        style={{
          fontSize: 13,
          color: 'var(--ink)',
          textDecoration: todo.done ? 'line-through' : 'none',
          opacity: todo.done ? 0.5 : 1,
        }}
      >
        {todo.title}
      </span>
      {proj ? <ProjectChip project={proj} /> : <span />}
      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: overdue ? 'oklch(0.5 0.13 25)' : dueToday ? 'var(--accent)' : 'var(--ink-3)',
          fontWeight: overdue || dueToday ? 600 : 400,
          minWidth: 56,
          textAlign: 'right',
        }}
      >
        {todo.due ? formatDueShort(todo.due) : '—'}
      </span>
    </li>
  );
}

export function todayKey(): string {
  return fmtDateKey(new Date());
}
