import type { CSSProperties, ReactNode } from 'react';

export function Card({
  title,
  action,
  children,
  style,
  contentStyle,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
}) {
  return (
    <section
      className="card"
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 10,
        padding: '18px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {title && (
        <header
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontWeight: 500,
              fontSize: 18,
              margin: 0,
              color: 'var(--ink)',
              letterSpacing: '-0.005em',
            }}
          >
            {title}
          </h2>
          {action && <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{action}</div>}
        </header>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, ...contentStyle }}>{children}</div>
    </section>
  );
}
