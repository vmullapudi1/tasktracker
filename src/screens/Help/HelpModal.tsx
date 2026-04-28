import { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Btn } from '../../ui/Btn';

const HELP_STEPS = [
  {
    title: 'Welcome to TaskTrack!',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>TaskTrack is a PhD-focused productivity dashboard designed to help you balance research, reading, and deep work.</p>
        <p>Let's take a quick tour of the main features.</p>
      </div>
    ),
  },
  {
    title: '📊 Dashboard',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>The <b>Dashboard</b> is your command center. It gives you a high-level view of your current progress, upcoming deadlines, and recent activity.</p>
        <p>Use the <b>To-do list</b> here to quickly capture and manage your immediate tasks.</p>
      </div>
    ),
  },
  {
    title: '📅 Calendar & Scheduling',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>The <b>Calendar</b> is where you block out time for deep work. You can create time blocks by dragging directly on the grid.</p>
        <p>You can also <b>drag-and-drop tasks</b> from the sidebar onto the calendar to schedule them, or create <b>recurring blocks</b> for routine commitments like seminars or classes.</p>
      </div>
    ),
  },
  {
    title: '🚀 Projects',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>The <b>Projects</b> tab allows you to break down your PhD research into manageable phases and milestones.</p>
        <p>Track your logged hours against your target to stay on top of your research output.</p>
      </div>
    ),
  },
  {
    title: '📚 Reading List',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>Manage your bibliography in the <b>Reading</b> tab. Log key takeaways and summaries for every paper you read to build a searchable knowledge base.</p>
      </div>
    ),
  },
  {
    title: '⚙️ Settings & Sync',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>Customize the look and feel in <b>Settings</b>. Change themes, density, and accent colors to match your aesthetic preference.</p>
        <p>TaskTrack is <b>local-first</b>. Use the <b>Sync</b> block in the sidebar to connect a folder on your computer for persistent storage across devices.</p>
      </div>
    ),
  },
];

export function HelpModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const isLast = step === HELP_STEPS.length - 1;

  return (
    <Modal
      open
      onClose={onClose}
      title={HELP_STEPS[step].title}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {HELP_STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: step === i ? 'var(--accent)' : 'var(--rule-strong)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && <Btn onClick={() => setStep(step - 1)}>Back</Btn>}
            {isLast ? (
              <Btn variant="solid" onClick={onClose}>
                Done
              </Btn>
            ) : (
              <Btn variant="solid" onClick={() => setStep(step + 1)}>
                Next
              </Btn>
            )}
          </div>
        </div>
      }
    >
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--ink-2)',
          minHeight: 120,
        }}
      >
        {HELP_STEPS[step].content}
      </div>
    </Modal>
  );
}
