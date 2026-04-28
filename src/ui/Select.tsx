import type { ReactNode, SelectHTMLAttributes } from 'react';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}

export function Select({ value, onChange, children, style, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        font: 'inherit',
        fontSize: 13,
        color: 'var(--ink)',
        padding: '8px 10px',
        borderRadius: 6,
        border: '1px solid var(--rule)',
        background: 'var(--paper)',
        outline: 'none',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </select>
  );
}
