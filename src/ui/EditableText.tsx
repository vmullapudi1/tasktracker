import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

export function EditableText({
  value,
  onChange,
  placeholder = 'Untitled',
  style,
  multiline = false,
  inputStyle,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: CSSProperties;
  multiline?: boolean;
  inputStyle?: CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  if (editing) {
    const sharedProps = {
      autoFocus: true,
      ref: (el: HTMLInputElement | HTMLTextAreaElement | null) => {
        inputRef.current = el;
      },
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !multiline) {
          e.preventDefault();
          commit();
        }
        if (e.key === 'Escape') {
          setDraft(value);
          setEditing(false);
        }
      },
      style: {
        font: 'inherit',
        color: 'inherit',
        background: 'var(--surface-2)',
        border: '1px solid var(--rule)',
        borderRadius: 4,
        padding: '2px 6px',
        outline: 'none',
        width: '100%',
        resize: multiline ? ('vertical' as const) : ('none' as const),
        minHeight: multiline ? 60 : undefined,
        ...inputStyle,
      },
    };
    return multiline ? <textarea {...sharedProps} /> : <input {...sharedProps} />;
  }

  return (
    <span
      onClick={() => setEditing(true)}
      style={{
        cursor: 'text',
        display: 'inline-block',
        padding: '2px 6px',
        margin: '-2px -6px',
        borderRadius: 4,
        color: value ? 'inherit' : 'var(--ink-3)',
        whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {value || placeholder}
    </span>
  );
}
