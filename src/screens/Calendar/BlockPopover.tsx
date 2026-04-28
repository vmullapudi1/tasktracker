import { useEffect, useRef, useState } from 'react';
import type { Block, Project } from '../../data/types';
import { fmtTime, parseDateKey } from '../../data/helpers';
import { Btn } from '../../ui/Btn';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { HOUR_END, HOUR_START, SLOT_MIN } from './constants';

export interface RepeatOptions {
  days: number[]; // 0-6
  type: 'count' | 'until';
  count: number;
  until: string;
}

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
  timeFormat = '12h',
}: {
  state: PopoverState;
  projects: Project[];
  onClose: () => void;
  onSave: (patch: Pick<Block, 'title' | 'projectId' | 'start' | 'end'>, repeat?: RepeatOptions, scope?: 'one' | 'following') => void;
  onDelete?: (scope: 'one' | 'following') => void;
  timeFormat?: '12h' | '24h';
}) {
  const [title, setTitle] = useState(state.block.title || '');
  const [projectId, setProjectId] = useState(state.block.projectId);
  const [start, setStart] = useState(state.block.start);
  const [end, setEnd] = useState(state.block.end);

  // Recurrence
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const initialDay = parseDateKey(state.block.date).getDay();
  const [repeatDays, setRepeatDays] = useState<number[]>([initialDay]);
  const [repeatType, setRepeatType] = useState<'count' | 'until'>('count');
  const [repeatCount, setRepeatCount] = useState(4);
  const [repeatUntil, setRepeatUntil] = useState(state.block.date);

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

  const save = (scope: 'one' | 'following' = 'one') => {
    const patch = { title: title.trim(), projectId, start, end };
    const repeat = repeatEnabled ? { days: repeatDays, type: repeatType, count: repeatCount, until: repeatUntil } : undefined;
    onSave(patch, repeat, scope);
  };

  const handlePaste = () => {
    try {
      const raw = sessionStorage.getItem('TASKTRACK_CLIPBOARD');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.type === 'block') {
        const b = data.data as Block;
        setTitle(b.title);
        setProjectId(b.projectId);
        const duration = b.end - b.start;
        setEnd(Math.min(HOUR_END * 60, start + duration));
      }
    } catch (e) {
      console.error('Paste failed', e);
    }
  };

  const hasClipboard = sessionStorage.getItem('TASKTRACK_CLIPBOARD')?.includes('"type":"block"');

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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
          {state.isNew && hasClipboard && (
            <button
              onClick={handlePaste}
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                color: 'var(--accent)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              PASTE
            </button>
          )}
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
                  {fmtTime(m, timeFormat)}
                </option>
              ))}
          </Select>
          <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>to</span>
          <Select value={String(end)} onChange={(v) => setEnd(Number(v))} style={{ flex: 1 }}>
            {minOpts
              .filter((m) => m > start)
              .map((m) => (
                <option key={m} value={m}>
                  {fmtTime(m, timeFormat)}
                </option>
              ))}
          </Select>
        </div>

        {state.isNew && (
          <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 10, marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={repeatEnabled} onChange={(e) => setRepeatEnabled(e.target.checked)} />
              Repeat this block
            </label>
            {repeatEnabled && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                    const active = repeatDays.includes(i);
                    return (
                      <button
                        key={i}
                        onClick={() =>
                          setRepeatDays((prev) => (prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]))
                        }
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          border: '1px solid ' + (active ? 'var(--accent)' : 'var(--rule)'),
                          background: active ? 'var(--accent)' : 'transparent',
                          color: active ? 'white' : 'var(--ink-3)',
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                  <Select
                    value={repeatType}
                    onChange={(v) => setRepeatType(v as 'count' | 'until')}
                    style={{ padding: '2px 4px' }}
                  >
                    <option value="count">Repeat</option>
                    <option value="until">Until</option>
                  </Select>
                  {repeatType === 'count' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Input
                        type="number"
                        value={repeatCount}
                        onChange={(v) => setRepeatCount(Number(v))}
                        style={{ width: 50, padding: '2px 6px' }}
                      />
                      <span>times</span>
                    </div>
                  ) : (
                    <Input
                      type="date"
                      value={repeatUntil}
                      onChange={setRepeatUntil}
                      style={{ flex: 1, padding: '2px 6px' }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 4 }}>
          {onDelete ? (
            state.block.seriesId ? (
              <div style={{ display: 'flex', gap: 4 }}>
                <Btn variant="danger" onClick={() => onDelete('one')}>
                  Delete
                </Btn>
                <Btn variant="danger" onClick={() => onDelete('following')} style={{ fontSize: 10 }}>
                  All Following
                </Btn>
              </div>
            ) : (
              <Btn variant="danger" onClick={() => onDelete('one')}>
                Delete
              </Btn>
            )
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn onClick={onClose}>Cancel</Btn>
            {!state.isNew && state.block.seriesId ? (
              <div style={{ display: 'flex', gap: 4 }}>
                <Btn variant="solid" onClick={() => save('one')}>
                  Save
                </Btn>
                <Btn variant="solid" onClick={() => save('following')} style={{ fontSize: 10 }}>
                  Save Following
                </Btn>
              </div>
            ) : (
              <Btn variant="solid" onClick={() => save('one')}>
                {state.isNew ? 'Add' : 'Save'}
              </Btn>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
