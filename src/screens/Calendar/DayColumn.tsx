import { useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import type { Block, Project } from '../../data/types';
import { fmtTime } from '../../data/helpers';
import { HOUR_END, HOUR_HEIGHT, HOUR_START, SLOT_HEIGHT, SLOT_MIN } from './constants';
import { BlockEl } from './BlockEl';

export interface DragState {
  dateKey: string;
  startMin: number;
  endMin: number;
  dayIdx: number;
}

export function DayColumn({
  date: _date,
  dateKey,
  dayIdx,
  blocks,
  projects,
  drag,
  setDrag,
  onBlockClick,
  onCreateBlock,
  onDropTodo,
}: {
  date: Date;
  dateKey: string;
  dayIdx: number;
  blocks: Block[];
  projects: Project[];
  drag: DragState | null;
  setDrag: (drag: DragState | null) => void;
  onBlockClick: (block: Block, e: MouseEvent) => void;
  onCreateBlock: (args: { dateKey: string; startMin: number; endMin: number; clientX: number; clientY: number }) => void;
  onDropTodo: (args: { todoId: string; dateKey: string; startMin: number }) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dropHover, setDropHover] = useState<number | null>(null);

  const yToMin = (y: number): number => {
    const slots = Math.round(y / SLOT_HEIGHT);
    return Math.max(HOUR_START * 60, Math.min(HOUR_END * 60, HOUR_START * 60 + slots * SLOT_MIN));
  };

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target !== ref.current && !target.classList.contains('cal-bg')) return;
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const y0 = e.clientY - rect.top;
    const startMin = yToMin(y0);
    const initial: DragState = {
      dateKey,
      startMin,
      endMin: startMin + SLOT_MIN,
      dayIdx,
    };
    setDrag(initial);

    let current = initial;

    const onMove = (ev: globalThis.MouseEvent) => {
      const y = ev.clientY - rect.top;
      const m = yToMin(y);
      const next: DragState = { ...current, endMin: Math.max(current.startMin + SLOT_MIN, m) };
      current = next;
      setDrag(next);
    };
    const onUp = (ev: globalThis.MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      const s = Math.min(current.startMin, current.endMin);
      const eMin = Math.max(current.startMin, current.endMin);
      setDrag(null);
      if (eMin - s < SLOT_MIN) return;
      onCreateBlock({
        dateKey: current.dateKey,
        startMin: s,
        endMin: eMin,
        clientX: ev.clientX,
        clientY: ev.clientY,
      });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      ref={ref}
      className="cal-bg"
      onMouseDown={onMouseDown}
      onDragOver={(e) => {
        if (!ref.current) return;
        if (!e.dataTransfer.types.includes('application/x-todo')) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        const rect = ref.current.getBoundingClientRect();
        setDropHover(yToMin(e.clientY - rect.top));
      }}
      onDragLeave={() => setDropHover(null)}
      onDrop={(e) => {
        const todoId = e.dataTransfer.getData('application/x-todo');
        setDropHover(null);
        if (!todoId || !ref.current) return;
        e.preventDefault();
        const rect = ref.current.getBoundingClientRect();
        const m = yToMin(e.clientY - rect.top);
        onDropTodo({ todoId, dateKey, startMin: m });
      }}
      style={{
        position: 'relative',
        height: (HOUR_END - HOUR_START) * HOUR_HEIGHT,
        borderLeft: '1px solid var(--rule)',
        cursor: 'crosshair',
        userSelect: 'none',
      }}
    >
      {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
        <div
          key={i}
          className="cal-bg"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: i * HOUR_HEIGHT,
            height: HOUR_HEIGHT,
            borderTop: i === 0 ? 'none' : '1px solid var(--rule)',
            pointerEvents: 'none',
          }}
        >
          <div
            className="cal-bg"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: HOUR_HEIGHT / 2,
              borderTop: '1px dashed var(--rule)',
              opacity: 0.7,
              pointerEvents: 'none',
            }}
          />
        </div>
      ))}

      {blocks.map((b) => (
        <BlockEl key={b.id} block={b} projects={projects} onClick={(e) => onBlockClick(b, e)} />
      ))}

      {drag && drag.dateKey === dateKey && <DragPreview drag={drag} />}
      {dropHover != null && <DropPreview startMin={dropHover} />}
    </div>
  );
}

function DropPreview({ startMin }: { startMin: number }) {
  const top = ((startMin - HOUR_START * 60) / 60) * HOUR_HEIGHT;
  return (
    <div
      style={{
        position: 'absolute',
        left: 2,
        right: 2,
        top,
        height: HOUR_HEIGHT,
        background: 'oklch(0.55 0.13 250 / 0.12)',
        border: '1.5px dashed var(--accent)',
        borderRadius: 4,
        pointerEvents: 'none',
        zIndex: 4,
        padding: '6px 8px',
        fontSize: 11,
        color: 'var(--accent)',
        fontFamily: 'var(--mono)',
      }}
    >
      drop to schedule at {fmtTime(startMin)}
    </div>
  );
}

function DragPreview({ drag }: { drag: DragState }) {
  const s = Math.min(drag.startMin, drag.endMin);
  const e = Math.max(drag.startMin, drag.endMin);
  const top = ((s - HOUR_START * 60) / 60) * HOUR_HEIGHT;
  const h = ((e - s) / 60) * HOUR_HEIGHT;
  return (
    <div
      style={{
        position: 'absolute',
        left: 2,
        right: 2,
        top,
        height: h,
        background: 'oklch(0.55 0.13 250 / 0.15)',
        border: '1.5px dashed var(--accent)',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'flex-start',
        padding: '6px 8px',
        fontSize: 11,
        fontFamily: 'var(--mono)',
        color: 'var(--accent)',
        pointerEvents: 'none',
        zIndex: 4,
      }}
    >
      {fmtTime(s)} – {fmtTime(e)}
    </div>
  );
}
