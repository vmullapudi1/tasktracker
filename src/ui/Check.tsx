import type { ReactNode } from 'react';

export function Check({
  checked,
  onChange,
  label,
  size = 16,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
  size?: number;
}) {
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: size,
          height: size,
          borderRadius: 4,
          border: '1.5px solid ' + (checked ? 'var(--accent)' : 'var(--rule-strong)'),
          background: checked ? 'var(--accent)' : 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background .12s, border-color .12s',
        }}
      >
        {checked && (
          <svg width={size - 6} height={size - 6} viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6.5L5 9L10 3.5"
              stroke="var(--paper)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}
