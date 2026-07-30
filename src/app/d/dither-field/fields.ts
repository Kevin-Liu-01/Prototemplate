'use client';

/**
 * DITHER-FIELD — the fork's field compositions.
 *
 * Everything visual on this page that is not type is a 1-bit Bayer field
 * rendered by `src/lib/dither.ts`. This module owns the two big compositions
 * (the hero broadcast and the dark band's ground burst) plus a small React
 * hook that mounts a `createDitherLoop` on a canvas and keeps the field's
 * aspect ratio honest across resizes.
 *
 * The compositional law (AESTHETIC_ADDENDUM 2b) applied to ink instead of
 * light: the field is the armature, not wallpaper. The burst's convergence
 * core is a deliberate paper hole, and the hero's type block sits exactly
 * inside it — one object, not a layout floating over a texture.
 */

import { useEffect, useRef } from 'react';

import {
  createDitherLoop,
  type DitherLoopHandle,
  type DitherLoopOptions,
  type FieldFn,
} from '@/lib/dither';

const TAU = Math.PI * 2;

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Mutable aspect box. `ditherToCanvas` re-measures the canvas every frame, so
 * the buffer tracks resizes on its own — but a field closure bakes its aspect
 * in. Fields here read aspect through this box and the hook updates it from a
 * ResizeObserver, so rays stay straight at any viewport without tearing the
 * loop down.
 */
export type AspectBox = { value: number };

export type HeroBroadcastOptions = {
  /** Vertical centre of the composition, 0..1. Default 0.46. */
  cy?: number;
  /**
   * Scale on the paper well (and therefore the whole figure, which is drawn
   * in well-distance units). 1 is the original 82vh composition; the hero
   * BAND runs it tighter so the core hugs one command line instead of a
   * headline block.
   */
  wellScale?: number;
};

/**
 * THE BROADCAST — the hero field.
 *
 * One sculptural figure against composed emptiness: concentric signal rings
 * echoing the type well's shape, and a crown of crisp needle rays radiating
 * from the ring band — every ray an individual, its length and weight set by
 * harmonics of its angle, its tip dissolving into loose Bayer cells. There is
 * no turbulence and no noise mass anywhere: everything the field draws is a
 * deliberate stroke, and the frame's corners resolve to plain paper well
 * before the edge. The type block sits in the paper core; the well multiplies
 * the whole field so legibility is a guarantee rather than a hope.
 */
export function heroBroadcast(aspect: AspectBox, opts: HeroBroadcastOptions = {}): FieldFn {
  const CX = 0.5;
  const CY = opts.cy ?? 0.46;
  const WS = opts.wellScale ?? 1;
  /** Vertical squash: the composition is wider than tall, so is the energy. */
  const VS = 1.35;

  return (u, v, t) => {
    const a = aspect.value;

    const dx = (u - CX) * a;
    const dy = (v - CY) * VS;

    // The type well — the composition's hub. `q` is superellipse distance
    // from the headline block: <1 inside (always paper), ~1 at the fringe.
    // Everything radiates from this fringe, so the type block itself is the
    // broadcast source and the alignment is one system, not two.
    const wx = Math.min(0.56, Math.max(0.36, 0.27 * a)) * WS;
    const qx = Math.abs(dx) / wx;
    const qy = Math.abs(dy) / (0.29 * WS * VS);
    const q = Math.pow(Math.pow(qx, 2.4) + Math.pow(qy, 2.4), 1 / 2.4);
    if (q <= 0.88) return 0;
    const well = smoothstep(0.88, 1.18, q);

    // The figure ends before the frame does. Past q~2.5 the paper is empty by
    // construction, so the corners never collect mass.
    if (q >= 2.5) return 0;

    // ZONE 1 — the rings: two solid contour bands hugging the well, breathing
    // by a few thousandths of q. Explicit centres rather than a sine train, so
    // each ring is a deliberate drawn stroke — solid ink at its core, a
    // one-cell dither fringe at its edges — and the zone between rings and
    // crown stays empty on purpose.
    const r1 = 1.13 + 0.015 * Math.sin(t * 0.32);
    const r2 = 1.42 + 0.02 * Math.sin(t * 0.26 + 1.4);
    const d1 = Math.abs(q - r1);
    const d2 = Math.abs(q - r2);
    let rings = (1 - smoothstep(0.014, 0.05, d1)) * 0.95;
    const ring2 = (1 - smoothstep(0.012, 0.045, d2)) * 0.85;
    if (ring2 > rings) rings = ring2;

    // ZONE 2 — the crown: 26 needle rays, detached from the rings by a clear
    // paper gap and living in the annulus the frame's own edges crop. Each
    // ray's reach and weight are fixed harmonics of its angle (integer
    // multiples, so there is no seam at ±π), with one slow breathing term;
    // the value tapers toward the tip so the ordered dither dissolves every
    // needle into loose cells before the corners, which stay paper.
    const th = Math.atan2(dy, dx);
    const reach =
      1.86 +
      0.26 * Math.sin(3 * th + 1.7) +
      0.16 * Math.sin(7 * th - 0.6) +
      0.05 * Math.sin(t * 0.35 + 2 * th);
    const len = reach < 1.68 ? 1.68 : reach;

    const needle = 1 - Math.abs(Math.sin(13 * th + t * 0.05));
    const n2 = needle * needle;
    const n6 = n2 * n2 * n2;
    const weight = 0.75 + 0.25 * Math.sin(5 * th + 0.9);
    const rayZone = smoothstep(1.52, 1.64, q) * (1 - smoothstep(len - 0.3, len, q));
    const rays = n6 * rayZone * weight;

    // Screen-blend the zones; the well guarantees the core stays paper.
    return (1 - (1 - rings) * (1 - rays)) * well;
  };
}

/**
 * PANEL BLOOM — the dark band's texture panel, paper-on-ink.
 *
 * The viteplus grammar rebuilt in this fork's material: a halftone bloom —
 * concentric white rings dissolving into loose cells toward the panel's
 * edges — around a committed dark core, and the status terminal floats in
 * that core. The texture never runs under type: the terminal is an opaque
 * plate, and everything inside the core radius is held at ink by the field
 * itself. Confinement is architectural, not statistical.
 */
export function panelBloom(aspect: AspectBox): FieldFn {
  return (u, v, t) => {
    const a = aspect.value;

    const dx = (u - 0.5) * a;
    const dy = v - 0.5;
    const r = Math.sqrt(dx * dx + dy * dy);

    // The dark core the terminal sits in. Nothing prints here.
    if (r <= 0.38) return 0;
    const core = smoothstep(0.38, 0.52, r);

    // The bloom: a ramp toward the edges the dither renders as progressive
    // thickening — the panel's mass.
    const bloom = smoothstep(0.42, 0.98, r) * 0.74;

    // Signal rings drifting slowly outward through the bloom.
    const ridge = 1 - Math.abs(Math.sin((r - t * 0.014) * 4.2 * TAU));
    const ridge2 = ridge * ridge;
    const ridge4 = ridge2 * ridge2;
    const ringZone = smoothstep(0.4, 0.48, r) * (1 - smoothstep(0.9, 1.15, r));
    const rings = ridge4 * ridge4 * ringZone * 0.85;

    return (bloom + rings * (1 - bloom)) * core;
  };
}

/**
 * FLOOR DISSOLVE — the band's bottom edge, paper-on-ink.
 *
 * The classic ordered-dither dissolve: coverage ramps from nothing to a
 * bright floor line across the strip's height, with a slow low-frequency
 * sway so the checkerboard horizon breathes. The strip is mounted in the
 * band's bottom padding, below every line of content, so the one place the
 * texture is allowed to be loose is a place type can never be.
 */
export function floorDissolve(aspect: AspectBox): FieldFn {
  return (u, v, t) => {
    void aspect;
    const sway =
      0.045 * Math.sin(u * 5 * TAU * 0.2 + t * 0.22) +
      0.03 * Math.sin(u * 11 * TAU * 0.2 - t * 0.13);
    return clamp01((v + sway - 0.08) * 0.92);
  };
}

export type UseDitherFieldOptions = Omit<DitherLoopOptions, 'cssWidth' | 'cssHeight'> & {
  /**
   * Resolve the field's ink from the canvas's own computed CSS `color` at
   * mount, and re-resolve whenever the document's `data-theme` attribute
   * flips. A 1-bit field is exactly two colors, so following the theme means
   * flipping the ink, not blending it: style the canvas with
   * `color: var(--tc-ink)` (or any theme-mapped ink) and the dark theme gets
   * light dust on ink-black paper instead of a stale dark-on-dark frame.
   * Fields that live on permanently-dark plates (the band bloom, the floor
   * dissolve) never opt in — their literals are the point.
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const box: AspectBox = { value: 1 };
    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) box.value = rect.width / rect.height;
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
    // The factory identity is stable by convention (module-level functions).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return canvasRef;
}
