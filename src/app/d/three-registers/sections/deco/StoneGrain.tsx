'use client';

import { hash2, useStillDither, valueNoise } from '../dither-still';
import type { StillField } from '../dither-still';

/**
 * Deco home: the frame ground (C1.3), the slab itself.
 *
 * Granodiorite is a speckled stone: fine mineral grains over slow clouds of
 * tone. Each register carries one static Bayer frame of that field behind
 * its bands, lit cells in the pale stone color at a low alpha, unlit cells
 * transparent so the slab color shows through. One cloud sample and one
 * per-cell hash keep a register's redraw to a few milliseconds; it is drawn
 * once and redrawn only on resize or a theme flip. Nothing about it moves.
 */
const CELL = 3;

const grain: StillField = (w, h) => {
  const cloud = 1 / 72;
  return (u, v) => {
    const x = u * w;
    const y = v * h;
    const tone = valueNoise(x * cloud + 41, y * cloud + 17);
    const speck = hash2(Math.floor(x / CELL), Math.floor(y / CELL));
    const fleck = speck > 0.93 ? (speck - 0.93) * 8 : 0;
    const value = 0.02 + 0.09 * tone + fleck;
    return value > 1 ? 1 : value;
  };
};

export function StoneGrain() {
  const ref = useStillDither(grain, { scale: CELL, inkToken: '--deco-grain' });
  return <canvas className='tr-grain' ref={ref} aria-hidden='true' />;
}
