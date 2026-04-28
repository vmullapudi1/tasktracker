import type { CSSProperties, ReactNode } from 'react';

export function Empty({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        padding: '24px 12px',
        textAlign: 'center',
        color: 'var(--ink-3)',
        fontSize: 13,
        fontStyle: 'italic',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
