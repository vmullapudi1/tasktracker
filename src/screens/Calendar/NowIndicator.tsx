import { useEffect, useState } from 'react';
import { addDays, fmtDateKey } from '../../data/helpers';
import { HOUR_END, HOUR_HEIGHT, HOUR_START } from './constants';

export function NowIndicator({ monday }: { monday: Date }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const todayKey = fmtDateKey(now);
  const dayIdx = [0, 1, 2, 3, 4, 5, 6].find((i) => fmtDateKey(addDays(monday, i)) === todayKey);
  if (dayIdx === undefined) return null;

  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins < HOUR_START * 60 || mins > HOUR_END * 60) return null;

  const top = ((mins - HOUR_START * 60) / 60) * HOUR_HEIGHT;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        height: 1,
        left: `calc(56px + ${dayIdx} * (100% - 56px) / 7)`,
        width: 'calc((100% - 56px) / 7)',
        background: 'var(--accent)',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -5,
          top: -4,
          width: 9,
          height: 9,
          borderRadius: 999,
          background: 'var(--accent)',
        }}
      />
    </div>
  );
}
