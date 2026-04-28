export interface ProjectPalette {
  fg: string;
  bg: string;
  ring: string;
}

export const PROJECT_PALETTE: ProjectPalette[] = [
  { fg: 'var(--p0-fg)', bg: 'var(--p0-bg)', ring: 'var(--p0-ring)' },
  { fg: 'var(--p1-fg)', bg: 'var(--p1-bg)', ring: 'var(--p1-ring)' },
  { fg: 'var(--p2-fg)', bg: 'var(--p2-bg)', ring: 'var(--p2-ring)' },
  { fg: 'var(--p3-fg)', bg: 'var(--p3-bg)', ring: 'var(--p3-ring)' },
  { fg: 'var(--p4-fg)', bg: 'var(--p4-bg)', ring: 'var(--p4-ring)' },
  { fg: 'var(--p5-fg)', bg: 'var(--p5-bg)', ring: 'var(--p5-ring)' },
  { fg: 'var(--p6-fg)', bg: 'var(--p6-bg)', ring: 'var(--p6-ring)' },
  { fg: 'var(--p7-fg)', bg: 'var(--p7-bg)', ring: 'var(--p7-ring)' },
];

export function paletteFor(idx: number): ProjectPalette {
  return PROJECT_PALETTE[((idx % PROJECT_PALETTE.length) + PROJECT_PALETTE.length) % PROJECT_PALETTE.length];
}
