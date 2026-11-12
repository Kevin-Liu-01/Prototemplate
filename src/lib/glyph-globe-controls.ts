/**
 * The glyph globe configurator's controls (src/components/docs/demos/
 * GlyphGlobeDemo.tsx): a slider for every number the engine takes and a
 * picker for each palette color, each with its own accessible name. A
 * slider's step comes from the default it starts at, so an untouched
 * slider and one moved back both hold that default exactly and the printed
 * JSX leaves it out (pnpm test:glyph-globe holds every preset to that).
 */

import type { GlyphGlobeSettings } from '@/lib/glyph-globe';

export type GlyphGlobeNumberKey = {
  [K in keyof GlyphGlobeSettings]: GlyphGlobeSettings[K] extends number ? K : never;
}[keyof GlyphGlobeSettings];

export type GlyphGlobeRange = {
  key: GlyphGlobeNumberKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  digits?: number;
};

/** every number the engine takes, grouped as the configurator shows them */
export const GLYPH_GLOBE_RANGE_GROUPS: readonly { title: string; ranges: readonly GlyphGlobeRange[] }[] = [
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
      { key: 'rim', label: 'Rim strength', min: 0, max: 2, step: 0.01 },
      { key: 'dawn', label: 'Dawn strength', min: 0, max: 2, step: 0.01 },
      { key: 'bloom', label: 'Bloom strength', min: 0, max: 1.5, step: 0.01 },
      { key: 'sunAngle', label: 'Light angle', min: -180, max: 180, step: 1, unit: '°', digits: 0 },
      { key: 'stars', label: 'Stars', min: 0, max: 1, step: 0.01 },
    ],
  },
];

export type GlyphGlobeColorKey = 'ground' | 'tileLow' | 'tileHigh' | 'letter' | 'rim' | 'dawn' | 'bloom';

/** the palette's single colors; the stars and the inks follow as Star n and Ink n */
export const GLYPH_GLOBE_COLORS: readonly { key: GlyphGlobeColorKey; label: string }[] = [
  { key: 'ground', label: 'Ground' },
  { key: 'tileLow', label: 'Tile low' },
  { key: 'tileHigh', label: 'Tile high' },
  { key: 'letter', label: 'Letter' },
  { key: 'rim', label: 'Rim color' },
  { key: 'dawn', label: 'Dawn color' },
  { key: 'bloom', label: 'Bloom color' },
];

/** Places after the point a slider's step may take: finer defaults are reached by snapping. */
const MAX_PLACES = 4;

const places = (n: number) => (String(n).split('.')[1] ?? '').length;

/** Whether `value` is a whole number of steps from `min`, as a range input counts them. */
function onGrid(min: number, step: number, value: number): boolean {
  const n = (value - min) / step;
  return Math.abs(n - Math.round(n)) < 1e-6;
}

/**
 * The step a slider takes so its default lies on its grid: the given step
 * when the default is a whole number of steps from min, else one unit in
 * the last place of the default or min (39.81 takes 0.01). A default with
 * more than four places (35 / 873.76) keeps the given step and is reached
 * by snapRange.
 */
export function rangeStep(range: Pick<GlyphGlobeRange, 'min' | 'step'>, value: number): number {
  if (onGrid(range.min, range.step, value)) return range.step;
  const n = Math.max(places(range.min), places(value));
  return n <= MAX_PLACES ? Number(`1e-${n}`) : range.step;
}

/** A slider's value, set to the default exactly within half a step of it. */
export function snapRange(value: number, step: number, fallback: number): number {
  return Math.abs(value - fallback) <= step / 2 + 1e-9 ? fallback : value;
}
