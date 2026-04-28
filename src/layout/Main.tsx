import type { ReactNode } from 'react';
import type { Tab } from './Sidebar';

interface Heading {
  title: string;
  sub: string;
}

function snapshotLabel(): string {
  const d = new Date();
  return `Snapshot · ${d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })}`;
}

function headingFor(tab: Tab): Heading {
  switch (tab) {
    case 'dashboard':
      return { title: 'Dashboard', sub: snapshotLabel() };
    case 'calendar':
      return { title: 'Calendar', sub: 'Log time by dragging across the grid.' };
    case 'kanban':
      return { title: 'Kanban', sub: 'Manage research tasks visually across columns.' };
    case 'insights':
      return { title: 'Insights', sub: 'Visualize your progress and momentum.' };
    case 'projects':
      return { title: 'Projects', sub: 'Define phases and track long-term progress.' };
    case 'reading':
      return { title: 'Reading', sub: 'Capture summaries and key takeaways.' };
  }
}

export function Main({ tab, children }: { tab: Tab; children: ReactNode }) {
  const heading = headingFor(tab);
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 36px',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 22,
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--serif)',
              fontSize: 30,
              fontWeight: 500,
              color: 'var(--ink)',
              letterSpacing: '-0.015em',
            }}
          >
            {heading.title}
          </h1>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 13,
              color: 'var(--ink-3)',
              fontStyle: 'italic',
            }}
          >
            {heading.sub}
          </p>
        </div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--ink-3)',
            letterSpacing: '0.04em',
          }}
        >
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: 4,
          paddingBottom: 8,
        }}
      >
        {children}
      </div>
    </main>
  );
}
