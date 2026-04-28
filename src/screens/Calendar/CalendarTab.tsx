import { useState } from 'react';
import { addDays, fmtDateKey, fmtTime, startOfWeek } from '../../data/helpers';
import type { Rep } from '../../store/replicache';
import { Btn } from '../../ui/Btn';
import { HOUR_END, HOUR_HEIGHT, HOUR_START } from './constants';
import { DayColumn } from './DayColumn';
import { NowIndicator } from './NowIndicator';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const left = `${MONTH_SHORT[monday.getMonth()]} ${monday.getDate()}`;
  const right = `${MONTH_SHORT[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`;
  return `${left} – ${right}`;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarTab({ rep: _rep }: { rep: Rep | null }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const monday = addDays(startOfWeek(new Date()), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const todayKey = fmtDateKey(new Date());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 22,
              fontWeight: 500,
              margin: 0,
              color: 'var(--ink)',
            }}
          >
            {fmtWeekRange(monday)}
          </h2>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 11,
                color: 'var(--accent)',
                font: 'inherit',
              }}
            >
              jump to today
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn onClick={() => setWeekOffset((w) => w - 1)}>← prev</Btn>
          <Btn onClick={() => setWeekOffset((w) => w + 1)}>next →</Btn>
        </div>
      </div>

      <div
        style={{
          fontSize: 11.5,
          color: 'var(--ink-3)',
          padding: '0 4px',
          display: 'flex',
          gap: 18,
          alignItems: 'center',
        }}
      >
        <span>
          <Kbd>drag</Kbd> a slot to create a block
        </span>
        <span>
          <Kbd>drop</Kbd> a todo from the dashboard to schedule it
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '56px repeat(7, 1fr)',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <div />
        {days.map((d) => {
          const isToday = fmtDateKey(d) === todayKey;
          return (
            <div
              key={d.toISOString()}
              style={{
                padding: '6px 10px 10px',
                textAlign: 'left',
                borderLeft: '1px solid var(--rule)',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--mono)',
                  color: 'var(--ink-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {WEEKDAY_SHORT[d.getDay()]}
              </div>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 22,
                  fontWeight: 500,
                  color: isToday ? 'var(--accent)' : 'var(--ink)',
                  lineHeight: 1.1,
                }}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '56px repeat(7, 1fr)',
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          border: '1px solid var(--rule)',
          borderRadius: 8,
          background: 'var(--paper)',
        }}
      >
        <div style={{ borderRight: '1px solid var(--rule)', position: 'relative' }}>
          {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
            <div
              key={i}
              style={{
                height: HOUR_HEIGHT,
                padding: '4px 6px 0 0',
                textAlign: 'right',
                fontSize: 10,
                fontFamily: 'var(--mono)',
                color: 'var(--ink-3)',
                borderTop: i === 0 ? 'none' : '1px solid var(--rule)',
              }}
            >
              {fmtTime((HOUR_START + i) * 60)}
            </div>
          ))}
        </div>
        {days.map((d) => (
          <DayColumn key={d.toISOString()} date={d} />
        ))}
        <NowIndicator monday={monday} />
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        padding: '2px 5px',
        background: 'var(--surface-2)',
        borderRadius: 3,
        marginRight: 4,
      }}
    >
      {children}
    </span>
  );
}
