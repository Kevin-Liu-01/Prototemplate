'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';

import GlyphGlobe from '@/components/shared/GlyphGlobe';
import {
  GLYPH_GLOBE_BLUE,
  type GlyphGlobeMode,
  type GlyphGlobePalette,
  type GlyphGlobeSettings,
} from '@/lib/glyph-globe';
import {
  GLYPH_GLOBE_HOME,
  GLYPH_GLOBE_MONO,
  GLYPH_GLOBE_PRESET_IDS,
  GLYPH_GLOBE_PRESETS,
  GLYPH_GLOBE_VINTAGE,
  glyphGlobeSettings,
  type GlyphGlobePreset,
} from '@/lib/glyph-globe-presets';

import { Choice, Range, Toggle } from './controls';
import { useReducedMotion } from './hooks';
import Plate from './Plate';

type NumberKey = {
  [K in keyof GlyphGlobeSettings]: GlyphGlobeSettings[K] extends number ? K : never;
}[keyof GlyphGlobeSettings];

type RangeSpec = { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string; digits?: number };

/* every number the engine takes, grouped as the configurator shows them */
const GROUPS: readonly { title: string; ranges: readonly RangeSpec[] }[] = [
  {
    title: 'Motion',
    ranges: [
      { key: 'revolutionSeconds', label: 'Turn', min: 0, max: 60, step: 1, unit: ' s', digits: 0 },
      { key: 'beatSeconds', label: 'Beat', min: 0.1, max: 2, step: 0.05, unit: ' s' },
      { key: 'swayDegrees', label: 'Sway', min: 0, max: 45, step: 1, unit: '°', digits: 0 },
    ],
  },
  {
    title: 'View',
    ranges: [
      { key: 'latitude', label: 'Latitude', min: -90, max: 90, step: 0.5, unit: '°', digits: 1 },
      { key: 'longitude', label: 'Longitude', min: -180, max: 180, step: 0.5, unit: '°', digits: 1 },
      { key: 'roll', label: 'Roll', min: -45, max: 45, step: 0.5, unit: '°', digits: 1 },
    ],
  },
  {
    title: 'Earth',
    ranges: [
      { key: 'cell', label: 'Cell', min: 0, max: 12, step: 1, unit: ' px', digits: 0 },
      { key: 'ocean', label: 'Ocean tone', min: -0.5, max: 0.6, step: 0.01 },
      { key: 'land', label: 'Land tone', min: 0.3, max: 1.5, step: 0.01 },
      { key: 'limbDarken', label: 'Limb', min: 0, max: 1, step: 0.01 },
      { key: 'soften', label: 'Soften', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    title: 'Glyphs',
    ranges: [
      { key: 'tile', label: 'Tile', min: 0.02, max: 0.12, step: 0.001, digits: 3 },
      { key: 'density', label: 'Density', min: 0, max: 1, step: 0.01 },
      { key: 'tileReach', label: 'Reach', min: 0.2, max: 1, step: 0.01 },
      { key: 'threshold', label: 'Threshold', min: 0.05, max: 0.95, step: 0.01 },
      { key: 'split', label: 'Split', min: 0.05, max: 0.95, step: 0.01 },
      { key: 'jitter', label: 'Jitter', min: 0, max: 0.4, step: 0.01 },
      { key: 'letterMin', label: 'Letter at threshold', min: 0.2, max: 1, step: 0.01 },
      { key: 'letterMax', label: 'Letter at full', min: 0.2, max: 1, step: 0.01 },
      { key: 'lonePoints', label: 'Lone letters', min: 0, max: 0.3, step: 0.005, digits: 3 },
    ],
  },
  {
    title: 'Light',
    ranges: [
      { key: 'rim', label: 'Rim', min: 0, max: 2, step: 0.01 },
      { key: 'dawn', label: 'Dawn', min: 0, max: 2, step: 0.01 },
      { key: 'bloom', label: 'Bloom', min: 0, max: 1.5, step: 0.01 },
      { key: 'sunAngle', label: 'Light angle', min: -180, max: 180, step: 1, unit: '°', digits: 0 },
      { key: 'stars', label: 'Stars', min: 0, max: 1, step: 0.01 },
    ],
  },
];

const PALETTES: Record<string, { label: string; palette: GlyphGlobePalette }> = {
  blue: { label: 'Blue', palette: GLYPH_GLOBE_BLUE },
  vintage: { label: 'Vintage', palette: GLYPH_GLOBE_VINTAGE },
  mono: { label: 'Mono', palette: GLYPH_GLOBE_MONO },
  home: { label: 'Home', palette: GLYPH_GLOBE_HOME },
};

type ColorKey = 'ground' | 'tileLow' | 'tileHigh' | 'letter';

const COLORS: readonly { key: ColorKey; label: string }[] = [
  { key: 'ground', label: 'Ground' },
  { key: 'tileLow', label: 'Tile low' },
  { key: 'tileHigh', label: 'Tile high' },
  { key: 'letter', label: 'Letter' },
];

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function literal(value: unknown): string {
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'number') return String(Math.round(value * 10000) / 10000);
  if (typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `[${value.map(literal).join(', ')}]`;
  if (value && typeof value === 'object') {
    return `{ ${Object.entries(value)
      .map(([k, v]) => `${k}: ${literal(v)}`)
      .join(', ')} }`;
  }
  return String(value);
}

/** The JSX for the current globe: the preset, then every prop that differs from it. */
function snippet(preset: GlyphGlobePreset, settings: GlyphGlobeSettings): string {
  const base = glyphGlobeSettings(preset);
  const lines = preset === 'launch' ? [] : [`preset='${preset}'`];
  for (const key of Object.keys(settings) as (keyof GlyphGlobeSettings)[]) {
    if (same(settings[key], base[key])) continue;
    const value = settings[key];
    lines.push(typeof value === 'string' ? `${key}=${literal(value)}` : `${key}={${literal(value)}}`);
  }
  const head = "import GlyphGlobe from '@/components/shared/GlyphGlobe';\n\n";
  if (!lines.length) return `${head}<GlyphGlobe />`;
  return `${head}<GlyphGlobe\n${lines.map((l) => `  ${l}`).join('\n')}\n/>`;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className='dmo-gg-group' role='group' aria-label={title}>
      <span className='dmo-gg-title'>{title}</span>
      <div className='dmo-gg-row'>{children}</div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className='dmo-field'>
      <label className='dmo-field-label' htmlFor={id}>
        {label}
      </label>
      <input className='dmo-gg-color' id={id} type='color' value={value} onChange={(e) => onChange(e.currentTarget.value)} />
    </div>
  );
}

/**
 * The glyph globe's configurator: a preset picker, a control for every
 * setting the engine takes, and the JSX for the globe on the stage. The
 * globe keeps its clock across every change.
 */
export default function GlyphGlobeDemo() {
  const reduced = useReducedMotion();
  const presetId = useId();
  const paletteId = useId();
  const glyphId = useId();
  const [preset, setPreset] = useState<GlyphGlobePreset>('launch');
  const [overrides, setOverrides] = useState<Partial<GlyphGlobeSettings>>({});
  const [still, setStill] = useState(false);

  const settings = glyphGlobeSettings(preset, overrides);
  const set = (patch: Partial<GlyphGlobeSettings>) => setOverrides((o) => ({ ...o, ...patch }));
  const setPalette = (patch: Partial<GlyphGlobePalette>) => set({ palette: { ...settings.palette, ...patch } });
  const paletteKey = Object.keys(PALETTES).find((k) => same(PALETTES[k].palette, settings.palette)) ?? 'custom';
  const pickPreset = (next: GlyphGlobePreset) => {
    setPreset(next);
    setOverrides({});
  };

  return (
    <Plate
      controls={
        <div className='dmo-gg-controls'>
          <Group title='Look'>
            <div className='dmo-field'>
              <label className='dmo-field-label' htmlFor={presetId}>
                Preset
              </label>
              <select
                className='dmo-art-select'
                id={presetId}
                value={preset}
                onChange={(e) => pickPreset(e.currentTarget.value as GlyphGlobePreset)}
              >
                {GLYPH_GLOBE_PRESET_IDS.map((id) => (
                  <option key={id} value={id}>
                    {GLYPH_GLOBE_PRESETS[id].label}
                  </option>
                ))}
              </select>
            </div>
            <Choice<GlyphGlobeMode>
              label='Glyphs'
              options={[
                { value: 'tiles', label: 'Tiles' },
                { value: 'surface', label: 'Surface' },
                { value: 'grid', label: 'Grid' },
                { value: 'none', label: 'None' },
              ]}
              value={settings.glyphs}
              onChange={(glyphs) => set({ glyphs })}
            />
            <Choice<'launch' | 'whole'>
              label='Framing'
              options={[
                { value: 'launch', label: 'Launch' },
                { value: 'whole', label: 'Whole' },
              ]}
              value={typeof settings.framing === 'string' ? settings.framing : 'launch'}
              onChange={(framing) => set({ framing })}
            />
            <Choice<'8' | '4' | '2'>
              label='Screen'
              options={[
                { value: '8', label: '8×8' },
                { value: '4', label: '4×4' },
                { value: '2', label: '2×2' },
              ]}
              value={String(settings.screen) as '8' | '4' | '2'}
              onChange={(v) => set({ screen: Number(v) as 8 | 4 | 2 })}
            />
            <Choice<'spin' | 'sway'>
              label='Motion'
              options={[
                { value: 'spin', label: 'Spin' },
                { value: 'sway', label: 'Sway' },
              ]}
              value={settings.motion}
              onChange={(motion) => set({ motion })}
            />
            <Choice<'1' | '-1'>
              label='Direction'
              options={[
                { value: '1', label: 'West to east' },
                { value: '-1', label: 'East to west' },
              ]}
              value={String(settings.direction) as '1' | '-1'}
              onChange={(v) => set({ direction: v === '1' ? 1 : -1 })}
            />
            <Toggle label='Boxes' pressed={settings.boxes} onChange={(boxes) => set({ boxes })} />
            <Toggle label='Breathe' pressed={settings.breathe} onChange={(breathe) => set({ breathe })} />
            <Toggle label='Twinkle' pressed={settings.twinkle} onChange={(twinkle) => set({ twinkle })} />
            <Toggle
              disabled={reduced}
              label='Still'
              pressed={still || reduced}
              title='Show the frame a reader with reduced motion sees'
              onChange={setStill}
            />
          </Group>
          {GROUPS.map((group) => (
            <Group key={group.title} title={group.title}>
              {group.ranges.map((r) => (
                <Range
                  format={(v) => (r.key === 'cell' && v === 0 ? 'auto' : `${v.toFixed(r.digits ?? 2)}${r.unit ?? ''}`)}
                  key={r.key}
                  label={r.label}
                  max={r.max}
                  min={r.min}
                  step={r.step}
                  value={settings[r.key]}
                  onChange={(v) => set({ [r.key]: v })}
                />
              ))}
              {group.title === 'Glyphs' ? (
                <div className='dmo-field dmo-field-wide'>
                  <label className='dmo-field-label' htmlFor={glyphId}>
                    Glyph set
                  </label>
                  <input
                    className='dmo-art-select'
                    id={glyphId}
                    placeholder='The launch atlas'
                    type='text'
                    value={settings.glyphSet}
                    onChange={(e) => set({ glyphSet: e.currentTarget.value })}
                  />
                </div>
              ) : null}
            </Group>
          ))}
          <Group title='Colors'>
            <div className='dmo-field'>
              <label className='dmo-field-label' htmlFor={paletteId}>
                Palette
              </label>
              <select
                className='dmo-art-select'
                id={paletteId}
                value={paletteKey}
                onChange={(e) => {
                  const next = PALETTES[e.currentTarget.value];
                  if (next) set({ palette: next.palette });
                }}
              >
                {Object.entries(PALETTES).map(([k, p]) => (
                  <option key={k} value={k}>
                    {p.label}
                  </option>
                ))}
                {paletteKey === 'custom' ? <option value='custom'>Custom</option> : null}
              </select>
            </div>
            {COLORS.map((c) => (
              <ColorField key={c.key} label={c.label} value={settings.palette[c.key]} onChange={(v) => setPalette({ [c.key]: v })} />
            ))}
            {settings.palette.inks.map((ink, i) => (
              <ColorField
                key={`ink-${i}`}
                label={`Ink ${i + 1}`}
                value={ink}
                onChange={(v) => setPalette({ inks: settings.palette.inks.map((x, j) => (j === i ? v : x)) })}
              />
            ))}
          </Group>
          <pre className='dmo-gg-code'>{snippet(preset, settings)}</pre>
        </div>
      }
      height={520}
      label={`The glyph globe in the ${GLYPH_GLOBE_PRESETS[preset].label} look`}
      lazy
      moves
      night
      phoneHeight={320}
      tag='<GlyphGlobe />'
    >
      <GlyphGlobe autoplay={!still} preset={preset} style={{ position: 'absolute', inset: 0 }} {...overrides} />
    </Plate>
  );
}
