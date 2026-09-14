import { useRef } from 'react';

import { ditherToCanvas } from '@/lib/dither';
import type { FieldFn } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * One still frame of ordered dither, drawn from CSS tokens.
 *
 * The stele's textures are stone, so they do not move: the grain of the
 * slab, the sun disk in the crown and the broken base are each rendered
 * once with the Bayer engine and redrawn only when the canvas is resized
 * or the theme flips. Ink and paper are read from custom properties on
 * the canvas itself, so colors stay in the stylesheet and both themes
 * resolve without a literal in TSX. Everything the hook starts, it stops
 * on unmount.
 */
export type StillOptions = {
  /** CSS pixels per dither cell. Default 3. */
  scale?: number;
  /** The custom property that carries the lit color, read on the canvas. */
  inkToken: string;
  /** The custom property for the unlit color; transparent when omitted. */
  paperToken?: string;
  gamma?: number;
};

/** The field is built per draw from the canvas's CSS size, so grain can be sized in pixels. */
export type StillField = (cssWidth: number, cssHeight: number) => FieldFn;

export function useStillDither(field: StillField, opts: StillOptions) {
  const ref = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let frame = 0;

    const draw = () => {
      frame = 0;
      const style = getComputedStyle(canvas);
      const ink = style.getPropertyValue(opts.inkToken).trim() || style.color;
      const paper = opts.paperToken ? style.getPropertyValue(opts.paperToken).trim() : '';
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      ditherToCanvas(canvas, field(rect.width, rect.height), {
        scale: opts.scale ?? 3,
        ink,
        paper: paper || 'transparent',
        gamma: opts.gamma,
        cssWidth: rect.width,
        cssHeight: rect.height,
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    draw();

    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);

    const theme = new MutationObserver(schedule);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      resize.disconnect();
      theme.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  });

  return ref;
}

/** Deterministic 2D hash, 0..1. */
export function hash2(x: number, y: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Bilinear value noise, 0..1. */
export function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const sx = xf * xf * (3 - 2 * xf);
  const sy = yf * yf * (3 - 2 * yf);
  const n00 = hash2(xi, yi);
  const n10 = hash2(xi + 1, yi);
  const n01 = hash2(xi, yi + 1);
  const n11 = hash2(xi + 1, yi + 1);
  const a = n00 + (n10 - n00) * sx;
  const b = n01 + (n11 - n01) * sx;
  return a + (b - a) * sy;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
