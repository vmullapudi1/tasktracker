import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChange: (v: string) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ value, onChange, type = 'text', style, onFocus, onBlur, ...rest }, ref) => {
    return (
      <input
        {...rest}
        ref={ref}
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
);
