import type { Project } from '../data/types';
import { paletteFor } from '../data/palette';

export function ProjectDot({ project, size = 8 }: { project: Project | null | undefined; size?: number }) {
  if (!project) return null;
  const pal = paletteFor(project.paletteIdx);
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: pal.fg,
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}
