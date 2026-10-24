/* Each story's cover: the fluid ground (gpu/fluid.ts) in a palette of its
   own and from its own point in the jets' orbits, with its design over it
   (gpu/emblems.ts) in the art and accent inks set here. Every title sets in
   the serif. */

import type { CoverSpec } from './fluid';

const EUCLID = {
  brightness: 1.36,
  grain: 8,
  amplitude: 4.2,
  density: 1.12,
  detail: 3.8,
  frequency: 4.6,
  strength: 0.92,
  speed: 0.48,
  // a sixth of the material's own rate: a cover drifts, it does not churn
  pace: 0.16,
  // quieter than the blog cover and closer in, so a few large currents carry each cover
  calm: 0.3,
  zoom: 0.56,
} as const;

/** Designing Docs for Humans' cover, and the cover of a story with none of its own. */
const BLUEPRINT: CoverSpec = {
  ...EUCLID,
  brightness: 1.18,
  colors: ['#0b1636', '#2a4bf0', '#bfe2f1'],
  paper: '#f4f6fb',
  art: '#bfe2f1',
  seed: 12,
};

export const COVERS: Record<string, CoverSpec> = {
  // vellum: the paper barely moving, the 1607 page printed in full ink
  'translating-euclid': {
    ...EUCLID,
    calm: 0.22,
    colors: ['#ece3cc', '#e2d6b9', '#f7f1e2'],
    paper: '#1d1a14',
    art: '#1d1a14',
    accent: '#b8321c',
    seed: 21,
  },
  // a blueprint: the exploded page drawn in sky over its dithered panels
  'designing-docs-for-humans': BLUEPRINT,
  // a proof sheet: graphite, the lines in white, the edits in red
  'rewriting-our-docs': {
    ...EUCLID,
    calm: 0.24,
    colors: ['#121212', '#2c2c2c', '#4d4d4d'],
    paper: '#f4f4f5',
    art: '#e9e9ea',
    accent: '#ff5a36',
    seed: 31,
  },
  // Fuma's orange, Luna drawn in black, the light inks glowing around her
  'fuma-nama': {
    ...EUCLID,
    brightness: 1.1,
    calm: 0.34,
    colors: ['#ff6a0f', '#ff8f3f', '#ffc08c'],
    paper: '#170a02',
    art: '#170a02',
    seed: 47,
  },
};

export const FALLBACK_COVER: CoverSpec = BLUEPRINT;
