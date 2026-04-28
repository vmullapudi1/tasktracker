import type { ReactNode } from 'react';

export function Field({ label, children, hint }: { label: ReactNode; children: ReactNode; hint?: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{hint}</span>}
    </label>
  );
}
