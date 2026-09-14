'use client';

/**
 * M13's sanctioned globe: `globe()` from the dither engine at scale 3 —
 * graticule 0.3, twelve meridians, seven parallels, spin 0.18 — ink on
 * paper. A halftone globe reads as a printed atlas plate rather than a SaaS
 * hero orb, and its graticule gives the ordered dither something structural
 * to articulate instead of a smooth gradient. It turns slowly (4.8ms/frame
 * at full budget; this cell is a fraction of that) and freezes to a single
 * legible plate under reduced motion.
 */

import { globe, type FieldFn } from '@/lib/dither';

import { useDitherField, type AspectBox } from '../fields';

/**
 * The globe field, rebuilt whenever the cell's measured aspect changes so the
 * sphere stays a circle — the cell's height settles after fonts and layout,
 * and a baked-in aspect renders an egg.
 */
function atlasGlobe(aspect: AspectBox): FieldFn {
  let field: FieldFn = () => 0;
  let builtFor = 0;
  const rebuild = (a: number) => {
    builtFor = a;
    field = globe({
      cx: 0.5,
      cy: 0.5,
      radius: 0.42,
      aspect: a,
      ambient: 0.16,
      graticule: 0.3,
      meridians: 12,
      parallels: 7,
      landmass: 0.2,
      spin: 0.18,
      rim: 0.18,
    });
  };
  rebuild(aspect.value);

  return (u, v, t) => {
    if (aspect.value !== builtFor) rebuild(aspect.value);
    return field(u, v, t);
  };
}

export default function DitherGlobe({ title }: { title: string }) {
  // The plate is 1-bit and theme-following: the ink is the cell's computed
  // `color` (var(--tc-ink) via .df-globe), so the atlas prints ink-on-paper
  // in light and paper-on-ink in dark — themeInk re-resolves it on flip.
  const ref = useDitherField(atlasGlobe, {
    scale: 3,
    ink: '#070707',
    paper: 'transparent',
    fps: 24,
    reducedMotionTime: 8,
    gamma: 1.25,
    themeInk: true,
  });

  return <canvas className='df-globe' ref={ref} role='img' aria-label={title} />;
}
