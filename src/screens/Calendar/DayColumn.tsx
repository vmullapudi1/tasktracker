import { useRef } from 'react';
import type { MouseEvent } from 'react';
import type { Block, Project } from '../../data/types';
import { HOUR_END, HOUR_HEIGHT, HOUR_START } from './constants';
import { BlockEl } from './BlockEl';

export function DayColumn({
  date: _date,
  blocks,
  projects,
  onBlockClick,
}: {
  date: Date;
  blocks: Block[];
  projects: Project[];
  onBlockClick: (block: Block, e: MouseEvent) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={ref}
      className="cal-bg"
      style={{
        position: 'relative',
        height: (HOUR_END - HOUR_START) * HOUR_HEIGHT,
        borderLeft: '1px solid var(--rule)',
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
    </div>
  );
}
