import type { Rep } from '../../store/replicache';
import { useSettings } from '../../store/subscriptions';
import { Modal } from '../../ui/Modal';
import { Btn } from '../../ui/Btn';
import { Field } from '../../ui/Field';
import { Input } from '../../ui/Input';
import type { Density, Theme } from '../../data/types';

export function SettingsModal({ rep, onClose }: { rep: Rep | null; onClose: () => void }) {
  const settings = useSettings(rep);

  const update = (patch: Partial<typeof settings>) => {
    if (!rep) return;
    void rep.mutate.updateSettings(patch);
  };

  return (
    <Modal open onClose={onClose} title="Appearance Settings" footer={<Btn onClick={onClose}>Close</Btn>}>
      <Field label="Dashboard Name">
        <Input
          value={settings.dashboardName}
          onChange={(v) => update({ dashboardName: v })}
          placeholder="PhD Dashboard"
        />
      </Field>

      <Field label="Theme">
        <div style={{ display: 'flex', gap: 8 }}>
          {(['light', 'dark', 'system'] as Theme[]).map((t) => (
            <Btn key={t} variant={settings.theme === t ? 'soft' : 'ghost'} onClick={() => update({ theme: t })}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Btn>
          ))}
        </div>
      </Field>

      <Field label={`Accent Hue (${settings.accentHue}°)`}>
        <input
          type="range"
          min="0"
          max="360"
          value={settings.accentHue}
          onChange={(e) => update({ accentHue: Number(e.target.value) })}
          style={{
            width: '100%',
            height: 6,
            appearance: 'none',
            background: 'var(--rule)',
            borderRadius: 3,
            outline: 'none',
            cursor: 'pointer',
          }}
        />
      </Field>

      <Field label="Density">
...        <div style={{ display: 'flex', gap: 8 }}>
          {(['compact', 'comfortable'] as Density[]).map((d) => (
            <Btn key={d} variant={settings.density === d ? 'soft' : 'ghost'} onClick={() => update({ density: d })}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Btn>
          ))}
        </div>
      </Field>

      <Field label="Calendar Options">
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'var(--ink-2)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={settings.showTodayRail}
            onChange={(e) => update({ showTodayRail: e.target.checked })}
          />
          Show 'today' rail
        </label>
      </Field>
    </Modal>
  );
}
