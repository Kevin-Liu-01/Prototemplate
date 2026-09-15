import { useRef } from 'react';

import { createDitherLoop, prefersReducedMotion } from '@/lib/dither';
import type { DitherLoopOptions, FieldFn } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * talud-tablero: the two ordered-dither surfaces and the hook that mounts
 * them. Every field returns darkness (1 is stone, 0 is light), so the same
 * field draws correctly on the cream ground and, inverted, on the dark
 * ground: the canvas reads its ink, its paper and its inversion flag from
 * CSS tokens on the canvas itself (`--tt-dither-ink`, `--tt-dither-paper`,
 * `--tt-dither-invert`), never from a color literal in TypeScript.
 */

/* ------------------------------------------------------------ helpers */

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ------------------------------------------------------ the hero plate */

export type PlatformDawnOptions = {
  /** Canvas width over height, so the disc stays a circle. Default 0.8. */
  aspect?: number;
};

/**
 * The hero plate: a stepped platform in talud-tablero profile in front of
 * a shaded disc. Four tiers rise from a ground line; each tier is a sloped
 * talud (mid darkness, ramped so the slope reads) under a framed tablero
 * (a dark frame band around a light recessed panel); a central stair with
 * treads climbs the axis. The disc is a lambert-shaded sphere whose light
 * turns slowly, so the shading sweeps around it while everything else
 * holds still. Geometry only: a circle and a stepped profile.
 */
export function platformDawn(opts: PlatformDawnOptions = {}): FieldFn {
  const { aspect = 0.8 } = opts;

  /* the disc, in v units */
  const cx = 0.5;
  const cy = 0.34;
  const R = 0.23;

  /* the platform, in u units for half-widths and v units for heights */
  const ground = 0.905;
  const taludH = 0.072;
  const tableroH = 0.046;
  const tierH = taludH + tableroH;
  const tiers = 4;
  const halfWidths = [0.47, 0.385, 0.3, 0.215];
  const stepIn = 0.085;
  const overhang = 0.018;
  const frame = 0.011;
  const stairHalf = 0.055;
  const tread = 0.011;
  const topY = ground - tiers * tierH;
  const templeH = 0.05;
  const templeHalf = 0.11;

  return (u, v, t) => {
    /* ---------------------------------------------------------- ground */
    if (v >= ground) {
      const d = (v - ground) / (1 - ground);
      if (d < 0.07) return 0.95;
      return mix(0.42, 0.06, d);
    }

    /* ------------------------------------------------------ the platform */
    if (v >= topY) {
      const i = Math.min(tiers - 1, Math.floor((ground - v) / tierH));
      const local = ground - v - i * tierH;
      const baseHalf = halfWidths[i] ?? 0.2;
      const topHalf = baseHalf - stepIn;
      const du = Math.abs(u - 0.5);

      if (local < taludH) {
        /* the talud: half-width narrows from base to top */
        const s = local / taludH;
        const half = mix(baseHalf, topHalf, s);
        if (du <= half) {
          if (du <= stairHalf) {
            const f = ((ground - v) / tread) % 1;
            return f < 0.34 ? 0.92 : 0.22;
          }
          /* the alfarda: a solid ramp beside the stair */
          if (du <= stairHalf + 0.014) return 0.96;
          return mix(0.5, 0.68, s);
        }
        return 0;
      }

      /* the tablero: the frame projects past the talud top */
      const half = topHalf + overhang;
      if (du <= half) {
        if (du <= stairHalf) {
          const f = ((ground - v) / tread) % 1;
          return f < 0.34 ? 0.92 : 0.22;
        }
        if (du <= stairHalf + 0.014) return 0.96;
        const edge = local - taludH;
        const inFrame = edge < frame || edge > tableroH - frame || du > half - frame / aspect;
        return inFrame ? 0.96 : 0.14;
      }
      return 0;
    }

    /* ----------------------------------------------------------- temple */
    if (v >= topY - templeH && Math.abs(u - 0.5) <= templeHalf) {
      const edge = topY - v;
      const inFrame = edge < frame || edge > templeH - frame || Math.abs(u - 0.5) > templeHalf - frame / aspect;
      return inFrame ? 0.96 : 0.1;
    }

    /* ------------------------------------------------------------- disc */
    const dx = (u - cx) * aspect;
    const dy = v - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    if (r <= R) {
      const nx = dx / R;
      const ny = dy / R;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const a = t * 0.22;
      const lx = Math.cos(a) * 0.72;
      const ly = Math.sin(a) * 0.72;
      const lz = 0.62;
      const len = Math.sqrt(lx * lx + ly * ly + lz * lz);
      const lambert = Math.max(0, (nx * lx + ny * ly + nz * lz) / len);
      const shade = clamp01(1 - lambert) ** 1.25;
      /* the rim: one drawn circle */
      if (R - r < 0.006) return 0.95;
      return 0.08 + shade * 0.78;
    }
    /* two faint concentric rings: the disc's arcs, reduced to lines */
    if (Math.abs(r - R * 1.16) < 0.0035 || Math.abs(r - R * 1.32) < 0.0035) return 0.42;
    return 0;
  };
}

/* ------------------------------------------------------ the plaza floor */

/**
 * The plaza floor under the dark moment: paving courses that recede down
 * the canvas (a darkness ramp read as light falling off), register joints
 * every course, and the stair axis continuing down the middle with a slow
 * pulse traveling along its treads. Returns lightness here, because the
 * plaza is permanently dark and its ink is the pale stone.
 */
export function plazaFloor(): FieldFn {
  const stairHalf = 0.07;
  const tread = 0.02;
  const course = 0.09;
  return (u, v, t) => {
    const falloff = clamp01(1 - v) ** 1.7;
    const du = Math.abs(u - 0.5);
    if (du <= stairHalf) {
      const f = (v / tread) % 1;
      const pulse = ((v * 4 - t * 0.28) % 1 + 1) % 1;
      const glow = pulse < 0.12 ? 0.35 : 0;
      return f < 0.3 ? 0.62 * falloff + glow : 0.12 * falloff + glow * 0.4;
    }
    if (du <= stairHalf + 0.008) return 0.7 * falloff;
    const joint = (v / course) % 1;
    if (joint < 0.06) return 0.5 * falloff;
    return 0.18 * falloff;
  };
}

/* ---------------------------------------------------------------- hook */

export type DitherFieldOptions = Pick<DitherLoopOptions, 'scale' | 'fps' | 'speed' | 'reducedMotionTime'>;

function readToken(el: Element, name: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/**
 * Mounts one dither loop on the returned canvas ref. Ink, paper and the
 * inversion flag come from CSS tokens on the canvas, re-read whenever the
 * document theme flips; the loop pauses offscreen and on hidden tabs, draws
 * exactly one still under reduced motion, and is destroyed on unmount.
 */
export function useDitherField(field: FieldFn, opts: DitherFieldOptions = {}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const palette = () => ({
      ink: readToken(canvas, '--tt-dither-ink') || 'currentColor',
      paper: readToken(canvas, '--tt-dither-paper') || 'transparent',
      invert: readToken(canvas, '--tt-dither-invert') === '1',
    });

    const loop = createDitherLoop(canvas, field, {
      scale: opts.scale ?? 3,
      fps: opts.fps ?? 24,
      speed: opts.speed ?? 1,
      reducedMotionTime: opts.reducedMotionTime ?? 0,
      ...palette(),
    });

    const observer = new MutationObserver(() => {
      /* tokens resolve after the attribute lands; read them on the next frame */
      requestAnimationFrame(() => {
        loop.setOptions(palette());
        if (prefersReducedMotion()) loop.render(opts.reducedMotionTime ?? 0);
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      observer.disconnect();
      loop.destroy();
    };
  });

  return ref;
}
