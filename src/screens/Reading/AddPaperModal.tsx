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

  const handlePaste = () => {
    try {
      const raw = sessionStorage.getItem('TASKTRACK_CLIPBOARD');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.type === 'paper') {
        const p = data.data;
        setTitle(p.title);
        setAuthors(p.authors);
        setVenue(p.venue);
        setProjectId(p.projectId);
      }
    } catch (e) {
      console.error('Paste failed', e);
    }
  };

  const hasClipboard = sessionStorage.getItem('TASKTRACK_CLIPBOARD')?.includes('"type":"paper"');

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
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flex: 1 }}>
          <div>
            {hasClipboard && (
              <Btn onClick={handlePaste}>
                Paste
              </Btn>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn variant="accent" onClick={submit}>
              Add
            </Btn>
          </div>
        </div>
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
