import { useEffect, useRef, useState } from 'react';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    let left = x;
    let top = y;
    if (left + r.width > window.innerWidth - 8) left = window.innerWidth - r.width - 8;
    if (top + r.height > window.innerHeight - 8) top = window.innerHeight - r.height - 8;
    setPos({ left, top });
  }, [x, y]);

  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('mousedown', handleDown);
    return () => window.removeEventListener('mousedown', handleDown);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        zIndex: 2000,
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 8,
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        padding: '4px',
        minWidth: 160,
      }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
            onClose();
          }}
          style={{
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '8px 12px',
            fontSize: 13,
            color: item.danger ? 'oklch(0.5 0.13 25)' : 'var(--ink)',
            cursor: 'pointer',
            borderRadius: 4,
            transition: 'background .12s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
