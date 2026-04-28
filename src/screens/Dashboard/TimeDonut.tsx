import { useMemo, useState } from 'react';
import type { Project } from '../../data/types';
import { paletteFor } from '../../data/palette';
import { fmtDuration } from '../../data/helpers';

export interface DonutSegment {
  projectId: string;
  minutes: number;
}

const SIZE = 220;
const R = 86;
const STROKE = 22;

interface DonutArc extends DonutSegment {
  frac: number;
  offset: number;
  length: number;
}

export function TimeDonut({
  segments,
  projects,
  total,
}: {
  segments: DonutSegment[];
  projects: Project[];
  total: number;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const c = 2 * Math.PI * R;

  const arcs = useMemo(() => {
    return segments.reduce((accArr: DonutArc[], s) => {
      const prev = accArr[accArr.length - 1];
      const offset = prev ? prev.offset + prev.frac : 0;
      const frac = total > 0 ? s.minutes / total : 0;
      return [...accArr, { ...s, frac, offset, length: frac * c }];
    }, []);
  }, [segments, total, c]);

  const hovered = hover ? arcs.find((a) => a.projectId === hover) : null;

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE, margin: '0 auto' }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--rule)" strokeWidth={STROKE} />
        {arcs.map((s) => {
          const proj = projects.find((p) => p.id === s.projectId);
          const pal = proj ? paletteFor(proj.paletteIdx) : null;
          const dim = hover !== null && hover !== s.projectId;
          return (
            <circle
              key={s.projectId}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={pal ? pal.fg : 'var(--ink-3)'}
              strokeWidth={STROKE}
              strokeDasharray={`${s.length} ${c - s.length}`}
              strokeDashoffset={-s.offset * c}
              style={{
                opacity: dim ? 0.25 : 1,
                transition: 'opacity .15s, stroke-width .15s',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHover(s.projectId)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 500, color: 'var(--ink)' }}>
          {hovered ? `${Math.round(hovered.frac * 100)}%` : fmtDuration(total)}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginTop: 2,
          }}
        >
          {hovered ? projects.find((p) => p.id === hovered.projectId)?.code ?? '' : 'this week'}
        </div>
      </div>
    </div>
  );
}
