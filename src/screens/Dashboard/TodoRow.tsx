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
  selected,
  onSelect,
}: {
  todo: Todo;
  projects: Project[];
  onUpdate: (patch: Partial<Todo>) => void;
  onDelete: () => void;
  onContextMenu?: (e: MouseEvent) => void;
  selected?: boolean;
  onSelect?: (v: boolean) => void;
}) {
  const [hover, setHover] = useState(false);
  const proj = projects.find((p) => p.id === todo.projectId);
  const overdue = todo.due ? !todo.done && isOverdue(todo.due) && !isToday(todo.due) : false;
  const dueToday = todo.due ? isToday(todo.due) : false;

  const priorityColor = (p?: string) => {
    if (p === 'high') return 'oklch(0.6 0.18 20)';
    if (p === 'medium') return 'oklch(0.75 0.15 70)';
    if (p === 'low') return 'oklch(0.8 0.1 140)';
    return 'transparent';
  };

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
        gridTemplateColumns: 'auto 1fr auto auto auto',
        alignItems: 'center',
        gap: 8,
        padding: '6px 8px',
        margin: '0 -8px',
        borderRadius: 6,
        background: hover ? 'var(--surface-2)' : 'transparent',
        cursor: 'grab',
        transition: 'background .12s',
        borderLeft: `4px solid ${priorityColor(todo.priority)}`,
      }}
      title={todo.priority ? `Priority: ${todo.priority}` : 'Normal priority'}
    >
      <Check checked={todo.done} onChange={(v) => onUpdate({ done: v })} size={15} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
        <span
          style={{
            fontSize: 13,
            color: 'var(--ink)',
            textDecoration: todo.done ? 'line-through' : 'none',
            opacity: todo.done ? 0.5 : 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexShrink: 1
          }}
        >
          {todo.title}
        </span>
        {todo.tags && todo.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
        {proj && <ProjectChip project={proj} />}
      </div>

      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: overdue ? 'oklch(0.5 0.13 25)' : dueToday ? 'var(--accent)' : 'var(--ink-3)',
          fontWeight: overdue || dueToday ? 600 : 400,
          minWidth: 40,
          textAlign: 'right',
        }}
      >
        {todo.due ? formatDueShort(todo.due) : '—'}
      </span>

      <div style={{ width: 24, display: 'flex', justifyContent: 'center' }}>
        {onSelect && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onSelect(!selected);
            }}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--rule-strong)'}`,
              background: selected ? 'var(--accent)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .15s'
            }}
            title="Click to select for bulk priority"
          >
            {selected && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'white' }} />}
          </div>
        )}
      </div>
    </li>
  );
}
