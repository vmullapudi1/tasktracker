import type { ReactNode } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 16, 8, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--paper)',
          borderRadius: 12,
          minWidth: 460,
          maxWidth: 560,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          border: '1px solid var(--rule)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
        }}
      >
        {title && (
          <div
            style={{
              padding: '18px 22px',
              borderBottom: '1px solid var(--rule)',
              fontFamily: 'var(--serif)',
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            {title}
          </div>
        )}
        <div style={{ padding: '20px 22px', overflowY: 'auto' }}>{children}</div>
        {footer && (
          <div
            style={{
              padding: '14px 22px',
              borderTop: '1px solid var(--rule)',
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
