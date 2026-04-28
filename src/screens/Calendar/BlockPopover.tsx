import { useEffect, useRef, useState } from 'react';
import type { Block, Project } from '../../data/types';
import { fmtTime } from '../../data/helpers';
import { Btn } from '../../ui/Btn';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { HOUR_END, HOUR_START, SLOT_MIN } from './constants';

export interface PopoverState {
  block: Block;
  isNew: boolean;
  anchor: { x: number; y: number };
}

export function BlockPopover({
  state,
  projects,
  onClose,
  onSave,
  onDelete,
}: {
  state: PopoverState;
  projects: Project[];
  onClose: () => void;
  onSave: (patch: Pick<Block, 'title' | 'projectId' | 'start' | 'end'>) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(state.block.title || '');
  const [projectId, setProjectId] = useState(state.block.projectId);
  const [start, setStart] = useState(state.block.start);
  const [end, setEnd] = useState(state.block.end);

  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ left: state.anchor.x + 8, top: state.anchor.y + 8 });

  useEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    let left = state.anchor.x + 8;
    let top = state.anchor.y + 8;
    if (left + r.width > window.innerWidth - 16) left = window.innerWidth - r.width - 16;
    if (top + r.height > window.innerHeight - 16) top = state.anchor.y - r.height - 8;
    if (left < 16) left = 16;
    if (top < 16) top = 16;
    setPos({ left, top });
  }, [state.anchor.x, state.anchor.y]);

  const save = () => onSave({ title: title.trim(), projectId, start, end });

  const minOpts: number[] = [];
  for (let m = HOUR_START * 60; m <= HOUR_END * 60; m += SLOT_MIN) {
    minOpts.push(m);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
      <div
        ref={ref}
        style={{
          position: 'fixed',
          left: pos.left,
          top: pos.top,
          zIndex: 1000,
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 10,
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          padding: 16,
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 500,
          }}
        >
          {state.isNew ? 'new block' : 'edit block'}
        </div>
        <Input
          value={title}
          onChange={setTitle}
          placeholder="Title (e.g. Cohort B session)"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') onClose();
          }}
        />
        <Select value={projectId} onChange={setProjectId}>
          {projects
            .filter((p) => p.active)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
        </Select>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Select value={String(start)} onChange={(v) => setStart(Number(v))} style={{ flex: 1 }}>
            {minOpts
              .filter((m) => m < end)
              .map((m) => (
                <option key={m} value={m}>
                  {fmtTime(m)}
                </option>
              ))}
          </Select>
          <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>to</span>
          <Select value={String(end)} onChange={(v) => setEnd(Number(v))} style={{ flex: 1 }}>
            {minOpts
              .filter((m) => m > start)
              .map((m) => (
                <option key={m} value={m}>
                  {fmtTime(m)}
                </option>
              ))}
          </Select>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 4 }}>
          {onDelete ? (
            <Btn variant="danger" onClick={onDelete}>
              Delete
            </Btn>
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn variant="solid" onClick={save}>
              {state.isNew ? 'Add' : 'Save'}
            </Btn>
          </div>
        </div>
      </div>
    </>
  );
}
