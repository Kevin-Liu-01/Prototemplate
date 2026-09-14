import type { FieldFn } from '@/lib/dither';

/**
 * papyrus-registers · the two scalar fields the Bayer engine renders.
 *
 * Both are pure geometry. The umbel fan is the Hoover Building's entrance
 * device: a papyrus flower reduced to a bundle of radiating bars closed by
 * an arc, repeated on a fixed pitch. The stepped pyramid is the Saqqara
 * profile: setbacks rising to a narrow top. Neither draws a plant, a
 * figure, or a creature; both produce 0..1 coverage for ordered dither.
 */

const PI = Math.PI;

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export type UmbelFansOptions = {
  /** Fans across the band. Default 9, one per two canon squares. */
  fans?: number;
  /** Canvas width over height, so the fans stay circular. Default 6. */
  aspect?: number;
  /** Bars per half turn. Default 14. */
  rays?: number;
  /** Fan radius as a fraction of the band height. Default 0.92. */
  radius?: number;
  /** Radians of sway at the rays' phase. Default 0.5. */
  sway?: number;
};

/**
 * A register of papyrus umbels: each fan is a half disc of thin radiating
 * bars standing on a small filled calyx, closed by an arc. Adjacent fans
 * overlap by design, as the Hoover's bars interleave. Coverage rises toward
 * the rim so the dither thins the bars near the stem and fills the arc.
 */
export function umbelFans(opts: UmbelFansOptions = {}): FieldFn {
  const { fans = 9, aspect = 6, rays = 14, radius = 0.92, sway = 0.5 } = opts;
  const pitch = aspect / fans;

  const fan = (x: number, dy: number, index: number, t: number): number => {
    const cx = pitch * (index + 0.5);
    const dx = x - cx;
    const r = Math.hypot(dx, dy);
    if (r > radius) return 0;
    const angle = Math.atan2(dy, dx);
    if (angle < 0) return 0;
    const phase = sway * Math.sin(t * 0.35 + index * 0.9);
    const q = 1 - Math.abs(Math.sin(angle * rays + phase));
    const bar = q * q * q * q * q * q;
    const rn = r / radius;
    const rise = 0.22 + 0.78 * smoothstep(0.08, 1, rn);
    const arc = 0.85 * (1 - smoothstep(0, 0.045, Math.abs(rn - 0.955)));
    const calyx = 0.92 * (1 - smoothstep(0.09, 0.13, rn));
    return Math.max(bar * rise, arc, calyx);
  };

  return (u, v, t) => {
    const x = u * aspect;
    const dy = 1 - v;
    const nearest = Math.floor(x / pitch);
    let out = 0;
    for (let i = nearest - 1; i <= nearest + 1; i++) {
      if (i < 0 || i >= fans) continue;
      const value = fan(x, dy, i, t);
      if (value > out) out = value;
    }
    return clamp01(out);
  };
}

export type SteppedPyramidOptions = {
  /** Setbacks from the base to the top. Default 9. */
  steps?: number;
  /** Half width of the top step as a fraction of the base. Default 0.06. */
  crown?: number;
  /** Coverage of the base step. Default 0.14. */
  floor?: number;
  /** Coverage of the top step. Default 0.72. */
  peak?: number;
};

/**
 * A stepped pyramid seen from the front: horizontal bands narrowing as they
 * rise, each brighter than the one below, because the light falls from
 * above. A slow breath moves through the steps one after another; under
 * reduced motion the still is the resting profile.
 */
export function steppedPyramid(opts: SteppedPyramidOptions = {}): FieldFn {
  const { steps = 9, crown = 0.06, floor = 0.14, peak = 0.72 } = opts;
  const count = Math.max(2, Math.floor(steps));

  return (u, v, t) => {
    const level = Math.min(count - 1, Math.floor((1 - v) * count));
    const k = level / (count - 1);
    const half = 0.5 - (0.5 - crown) * k;
    if (Math.abs(u - 0.5) > half) return 0;
    const tone = floor + (peak - floor) * k;
    const breath = 1 + 0.08 * Math.sin(t * 0.6 - level * 0.7);
    return clamp01(tone * breath);
  };
}
