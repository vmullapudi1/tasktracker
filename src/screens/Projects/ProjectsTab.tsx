import { useState } from 'react';
import type { Project } from '../../data/types';
import { uid } from '../../data/helpers';
import { PROJECT_PALETTE } from '../../data/palette';
import type { Rep } from '../../store/replicache';
import { useProjects, useTodos } from '../../store/subscriptions';
import { ProjectList } from './ProjectList';
import { ProjectDetail } from './ProjectDetail';

export function ProjectsTab({ 
  rep, 
  navigatedId, 
  onNavigated 
}: { 
  rep: Rep | null;
  navigatedId?: string | null;
  onNavigated?: () => void;
}) {
  const projects = useProjects(rep);
  const todos = useTodos(rep);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [lastNavigatedId, setLastNavigatedId] = useState<string | null>(null);
  if (navigatedId !== lastNavigatedId) {
    setLastNavigatedId(navigatedId ?? null);
    if (navigatedId) setSelectedId(navigatedId);
    onNavigated?.();
  }

  const effectiveId = (selectedId && projects.some((p) => p.id === selectedId)) 
    ? selectedId 
    : (projects[0]?.id ?? null);

  const selected = projects.find((p) => p.id === effectiveId) ?? null;

  const update = (patch: Partial<Project>) => {
    if (!rep || !selected) return;
    void rep.mutate.updateProject({ id: selected.id, patch });
  };

  const addProject = () => {
    if (!rep) return;
    const used = new Set(projects.map((p) => p.paletteIdx));
    let paletteIdx = 0;
    for (let i = 0; i < PROJECT_PALETTE.length; i++) {
      if (!used.has(i)) {
        paletteIdx = i;
        break;
      }
    }
    const np: Project = {
      id: uid(),
      name: 'New project',
      code: 'NEW',
      active: true,
      paletteIdx,
      targetHours: 100,
      hoursLogged: 0,
      phases: [
        {
          id: uid(),
          name: 'Phase 1',
          done: false,
          checkpoints: [{ id: uid(), name: 'First checkpoint', done: false }],
        },
      ],
      updates: [],
    };
    void rep.mutate.addProject(np);
    setSelectedId(np.id);
  };

  const deleteSelected = () => {
    if (!rep || !selected) return;
    if (
      !confirm(
        'Delete this project? Calendar blocks and todos referencing it will keep the reference.',
      )
    )
      return;
    const next = projects.find((p) => p.id !== selected.id) ?? null;
    void rep.mutate.deleteProject({ id: selected.id });
    setSelectedId(next?.id ?? null);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: 20,
        height: '100%',
        minHeight: 0,
      }}
    >
      <ProjectList projects={projects} selectedId={effectiveId} onSelect={setSelectedId} onAdd={addProject} />
      {selected ? (
        <ProjectDetail 
          key={selected.id} 
          project={selected} 
          allTodos={todos} 
          onUpdate={update} 
          onDelete={deleteSelected} 
          rep={rep}
        />
      ) : (
        <div
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ink-3)',
          }}
        >
          No project selected.
        </div>
      )}
    </div>
  );
}
