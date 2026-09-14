'use client';

import { useStillDither } from '../dither-still';
import type { StillField } from '../dither-still';

/**
 * Deco home: the slab's lower edge (C1.3, the frame's ground).
 *
 * The Rosetta Stone's base is broken. Under the last register the slab
 * color runs out through one vertical dither ramp into the ground, so
 * the stele ends the way the stone does, in a coarse fracture rather
 * than a ruled line.
 */
const ramp: StillField = () => (_u, v) => {
  const p = 1 - v;
  return p * p;
};

export function BaseDissolve() {
  const ref = useStillDither(ramp, { scale: 4, inkToken: '--deco-slab' });
  return <canvas className='tr-dissolve' ref={ref} aria-hidden='true' />;
}
