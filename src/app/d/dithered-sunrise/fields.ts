'use client';

/**
 * DITHERED-SUNRISE, the direction's field compositions.
 *
 * Three 1-bit Bayer fields, all rendered by `src/lib/dither.ts` and all
 * printing the same subject: light leaving a low sun as deco rays. Light is
 * quantized twice on the way to the screen. The field steps every radial
 * falloff into flat bands before the threshold ever sees it, and the ordered
 * dither then turns each band into a lattice of gold cells. Nothing in this
 * module produces a smooth ramp.
 *
 *   heroSunrise     the hero plate: a half sun on a horizon, a fan of rays,
 *                   dawn arcs drifting outward, and its reflection below
 *   dawnArcs        the dark band's CLI cell: concentric quantized arcs
 *                   around the terminal's dark core
 *   sunburstFloor   the dark band's floor: the page's fullest ray statement,
 *                   rising from the band's bottom edge
 *
 * Every field is a pure function of (u, v, t). The reduced-motion still is a
 * composed frame, and pause and resume can never drift.
 */

import { useRef } from 'react';

import {
  createDitherLoop,
  type DitherLoopHandle,
  type DitherLoopOptions,
  type FieldFn,
} from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Quantize a 0..1 value into `n` flat steps. This is the deco half of the
 * thesis: a falloff that would render as a smooth halftone ramp becomes a
 * staircase of bands, and the Bayer screen then renders each band at one
 * fixed coverage.
 */
function step(x: number, n: number): number {
  return Math.floor(clamp01(x) * n) / n;
}

/**
 * The deco ray profile: `rays` wedges around the full circle, each a sharp
 * lobe (a cosine cubed) so the lit wedges read as cut brass rather than as
 * a soft star. `phase` sways the whole fan a fraction of one wedge.
 */
function rayLobe(theta: number, rays: number, phase: number): number {
  const w = 0.5 + 0.5 * Math.cos(theta * rays + phase);
  return w * w * w;
}

/**
 * Mutable aspect box. `ditherToCanvas` re-measures the canvas every frame, so
 * the buffer tracks resizes on its own, but a field closure bakes its aspect
 * in. Fields here read aspect through this box and the hook updates it from a
 * ResizeObserver, so rays stay straight at any viewport without tearing the
 * loop down. `height` is the canvas's CSS height in px.
 */
export type AspectBox = { value: number; height?: number };

/* ------------------------------------------------------------------------ *
 * THE HERO SUNRISE (C1.4: the plate is the hero crown's home)
 *
 * A half sun sits on a horizon at 72% of the plate's height. Above it, a fan
 * of 28 rays leaves a thin dark ring around the disc and thins outward in
 * five flat bands; dawn arcs drift out through the fan; a low ambient print
 * keeps the far corners inked so the field fills its component. Below the
 * horizon the sea carries the reflection as horizontal dashes, densest under
 * the sun and thinning downward in four bands.
 * ------------------------------------------------------------------------ */

export function heroSunrise(aspect: AspectBox): FieldFn {
  const CX = 0.5;
  /** The horizon, and the sun's centre: the disc rises half out of the sea. */
  const HORIZON = 0.72;
  const R = 0.2;
  const GAP = 0.03;
  const RAYS = 28;
  const SEA_ROW = 0.024;

  return (u, v, t) => {
    const a = aspect.value;
    const dx = (u - CX) * a;
    const dy = v - HORIZON;

    // --- the sea: the reflection as quantized horizontal dashes ------------
    if (v > HORIZON) {
      const depth = (v - HORIZON) / (1 - HORIZON);
      const row = Math.floor((v - HORIZON) / SEA_ROW);
      if (row % 2 === 1) return 0;
      const band = 1 - step(depth, 4);
      const under = 1 - smoothstep(R * 0.6, 0.9, Math.abs(dx));
      return band * (0.12 + 0.46 * under);
    }

    const r = Math.sqrt(dx * dx + dy * dy);

    // --- the disc, and the dark ring that separates it from the fan -------
    if (r < R) return 1.5;
    if (r < R + GAP) return 0;

    // --- the fan: sharp rays thinning outward in flat bands ---------------
    const theta = Math.atan2(dy, dx);
    const ray = rayLobe(theta, RAYS, 0.3 * Math.sin(t * 0.22));
    const fall = step(Math.min(1, Math.pow((R + GAP) / r, 1.6)), 5);
    let value = ray * fall * 0.96;

    // --- the dawn arcs: rings leaving the disc, drifting outward ----------
    const c = 0.5 + 0.5 * Math.cos((r - R) * 44 - t * 0.55);
    const c2 = c * c;
    const c4 = c2 * c2;
    const c8 = c4 * c4;
    const arc = c8 * c4 * 0.5 * (1 - smoothstep(0.34, 0.95, r));
    value = 1 - (1 - value) * (1 - arc);

    // --- the ambient print: the plate stays inked to its corners ----------
    const amb = 0.035 + 0.045 * smoothstep(0.55, 1.15, r);
    return 1 - (1 - value) * (1 - amb);
  };
}

/* ------------------------------------------------------------------------ *
 * THE DAWN ARCS (C1.5: the dark band's CLI cell)
 *
 * The terminal floats in a dark core nothing prints into. Around it,
 * concentric arcs leave the core and thin outward in four flat tiers, the
 * outermost dissolving into loose cells at the cell's edge. Paper-on-ink on
 * a permanently dark plate.
 * ------------------------------------------------------------------------ */

export function dawnArcs(aspect: AspectBox): FieldFn {
  const CORE = 0.36;

  return (u, v, t) => {
    const a = aspect.value;
    const dx = (u - 0.5) * a;
    const dy = v - 0.5;
    const r = Math.sqrt(dx * dx + dy * dy);
    if (r <= CORE) return 0;

    const c = 0.5 + 0.5 * Math.cos((r - CORE) * 58 - t * 0.35);
    const c2 = c * c;
    const c4 = c2 * c2;
    const c8 = c4 * c4;
    const ring = c8 * c4;
    const tier = 1 - step(smoothstep(CORE, 1.08, r), 4);
    const rim = smoothstep(CORE, CORE + 0.05, r);
    return ring * tier * 0.92 * rim;
  };
}

/* ------------------------------------------------------------------------ *
 * THE SUNBURST FLOOR (C1.5: the dark band's ground)
 *
 * The band's bottom edge is the horizon. A sun cap breaks it at the centre
 * and 44 rays fan up and out to the band's far corners, thinning in six flat
 * bands, with dawn arcs drifting through them. The canvas is mounted in the
 * band's bottom padding, below every line of type, so the one place the
 * texture is allowed its full statement is a place copy can never be.
 * ------------------------------------------------------------------------ */

export function sunburstFloor(aspect: AspectBox): FieldFn {
  const CAP = 0.14;
  const GAP = 0.04;
  const RAYS = 44;

  return (u, v, t) => {
    const a = aspect.value;
    const dx = (u - 0.5) * a;
    const dy = v - 1.02;
    const r = Math.sqrt(dx * dx + dy * dy);

    if (r < CAP) return 1.5;
    if (r < CAP + GAP) return 0;

    const theta = Math.atan2(dy, dx);
    const ray = rayLobe(theta, RAYS, 0.25 * Math.sin(t * 0.18));
    const fall = step(Math.min(1, Math.pow(0.9 / r, 0.9)), 6);
    let value = ray * fall * 0.92;

    const c = 0.5 + 0.5 * Math.cos((r - CAP) * 15 - t * 0.5);
    const c2 = c * c;
    const c4 = c2 * c2;
    const c8 = c4 * c4;
    const arc = c8 * c8 * 0.5 * (1 - smoothstep(1.4, 3.4, r));
    value = 1 - (1 - value) * (1 - arc);

    return value;
  };
}

export type UseDitherFieldOptions = Omit<DitherLoopOptions, 'cssWidth' | 'cssHeight'> & {
  /**
   * Resolve the field's ink from the canvas's own computed CSS `color` at
   * mount, and re-resolve whenever the document's `data-theme` attribute
   * flips. A 1-bit field is exactly two colors, so following the theme means
   * flipping the ink, not blending it: style the canvas with
   * `color: var(--deco-ornament)` (or any theme-mapped ink) and the dark
   * theme gets the lifted gold instead of a stale frame.
   */
  themeInk?: boolean;
};

/**
 * Mount an animated dither field on a canvas. Builds the field from a factory
 * that receives a live AspectBox, wires a ResizeObserver into that box, and
 * tears the loop down with the component. Reduced motion is handled inside
 * `createDitherLoop` (single static frame, no rAF at all).
 */
export function useDitherField(
  factory: (aspect: AspectBox) => FieldFn,
  options: UseDitherFieldOptions
): React.RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const optsRef = useRef(options);
  optsRef.current = options;

  useMountEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const box: AspectBox = { value: 1 };
    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        box.value = rect.width / rect.height;
        box.height = rect.height;
      }
    };
    measure();

    const { themeInk, ...loopOptions } = optsRef.current;

    let loop: DitherLoopHandle | null = null;
    loop = createDitherLoop(canvas, factory(box), loopOptions);

    // Theme-following ink: the canvas's computed `color` IS the ink. Resolved
    // once at mount (after the loop's first synchronous frame) and again on
    // every data-theme flip; a static (reduced-motion) loop repaints inside
    // setOptions, a running one picks the new ink up next frame.
    let themeObserver: MutationObserver | undefined;
    if (themeInk) {
      const applyInk = () => {
        const ink = getComputedStyle(canvas).color;
        if (ink) loop?.setOptions({ ink });
      };
      applyInk();
      if (typeof MutationObserver !== 'undefined') {
        themeObserver = new MutationObserver(applyInk);
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme'],
        });
      }
    }

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            measure();
            // A static (reduced-motion) loop needs an explicit repaint with
            // the fresh aspect; a running loop picks it up next frame.
            if (loop && !loop.running) loop.render(optsRef.current.reducedMotionTime ?? 0);
          })
        : undefined;
    ro?.observe(canvas);

    return () => {
      ro?.disconnect();
      themeObserver?.disconnect();
      loop?.destroy();
      loop = null;
    };
  });

  return canvasRef;
}
