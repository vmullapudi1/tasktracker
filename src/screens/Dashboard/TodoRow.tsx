import { useState } from 'react';
import type { MouseEvent } from 'react';
import type { Project, Todo } from '../../data/types';
import { formatDueShort, isOverdue, isToday } from '../../data/helpers';
import { Check } from '../../ui/Check';
import { ProjectChip } from '../../ui/ProjectChip';

export function TodoRow({
  todo,
  projects,
  onUpdate,
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
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
        {todo.tags && todo.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4 }}>
            {todo.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  color: 'var(--accent)',
                  background: 'var(--surface-2)',
                  padding: '1px 5px',
                  borderRadius: 4,
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
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
