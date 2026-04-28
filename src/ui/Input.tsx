import type { InputHTMLAttributes } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChange: (v: string) => void;
}

export function Input({ value, onChange, type = 'text', style, onFocus, onBlur, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      type={type}
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
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--ink-2)';
        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--rule)';
        onBlur?.(e);
      }}
    />
  );
}
