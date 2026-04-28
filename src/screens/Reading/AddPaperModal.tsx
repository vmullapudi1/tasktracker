import { useState } from 'react';
import type { Project } from '../../data/types';
import { uid, fmtDateKey } from '../../data/helpers';
import type { Rep } from '../../store/replicache';
import { Modal } from '../../ui/Modal';
import { Btn } from '../../ui/Btn';
import { Field } from '../../ui/Field';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';

export function AddPaperModal({
  rep,
  projects,
  onClose,
}: {
  rep: Rep | null;
  projects: Project[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [venue, setVenue] = useState('');
  const [projectId, setProjectId] = useState(projects.filter((p) => p.active)[0]?.id || '');

  const submit = () => {
    if (!rep || !title.trim()) return;
    void rep.mutate.addPaper({
      id: uid(),
      title: title.trim(),
      authors: authors.trim() || 'Unknown',
      venue: venue.trim() || '',
      projectId,
      addedAt: fmtDateKey(new Date()),
      read: false,
      summary: '',
      takeaway: '',
    });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add paper"
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="accent" onClick={submit}>
            Add
          </Btn>
        </>
      }
    >
      <Field label="Title">
        <Input
          value={title}
          onChange={setTitle}
          placeholder="e.g. Dynamics of cortical reorganization…"
          autoFocus
        />
      </Field>
      <Field label="Authors">
        <Input value={authors} onChange={setAuthors} placeholder="e.g. Voss et al., 2025" />
      </Field>
      <Field label="Venue">
        <Input value={venue} onChange={setVenue} placeholder="e.g. Nature Neuroscience" />
      </Field>
      <Field label="Project">
        <Select value={projectId} onChange={setProjectId}>
          <option value="">— none —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} — {p.name}
            </option>
          ))}
        </Select>
      </Field>
    </Modal>
  );
}
