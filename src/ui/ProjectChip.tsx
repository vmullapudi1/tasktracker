import type { Project } from '../data/types';
import { paletteFor } from '../data/palette';

export function ProjectChip({ project, size = 'sm' }: { project: Project | null | undefined; size?: 'sm' | 'md' }) {
  if (!project) return null;
  const pal = paletteFor(project.paletteIdx);
  const px = size === 'sm' ? '2px 8px' : '4px 10px';
  const fs = size === 'sm' ? 11 : 12;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: px,
        borderRadius: 999,
        background: pal.bg,
        color: pal.fg,
        fontSize: fs,
        fontWeight: 500,
        lineHeight: 1.2,
        letterSpacing: '0.005em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: pal.fg,
          flexShrink: 0,
        }}
      />
      {project.code}
    </span>
  );
}
