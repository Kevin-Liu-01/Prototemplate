/**
 * The glyph globe's named looks: the launch look (the default) and each
 * variation the launch work explored, as settings over the launch look.
 * A preset changes only what its variation changed, so props passed with
 * it still win (src/components/shared/GlyphGlobe.tsx applies the preset,
 * then the props).
 */

import {
  GLYPH_GLOBE_BLUE,
  GLYPH_GLOBE_DEFAULTS,
  GLYPH_GLOBE_FINE_TILE,
  type GlyphGlobePalette,
  type GlyphGlobeSettings,
} from '@/lib/glyph-globe';

export type GlyphGlobePreset =
  | 'launch'
  | 'surface'
  | 'grid'
  | 'plain'
  | 'letters'
  | 'film'
  | 'sway'
  | 'whole'
  | 'vintage'
  | 'mono'
  | 'mono-water'
  | 'mono-glyphs'
  | 'home';

/** Muted blues and a warm paper on ink. */
export const GLYPH_GLOBE_VINTAGE: GlyphGlobePalette = {
  ground: '#070707',
  inks: ['#3d5283', '#8a9bb8', '#ddd7c6'],
  tileLow: '#3d5283',
  tileHigh: '#8a9bb8',
  letter: '#ece6d6',
  rim: '#677aa0',
  dawn: '#e6e0d0',
  bloom: '#a3a7ad',
  stars: ['#ddd7c6', '#ece6d6'],
};

/** One ink, #f2f2f0, on ink. */
export const GLYPH_GLOBE_MONO: GlyphGlobePalette = {
  ground: '#070707',
  inks: ['#f2f2f0'],
  tileLow: '#2a2a29',
  tileHigh: '#4a4a48',
  letter: '#f2f2f0',
  rim: '#9a9a98',
  dawn: '#f2f2f0',
  bloom: '#b4b4b2',
  stars: ['#f2f2f0', '#f2f2f0'],
};

/** The homepage studio field's five blues and white on its own ink. */
export const GLYPH_GLOBE_HOME: GlyphGlobePalette = {
  ground: '#04060a',
  inks: ['#2f5ce0', '#5f86f2', '#9db9ff', '#cfe0ff', '#ffffff'],
  tileLow: '#2f5ce0',
  tileHigh: '#9db9ff',
  letter: '#ffffff',
  rim: GLYPH_GLOBE_BLUE.rim,
  dawn: GLYPH_GLOBE_BLUE.dawn,
  bloom: GLYPH_GLOBE_BLUE.bloom,
  stars: ['#cfe0ff', '#ffffff'],
};

export type GlyphGlobePresetEntry = {
  /** the name a picker shows */
  label: string;
  /** what the variation is, in one sentence */
  note: string;
  settings: Partial<GlyphGlobeSettings>;
};

export const GLYPH_GLOBE_PRESETS: Record<GlyphGlobePreset, GlyphGlobePresetEntry> = {
  launch: {
    label: 'Launch',
    note: 'The globe from the launch graphics and films: frame-fixed tiles whose letters change on every beat, a full turn in 10 seconds.',
    settings: {},
  },
  surface: {
    label: 'Surface',
    note: 'Tiles fixed to the sphere in rows of latitude, turning with the land and rolling over as a front of change crosses the view.',
    settings: { glyphs: 'surface', tile: GLYPH_GLOBE_FINE_TILE },
  },
  grid: {
    label: 'Grid',
    note: 'Larger frame-fixed tiles whose letters change every four beats through a dissolve that sweeps east to west.',
    settings: { glyphs: 'grid', tile: GLYPH_GLOBE_FINE_TILE, letterMin: 18 / 32, letterMax: 30 / 32 },
  },
  plain: {
    label: 'Plain',
    note: 'The earth, the screen and the sky with no letters.',
    settings: { glyphs: 'none' },
  },
  letters: {
    label: 'Letters',
    note: 'The launch tiles without their squares: each letter stands alone with a dark keyline.',
    settings: { boxes: false },
  },
  film: {
    label: 'Film',
    note: 'The earlier launch film look: a darkened limb, a third of the smooth ramp under the screen, and a 32/60 second beat.',
    settings: { limbDarken: 1, soften: 0.35, beatSeconds: 32 / 60 },
  },
  sway: {
    label: 'Sway',
    note: 'The first motion: the earth turns 8 degrees west and back over 16 seconds instead of spinning.',
    settings: { motion: 'sway', revolutionSeconds: 16 },
  },
  whole: {
    label: 'Whole',
    note: 'The launch look with the whole globe centered in its box.',
    settings: { framing: 'whole' },
  },
  vintage: {
    label: 'Vintage',
    note: 'Muted blues and a warm paper on ink.',
    settings: { palette: GLYPH_GLOBE_VINTAGE },
  },
  mono: {
    label: 'Mono',
    note: 'One ink, #f2f2f0, on ink, with grey tiles.',
    settings: { palette: GLYPH_GLOBE_MONO },
  },
  'mono-water': {
    label: 'Mono water',
    note: 'The mono screen with the faintest cells, mostly sea, in #86a8ff.',
    settings: { palette: { ...GLYPH_GLOBE_MONO, inks: ['#86a8ff', '#f2f2f0', '#f2f2f0'] } },
  },
  'mono-glyphs': {
    label: 'Mono glyphs',
    note: 'The mono screen with the letters and the lone points in #86a8ff.',
    settings: { palette: { ...GLYPH_GLOBE_MONO, tileLow: '#1c1c1c', tileHigh: '#2c2c2b', letter: '#86a8ff' } },
  },
  home: {
    label: 'Home',
    note: 'The homepage studio field ramp: five blues and white on #04060a.',
    settings: { palette: GLYPH_GLOBE_HOME },
  },
};

export const GLYPH_GLOBE_PRESET_IDS = Object.keys(GLYPH_GLOBE_PRESETS) as GlyphGlobePreset[];

/** The full settings of a preset with props over it. */
export function glyphGlobeSettings(
  preset: GlyphGlobePreset = 'launch',
  overrides: Partial<GlyphGlobeSettings> = {}
): GlyphGlobeSettings {
  return { ...GLYPH_GLOBE_DEFAULTS, ...GLYPH_GLOBE_PRESETS[preset].settings, ...overrides };
}
