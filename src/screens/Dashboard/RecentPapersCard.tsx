import type { Paper, Project } from '../../data/types';
import { paletteFor } from '../../data/palette';
import { Card } from '../../ui/Card';
import { Empty } from '../../ui/Empty';
import { ProjectChip } from '../../ui/ProjectChip';

export function RecentPapersCard({
  papers,
  projects,
  onGoToReading,
}: {
  papers: Paper[];
  projects: Project[];
  onGoToReading: () => void;
}) {
  const recent = papers
    .filter((p) => p.read)
    .slice()
    .sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''))
    .slice(0, 3);

  return (
    <Card
      title="Recent reading"
      action={
        <a onClick={onGoToReading} style={{ cursor: 'pointer', color: 'var(--ink-3)' }}>
          view all →
        </a>
      }
    >
      {recent.length === 0 ? (
        <Empty>No papers marked as read yet.</Empty>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {recent.map((paper) => {
            const proj = projects.find((p) => p.id === paper.projectId);
            const ringColor = proj ? paletteFor(proj.paletteIdx).ring : 'var(--rule-strong)';
            return (
              <li
                key={paper.id}
                style={{
                  paddingBottom: 14,
                  borderBottom: '1px solid var(--rule)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 15,
                      fontWeight: 500,
                      margin: 0,
                      color: 'var(--ink)',
                      flex: 1,
                      lineHeight: 1.3,
                    }}
                  >
                    {paper.title}
                  </h3>
                  {proj && <ProjectChip project={proj} />}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    marginBottom: 8,
                    fontStyle: 'italic',
                  }}
                >
                  {paper.authors} · {paper.venue}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: 'var(--ink-2)',
                    lineHeight: 1.5,
                    paddingLeft: 12,
                    borderLeft: `2px solid ${ringColor}`,
                  }}
                >
                  <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Takeaway. </span>
                  {paper.takeaway}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
