import type { Rep } from '../../store/replicache';
import { useSettings } from '../../store/subscriptions';
import { Modal } from '../../ui/Modal';
import { Btn } from '../../ui/Btn';
import { Field } from '../../ui/Field';
import { Input } from '../../ui/Input';
import type { Density, Theme } from '../../data/types';

const PRESET_COLORS = [
  { name: 'Cyan', hex: '#008491' },
  { name: 'Blue', hex: '#007aff' },
  { name: 'Indigo', hex: '#5856d6' },
  { name: 'Purple', hex: '#af52de' },
  { name: 'Pink', hex: '#ff2d55' },
  { name: 'Red', hex: '#ff3b30' },
  { name: 'Orange', hex: '#ff9500' },
  { name: 'Green', hex: '#34c759' },
];

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

      <Field label="Accent Color">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => update({ accentColor: c.hex })}
                title={c.name}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: c.hex,
                  border: settings.accentColor === c.hex ? '2px solid var(--ink)' : '2px solid transparent',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'transform .1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            ))}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                position: 'relative',
                cursor: 'pointer',
                border: !PRESET_COLORS.some((c) => c.hex === settings.accentColor)
                  ? '2px solid var(--ink)'
                  : '2px solid transparent',
              }}
            >
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => update({ accentColor: e.target.value })}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: settings.accentColor,
                border: '1px solid var(--rule)',
              }}
            />
            <code style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase' }}>
              {settings.accentColor}
            </code>
          </div>
        </div>
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
