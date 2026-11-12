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

import { Action, Choice, Range, Toggle } from './controls';
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

type ColorKey = 'ground' | 'tileLow' | 'tileHigh' | 'letter' | 'rim' | 'dawn' | 'bloom';

const COLORS: readonly { key: ColorKey; label: string }[] = [
  { key: 'ground', label: 'Ground' },
  { key: 'tileLow', label: 'Tile low' },
  { key: 'tileHigh', label: 'Tile high' },
  { key: 'letter', label: 'Letter' },
  { key: 'rim', label: 'Rim' },
  { key: 'dawn', label: 'Dawn' },
  { key: 'bloom', label: 'Bloom' },
];

/** The screen takes one to five inks. */
const MAX_INKS = 5;

type FramingBox = { x: number; y: number; r: number };

/** Where a custom framing starts: the whole framing's disc. */
const CUSTOM_FRAMING: FramingBox = { x: 0.5, y: 0.5, r: 0.4 };

const FRAMING_RANGES: readonly { key: keyof FramingBox; label: string; min: number; max: number }[] = [
  { key: 'x', label: 'Center x', min: -0.5, max: 1.5 },
  { key: 'y', label: 'Center y', min: -0.5, max: 1.5 },
  { key: 'r', label: 'Radius', min: 0.1, max: 2 },
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

/** The JSX for the current globe: the preset, then every prop that differs from it, then the still's time. */
function snippet(preset: GlyphGlobePreset, settings: GlyphGlobeSettings, stillTime: number): string {
  const base = glyphGlobeSettings(preset);
  const lines = preset === 'launch' ? [] : [`preset='${preset}'`];
  for (const key of Object.keys(settings) as (keyof GlyphGlobeSettings)[]) {
    if (same(settings[key], base[key])) continue;
    const value = settings[key];
    lines.push(typeof value === 'string' ? `${key}=${literal(value)}` : `${key}={${literal(value)}}`);
  }
  if (stillTime) lines.push(`stillTime={${literal(stillTime)}}`);
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
  const [stillTime, setStillTime] = useState(0);

  const settings = glyphGlobeSettings(preset, overrides);
  const set = (patch: Partial<GlyphGlobeSettings>) => setOverrides((o) => ({ ...o, ...patch }));
  const setPalette = (patch: Partial<GlyphGlobePalette>) => set({ palette: { ...settings.palette, ...patch } });
  const paletteKey = Object.keys(PALETTES).find((k) => same(PALETTES[k].palette, settings.palette)) ?? 'custom';
  const inks = settings.palette.inks;
  const box = typeof settings.framing === 'string' ? null : settings.framing;
  const loop = settings.revolutionSeconds > 0 ? settings.revolutionSeconds : 10;
  const pickPreset = (next: GlyphGlobePreset) => {
    setPreset(next);
    setOverrides({});
    setStillTime(0);
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
            <Choice<'launch' | 'whole' | 'custom'>
              label='Framing'
              options={[
                { value: 'launch', label: 'Launch' },
                { value: 'whole', label: 'Whole' },
                { value: 'custom', label: 'Custom' },
              ]}
              value={box ? 'custom' : (settings.framing as 'launch' | 'whole')}
              onChange={(v) => set({ framing: v === 'custom' ? (box ?? CUSTOM_FRAMING) : v })}
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
              {group.title === 'Motion' ? (
                <Range
                  format={(v) => `${v.toFixed(2)} s`}
                  label='Still at'
                  max={loop}
                  min={0}
                  step={0.05}
                  value={Math.min(stillTime, loop)}
                  onChange={setStillTime}
                />
              ) : null}
              {group.title === 'View' && box
                ? FRAMING_RANGES.map((f) => (
                    <Range
                      format={(v) => v.toFixed(2)}
                      key={f.key}
                      label={f.label}
                      max={f.max}
                      min={f.min}
                      step={0.01}
                      value={box[f.key]}
                      onChange={(v) => set({ framing: { ...box, [f.key]: v } })}
                    />
                  ))
                : null}
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
            {settings.palette.stars.map((star, i) => (
              <ColorField
                key={`star-${i}`}
                label={`Star ${i + 1}`}
                value={star}
                onChange={(v) =>
                  setPalette({ stars: i === 0 ? [v, settings.palette.stars[1]] : [settings.palette.stars[0], v] })
                }
              />
            ))}
            {inks.map((ink, i) => (
              <ColorField
                key={`ink-${i}`}
                label={`Ink ${i + 1}`}
                value={ink}
                onChange={(v) => setPalette({ inks: inks.map((x, j) => (j === i ? v : x)) })}
              />
            ))}
            <Action
              disabled={inks.length >= MAX_INKS}
              title='Add a lighter ink to the screen'
              onClick={() => setPalette({ inks: [...inks, inks[inks.length - 1] ?? settings.palette.letter] })}
            >
              Add Ink
            </Action>
            <Action
              disabled={inks.length <= 1}
              title='Take the lightest ink off the screen'
              onClick={() => setPalette({ inks: inks.slice(0, -1) })}
            >
              Remove Ink
            </Action>
          </Group>
          <pre className='dmo-gg-code'>{snippet(preset, settings, stillTime)}</pre>
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
      <GlyphGlobe
        autoplay={!still}
        preset={preset}
        stillTime={Math.min(stillTime, loop)}
        style={{ position: 'absolute', inset: 0 }}
        {...overrides}
      />
    </Plate>
  );
}
