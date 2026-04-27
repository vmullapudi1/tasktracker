export interface ProjectPalette {
  fg: string;
  bg: string;
  ring: string;
}

export const PROJECT_PALETTE: ProjectPalette[] = [
  { fg: 'oklch(0.55 0.13 250)', bg: 'oklch(0.92 0.04 250)', ring: 'oklch(0.7 0.09 250)' },
  { fg: 'oklch(0.5 0.12 30)', bg: 'oklch(0.92 0.04 30)', ring: 'oklch(0.65 0.09 30)' },
  { fg: 'oklch(0.5 0.1 145)', bg: 'oklch(0.92 0.04 145)', ring: 'oklch(0.65 0.08 145)' },
  { fg: 'oklch(0.5 0.12 300)', bg: 'oklch(0.92 0.04 300)', ring: 'oklch(0.65 0.09 300)' },
  { fg: 'oklch(0.55 0.1 80)', bg: 'oklch(0.92 0.04 80)', ring: 'oklch(0.7 0.08 80)' },
  { fg: 'oklch(0.5 0.1 200)', bg: 'oklch(0.92 0.04 200)', ring: 'oklch(0.65 0.08 200)' },
  { fg: 'oklch(0.5 0.12 350)', bg: 'oklch(0.92 0.04 350)', ring: 'oklch(0.65 0.09 350)' },
  { fg: 'oklch(0.5 0.05 60)', bg: 'oklch(0.92 0.02 60)', ring: 'oklch(0.65 0.04 60)' },
];

export function paletteFor(idx: number): ProjectPalette {
  return PROJECT_PALETTE[((idx % PROJECT_PALETTE.length) + PROJECT_PALETTE.length) % PROJECT_PALETTE.length];
}
