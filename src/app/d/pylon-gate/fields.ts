import type { FieldFn } from '@/lib/dither';

/**
 * The two scalar fields this direction hands to the Bayer engine. Both are
 * plain closures over numbers: no allocation per sample, safe at a few
 * hundred thousand calls a frame. The engine thresholds them against the
 * 8x8 ordered matrix, so every ramp here renders as dither, never as tone.
 */

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * The sun disk of the hero crown: a lambert-shaded sphere whose light
 * circles slowly, so the dither articulates a turning highlight instead of
 * a static gradient. Outside the disk the field is zero (paper).
 */
export function sunDisk(opts: { spin?: number } = {}): FieldFn {
  const spin = opts.spin ?? 0.22;
  return (u, v, t) => {
    const px = (u - 0.5) * 2;
    const py = (v - 0.5) * 2;
    const d2 = px * px + py * py;
    if (d2 >= 1) return 0;
    const nz = Math.sqrt(1 - d2);
    const a = t * spin;
    const lx = Math.cos(a) * 0.66;
    const ly = -0.52;
    const lz = 0.55 + Math.sin(a) * 0.25;
    const len = Math.hypot(lx, ly, lz);
    const lambert = Math.max(0, (px * lx + py * ly + nz * lz) / len);
    let value = 0.14 + 0.86 * lambert;
    value += 0.22 * Math.pow(d2, 3.5);
    return clamp01(value) * smoothstep(1, 0.96, d2);
  };
}

/**
 * The sanctuary floor: a stepped mastaba seen head-on, five tiers narrowing
 * upward, each tier a flat coverage so the ordered dither renders it as one
 * exact tone. A slow sweep of light crosses the tiers left to right.
 */
export function steppedFloor(opts: { steps?: number; sweep?: number } = {}): FieldFn {
  const steps = Math.max(2, Math.floor(opts.steps ?? 5));
  const sweep = opts.sweep ?? 0.3;
  const h = 1 / steps;
  return (u, v, t) => {
    const i = Math.floor((1 - v) / h);
    if (i >= steps) return 0;
    const half = 0.5 - (i * 0.5 * 0.82) / steps;
    const dx = Math.abs(u - 0.5);
    if (dx > half) return 0;
    const base = 0.3 - i * 0.05;
    const light = 0.82 + 0.18 * Math.sin(u * Math.PI * 2 - t * sweep);
    return clamp01(base * light);
  };
}
