import type { MouseEvent } from 'react';
import type { Block, Project } from '../../data/types';
import { paletteFor } from '../../data/palette';
import { fmtTime } from '../../data/helpers';
import { HOUR_HEIGHT, HOUR_START } from './constants';

export function BlockEl({
  block,
  projects,
  onClick,
}: {
  block: Block;
  projects: Project[];
  onClick: (e: MouseEvent) => void;
}) {
  const proj = projects.find((p) => p.id === block.projectId);
  const pal = proj ? paletteFor(proj.paletteIdx) : null;
  const top = ((block.start - HOUR_START * 60) / 60) * HOUR_HEIGHT;
  const h = ((block.end - block.start) / 60) * HOUR_HEIGHT;
  const compact = h < 36;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: 2,
        right: 2,
        top,
        height: h,
        background: pal ? pal.bg : 'var(--surface-2)',
        borderLeft: `3px solid ${pal ? pal.fg : 'var(--ink-3)'}`,
        borderRadius: 4,
        padding: compact ? '3px 8px' : '6px 8px',
        fontSize: 12,
        lineHeight: 1.25,
        color: pal ? pal.fg : 'var(--ink)',
        cursor: 'pointer',
        overflow: 'hidden',
        zIndex: 2,
        transition: 'transform .08s, box-shadow .08s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
        e.currentTarget.style.zIndex = '3';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.zIndex = '2';
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: compact ? 11.5 : 12.5,
          color: 'var(--ink)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {block.title || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>untitled</span>}
      </div>
      {!compact && (
        <div
          style={{
            fontSize: 10.5,
            fontFamily: 'var(--mono)',
            opacity: 0.85,
            marginTop: 2,
          }}
        >
          {fmtTime(block.start)}–{fmtTime(block.end)}
        </div>
      )}
    </div>
  );
}
