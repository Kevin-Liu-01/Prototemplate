'use client';

/**
 * M03 Trust, the HALFTONE way: each customer wordmark is rasterised once
 * through `makeGlyphField` and rendered 1-bit — a field of hard black cells
 * on paper, no anti-aliasing, no grey. Six mismatched brand marks put through
 * the same 1-bit process stop being borrowed assets and become artefacts of
 * this page.
 *
 * The one piece of real work here is the remap: `makeGlyphField` fits the
 * word's ink box inside a SQUARE SDF grid, so a wide word occupies a short
 * central band of that grid. Sampling the grid directly would render the
 * mark at a fraction of the canvas. So the word's aspect is measured first
 * (same font, probe canvas), and the field is sampled through a transform
 * that maps the grid's ink band onto the canvas's ink box — which also lets
 * every mark share one cap height, the way a composed logo wall should.
 *
 * Rendered exactly once per mount, after `document.fonts.ready`; nothing
 * here animates.
 */

import { useEffect, useRef } from 'react';

import { ditherToCanvas, makeGlyphField, type FieldFn } from '@/lib/dither';

export type WordmarkSpec = {
  text: string;
  /** Canvas-font weight standing in for the brand's own cut. */
  weight: number;
  /** Letter spacing in em, matching the styled-HTML treatment it replaces. */
  tracking?: number;
  uppercase?: boolean;
};

type Props = {
  spec: WordmarkSpec;
  /**
   * CAP height of the mark in CSS px — shared across the wall. Cap height,
   * not ink-box height: normalising the full ink box made 'Cursor' (no
   * extenders) tower over 'Mintlify' (ascenders and a descender). Every mark
   * shares one cap line; extenders add height below/above it, exactly as a
   * composed logo wall behaves.
   */
  capHeight?: number;
  /** Cell size in CSS px — 2 is M03's sanctioned value. */
  scale?: number;
};

const GRID_PADDING = 0.03;

export default function DitherWordmark({ spec, capHeight = 22, scale = 2 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !ref.current) return;
      // The display face as the browser resolved it (next/font hashes the
      // family name, so it is read off the live element, never hardcoded).
      const family = getComputedStyle(canvas).fontFamily || 'system-ui, sans-serif';
      const ink = getComputedStyle(canvas).color || '#0f1113';
      const text = spec.uppercase ? spec.text.toUpperCase() : spec.text;
      const fontTemplate = `${spec.weight} {size}px ${family}`;

      // Probe the word's ink box AND the face's cap height (the 'H' ascent)
      // with the same face and tracking, so the render can share one cap line
      // across the wall while keeping each word's own ink-box proportions.
      let wordAspect = 4;
      let inkHeight = capHeight; // rendered ink-box height for THIS word
      const probe = document.createElement('canvas');
      const ctx = probe.getContext('2d');
      if (ctx) {
        ctx.font = fontTemplate.replace('{size}', '100');
        const withSpacing = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
        if (spec.tracking && 'letterSpacing' in withSpacing) {
          withSpacing.letterSpacing = `${spec.tracking}em`;
        }
        const m = ctx.measureText(text);
        const w = (m.actualBoundingBoxLeft ?? 0) + (m.actualBoundingBoxRight ?? 0) || m.width;
        const h =
          (m.actualBoundingBoxAscent ?? 0) + (m.actualBoundingBoxDescent ?? 0) || 72;
        const cap = ctx.measureText('H').actualBoundingBoxAscent || 72;
        if (w > 0 && h > 0) {
          wordAspect = w / h;
          inkHeight = (h / cap) * capHeight;
        }
      }

      // Resolution 384 puts ~2.5x more SDF cells across each letterform than
      // the 256 default, which is what keeps bowls and joins from welding
      // shut once the field is quantised to 13 dither cells of cap height;
      // softness 2 keeps the fringe to a single cell so the interior stays
      // solid ink and only the contour dissolves.
      const glyph = makeGlyphField({
        text,
        font: fontTemplate,
        resolution: 384,
        softness: 2,
        mode: 'fill',
        padding: GRID_PADDING,
        tracking: spec.tracking ?? 0,
        fit: 'stretch',
      });

      // The ink band's extent inside the square grid, as fractions of it.
      const usable = 1 - GRID_PADDING * 2;
      const fw = wordAspect >= 1 ? usable : usable * wordAspect;
      const fh = wordAspect >= 1 ? usable / wordAspect : usable;

      // Canvas box: shared cap height, width from the word, small margins.
      const inkW = inkHeight * wordAspect;
      const mx = 8;
      const my = 9;
      const W = Math.round(inkW + mx * 2);
      const H = Math.round(inkHeight + my * 2);

      const field: FieldFn = (u, v) =>
        glyph(0.5 + (u - 0.5) * (W / inkW) * fw, 0.5 + (v - 0.5) * (H / inkHeight) * fh, 0);

      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      canvas.style.imageRendering = 'pixelated';
      canvas.style.display = 'block';

      ditherToCanvas(canvas, field, {
        scale,
        ink,
        paper: 'transparent',
        cssWidth: W,
        cssHeight: H,
        applyStyles: false,
      });
    };

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(render);
    } else {
      render();
    }

    return () => {
      cancelled = true;
    };
  }, [spec, capHeight, scale]);

  return <canvas className='df-wm' ref={ref} role='img' aria-label={spec.text} />;
}
