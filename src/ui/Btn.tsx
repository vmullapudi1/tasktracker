import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type Variant = 'ghost' | 'solid' | 'soft' | 'danger' | 'accent';
type Size = 'sm' | 'md';

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: '5px 10px', fontSize: 12, borderRadius: 6 },
  md: { padding: '7px 14px', fontSize: 13, borderRadius: 7 },
};

const VARIANTS: Record<Variant, CSSProperties> = {
  ghost: { background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--rule-strong)' },
  solid: { background: 'var(--ink)', color: 'var(--paper)', border: '1px solid var(--ink)' },
  soft: { background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid transparent' },
  accent: { background: 'var(--accent)', color: 'white', border: '1px solid var(--accent)' },
  danger: {
    background: 'transparent',
    color: 'oklch(0.5 0.13 25)',
    border: '1px solid oklch(0.85 0.04 25)',
  },
};

const HOVER: Record<Variant, string> = {
  ghost: 'var(--surface-2)',
  solid: 'var(--ink-soft)',
  soft: 'var(--rule)',
  accent: 'var(--accent)', // will refine with opacity or shade if needed
  danger: 'oklch(0.95 0.02 25)',
};

export interface BtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}

export function Btn({ children, variant = 'ghost', size = 'sm', style, onMouseEnter, onMouseLeave, ...rest }: BtnProps) {
  const baseBg = VARIANTS[variant].background as string;
  return (
    <button
      className="btn"
      {...rest}
      style={{
        appearance: 'none',
        cursor: 'pointer',
        font: 'inherit',
        fontWeight: 500,
        letterSpacing: '0.005em',
        whiteSpace: 'nowrap',
        transition: 'background .12s, color .12s, border-color .12s',
        ...SIZES[size],
        ...VARIANTS[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = HOVER[variant];
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = baseBg;
        onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}
