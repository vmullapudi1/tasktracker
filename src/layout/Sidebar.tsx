import type { CSSProperties, ReactNode } from 'react';
import { weekNumber } from '../data/helpers';
import type { SyncStatus } from '../sync/sync-controller';

export type Tab = 'dashboard' | 'calendar' | 'projects' | 'reading';

export interface TabSpec {
  id: Tab;
  label: string;
}

export const TABS: TabSpec[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'projects', label: 'Projects' },
  { id: 'reading', label: 'Reading' },
];

export function Sidebar({
  current,
  onSelect,
  sync,
  onPickFolder,
  onFlushNow,
  onOpenSettings,
  dashboardName,
}: {
  current: Tab;
  onSelect: (tab: Tab) => void;
  sync: SyncStatus;
  onPickFolder: () => void;
  onFlushNow: () => void;
  onOpenSettings: () => void;
  dashboardName: string;
}) {
  return (
    <aside
      style={{
        background: 'var(--surface)',
        borderRight: '1px solid var(--rule)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        minHeight: 0,
      }}
    >
      <div style={{ padding: '0 8px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'var(--accent)',
            color: 'var(--paper)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--serif)',
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Φ
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.1,
              color: 'var(--ink)',
            }}
          >
            {dashboardName}
          </div>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: 'var(--ink-3)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            week {weekNumber()}
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {TABS.map((t) => (
          <NavBtn key={t.id} active={current === t.id} onClick={() => onSelect(t.id)}>
            {t.label}
          </NavBtn>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <button
        onClick={onOpenSettings}
        style={{
          appearance: 'none',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'var(--ink-2)',
          fontSize: 13,
          fontWeight: 500,
          borderRadius: 6,
          transition: 'background .12s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ fontSize: 16 }}>⚙</span>
        Settings
      </button>

      <SyncBlock sync={sync} onPickFolder={onPickFolder} onFlushNow={onFlushNow} />

      <div
        style={{
          padding: '12px',
          fontSize: 11,
          color: 'var(--ink-3)',
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          lineHeight: 1.4,
          borderTop: '1px solid var(--rule)',
          marginTop: 12,
        }}
      >
        “The scholar's life is the discipline of attention.”
      </div>
    </aside>
  );
}

const NAV_BASE: CSSProperties = {
  appearance: 'none',
  border: 'none',
  cursor: 'pointer',
  font: 'inherit',
  padding: '8px 12px',
  borderRadius: 6,
  textAlign: 'left',
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  transition: 'background .12s, color .12s',
};

function NavBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const baseBg = active ? 'var(--paper)' : 'transparent';
  return (
    <button
      onClick={onClick}
      style={{
        ...NAV_BASE,
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--accent)' : 'var(--ink-2)',
        background: baseBg,
        boxShadow: active ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'var(--surface-2)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

function SyncBlock({
  sync,
  onPickFolder,
  onFlushNow,
}: {
  sync: SyncStatus;
  onPickFolder: () => void;
  onFlushNow: () => void;
}) {
  const ready = sync.folderConnected && sync.permissionGranted;
  return (
    <div
      style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--rule)',
        marginTop: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Sync
      </div>
      {!sync.supported ? (
        <div style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.4 }}>
          Folder sync unavailable in this browser.
        </div>
      ) : !ready ? (
        <button
          onClick={onPickFolder}
          style={{
            appearance: 'none',
            border: '1px dashed var(--rule-strong)',
            background: 'transparent',
            color: 'var(--ink-2)',
            font: 'inherit',
            fontSize: 12,
            padding: '6px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          {sync.folderConnected ? 'Reauthorize folder' : 'Connect a sync folder'}
        </button>
      ) : (
        <SyncSummary sync={sync} onFlushNow={onFlushNow} onPickFolder={onPickFolder} />
      )}
      {sync.error && (
        <div style={{ fontSize: 11, color: 'oklch(0.5 0.13 25)', lineHeight: 1.3 }}>{sync.error}</div>
      )}
    </div>
  );
}

function SyncSummary({
  sync,
  onFlushNow,
  onPickFolder,
}: {
  sync: SyncStatus;
  onFlushNow: () => void;
  onPickFolder: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: 'var(--ink-3)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ color: 'var(--ink-2)' }}>{relTime(sync.lastFlushedAt)}</span>
        <button
          onClick={onFlushNow}
          style={{
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--accent)',
            font: 'inherit',
            fontSize: 11,
            padding: 0,
          }}
        >
          sync now
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span>{sync.pendingCount > 0 ? `${sync.pendingCount} pending` : 'up to date'}</span>
        <button
          onClick={onPickFolder}
          style={{
            appearance: 'none',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--ink-3)',
            font: 'inherit',
            fontSize: 11,
            padding: 0,
          }}
        >
          change…
        </button>
      </div>
    </div>
  );
}

function relTime(ts: number): string {
  if (!ts) return 'never synced';
  const diff = Math.max(0, Date.now() - ts);
  if (diff < 60_000) return 'just now';
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
