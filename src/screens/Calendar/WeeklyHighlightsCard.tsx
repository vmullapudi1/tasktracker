import { useState, useCallback } from 'react';
import type { Rep } from '../../store/replicache';
import { useHighlights } from '../../store/subscriptions';
import { Card } from '../../ui/Card';

interface Props {
  rep: Rep | null;
  weekId: string;
  style?: React.CSSProperties;
}

export function WeeklyHighlightsCard({ rep, weekId, style }: Props) {
  const highlights = useHighlights(rep);
  const highlight = highlights.find((h) => h.id === weekId);

  const [local, setLocal] = useState({
    top3: '',
    movedForward: '',
    stalled: '',
  });

  const [lastWeekId, setLastWeekId] = useState(weekId);
  if (weekId !== lastWeekId) {
    setLastWeekId(weekId);
    setLocal(
      highlight
        ? { top3: highlight.top3, movedForward: highlight.movedForward, stalled: highlight.stalled }
        : { top3: '', movedForward: '', stalled: '' }
    );
  }

  // Also sync if highlight changes from external source while on same week
  const [lastHighlight, setLastHighlight] = useState(highlight);
  if (highlight !== lastHighlight) {
    setLastHighlight(highlight);
    if (highlight) {
      setLocal({
        top3: highlight.top3,
        movedForward: highlight.movedForward,
        stalled: highlight.stalled,
      });
    }
  }

  const save = useCallback(
    (patch: { top3?: string; movedForward?: string; stalled?: string }) => {
      if (!rep) return;
      void rep.mutate.setHighlight({
        id: weekId,
        patch,
      });
    },
    [rep, weekId]
  );

  const handleChange = (field: keyof typeof local, value: string) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof typeof local) => {
    save({ [field]: local[field] });
  };

  return (
    <Card title="Weekly Highlights" style={style}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Top 3 things I worked on">
          <HighlightTextarea
            value={local.top3}
            onChange={(v) => handleChange('top3', v)}
            onBlur={() => handleBlur('top3')}
            placeholder="Focus areas..."
          />
        </Field>
        <Field label="What moved forward this week">
          <HighlightTextarea
            value={local.movedForward}
            onChange={(v) => handleChange('movedForward', v)}
            onBlur={() => handleBlur('movedForward')}
            placeholder="Victories and progress..."
          />
        </Field>
        <Field label="What stalled my progress">
          <HighlightTextarea
            value={local.stalled}
            onChange={(v) => handleChange('stalled', v)}
            onBlur={() => handleBlur('stalled')}
            placeholder="Obstacles and blockers..."
          />
        </Field>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontFamily: 'var(--mono)',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function HighlightTextarea({
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={3}
      style={{
        font: 'inherit',
        fontSize: 13,
        lineHeight: 1.5,
        color: 'var(--ink)',
        padding: '8px 10px',
        borderRadius: 6,
        border: '1px solid var(--rule)',
        background: 'var(--paper)',
        outline: 'none',
        resize: 'none',
        transition: 'border-color .12s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--ink-2)';
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderColor = 'var(--rule)';
      }}
    />
  );
}
