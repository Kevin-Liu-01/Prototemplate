'use client';

import { useRef } from 'react';

import { BAYER_8, prefersReducedMotion } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

import { bayerThreshold, hash32, pickGlyph } from './scripts';

/**
 * GLYPH MOSAIC: the one canvas.
 *
 * C1 homes: the hero plate (C1.4, variant `sunburst`) and the dark band
 * floor (C1.5, variant `frieze`).
 *
 * The plate is a mosaic floor whose tesserae are real glyphs from seven
 * scripts. Density is decided the way every ramp on this site is decided:
 * a scalar field is compared against the house 8x8 Bayer screen, cell by
 * cell, and a tessera is laid only where the field clears the threshold.
 * The ramp therefore reads as ordered dither at glyph scale, never as a
 * gradient. Alternate rays of the sunburst carry the ornament color; the
 * rest lay in ink; one course around the disc is the page's accent.
 *
 * Colors are never owned here. The ink is the canvas's computed `color`,
 * the ornament and accent are read from the `--deco-*` tokens the root
 * publishes, and all three are re-read when `data-theme` flips. The reveal
 * lays tesserae outward from the center over roughly two thirds of a
 * second, started by an IntersectionObserver; under reduced motion, or on a
 * hidden tab, the finished floor is painted in one pass. Resizes repaint
 * the finished floor. Unmount cancels everything.
 */

export type MosaicVariant = 'sunburst' | 'frieze';

export type GlyphMosaicProps = {
  variant: MosaicVariant;
  className?: string;
  /** Present for a functional image (role img); absent for a decorative one. */
  title?: string;
  /** CSS pixels per tessera cell. */
  cell?: number;
  seed?: number;
};

type Tone = 'ink' | 'ornament' | 'accent';

type Tessera = { x: number; y: number; glyph: string; tone: Tone; size: number; order: number };

type Sample = { f: number; tone: Tone };

const RAYS = 24;
const CHEVRON_PERIOD = 10;

function smooth(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** The sunburst: a sparse disc, one accent course, then alternating rays. */
function sunburst(u: number, v: number, aspect: number): Sample {
  const dx = (u - 0.5) * aspect;
  const dy = v - 0.47;
  const r = Math.hypot(dx, dy);
  if (r < 0.14) return { f: 0.14, tone: 'ink' };
  if (r < 0.172) return { f: 1, tone: 'accent' };
  const ang = Math.atan2(dy, dx) + Math.PI;
  const wedge = Math.floor((ang / (2 * Math.PI)) * RAYS) % RAYS;
  const far = smooth(0.2, 1.05, r);
  if (wedge % 2 === 0) return { f: 0.94 - 0.66 * far, tone: 'ornament' };
  return { f: 0.3 - 0.25 * far, tone: 'ink' };
}

/** The frieze: two chevron courses over a coverage ramp that rises to the floor. */
function frieze(gx: number, gy: number, rows: number): Sample {
  const p = ((gx % CHEVRON_PERIOD) + CHEVRON_PERIOD) % CHEVRON_PERIOD;
  const half = CHEVRON_PERIOD / 2;
  const tri = p < half ? p / half : 2 - p / half;
  const zig = 1 + Math.round(tri * Math.max(1, rows - 6));
  if (gy === zig) return { f: 1, tone: 'ornament' };
  if (gy === zig + 2) return { f: 1, tone: 'ink' };
  const ramp = rows > 1 ? gy / (rows - 1) : 1;
  return { f: 0.03 + 0.4 * ramp * ramp, tone: 'ink' };
}

function build(w: number, h: number, variant: MosaicVariant, cell: number, seed: number): Tessera[] {
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const aspect = w / h;
  const out: Tessera[] = [];
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const u = (gx + 0.5) / cols;
      const v = (gy + 0.5) / rows;
      const sample = variant === 'sunburst' ? sunburst(u, v, aspect) : frieze(gx, gy, rows);
      if (sample.f <= bayerThreshold(BAYER_8, gx, gy)) continue;
      const x = gx * cell + cell / 2;
      const y = gy * cell + cell / 2;
      const jitter = hash32(gx, gy, seed + 7);
      const size = Math.round(cell * (0.7 + 0.16 * Math.floor(jitter * 3) * 0.5));
      const order =
        variant === 'sunburst'
          ? Math.hypot(x - w / 2, y - h * 0.47) + jitter * cell * 3
          : x + jitter * cell * 2;
      out.push({ x, y, glyph: pickGlyph(gx, gy, seed).glyph, tone: sample.tone, size, order });
    }
  }
  out.sort((a, b) => a.order - b.order);
  return out;
}

type Palette = { ink: string; ornament: string; accent: string; family: string };

function paint(ctx: CanvasRenderingContext2D, cells: readonly Tessera[], from: number, to: number, p: Palette): void {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = from; i < to; i++) {
    const c = cells[i];
    if (!c) continue;
    ctx.fillStyle = c.tone === 'ink' ? p.ink : c.tone === 'ornament' ? p.ornament : p.accent;
    ctx.globalAlpha = c.tone === 'ink' ? 0.74 : 1;
    ctx.font = `${c.size}px ${p.family}`;
    ctx.fillText(c.glyph, c.x, c.y);
  }
  ctx.globalAlpha = 1;
}

export default function GlyphMosaic({ variant, className, title, cell = 14, seed = 1 }: GlyphMosaicProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let raf = 0;
    let disposed = false;
    let armed = false;
    let cells: Tessera[] = [];
    let drawn = 0;

    const palette = (): Palette => {
      const cs = getComputedStyle(canvas);
      const ink = cs.color;
      return {
        ink,
        ornament: cs.getPropertyValue('--deco-ornament').trim() || ink,
        accent: cs.getPropertyValue('--deco-accent').trim() || ink,
        family: cs.fontFamily,
      };
    };

    /* Size the bitmap to the CSS box (capped at 2x) and lay the floor. */
    const setup = (): CanvasRenderingContext2D | null => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return null;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      cells = build(rect.width, rect.height, variant, cell, seed);
      drawn = 0;
      return ctx;
    };

    const paintAll = () => {
      cancelAnimationFrame(raf);
      const ctx = setup();
      if (!ctx) return;
      paint(ctx, cells, 0, cells.length, palette());
      drawn = cells.length;
    };

    const reveal = () => {
      const ctx = setup();
      if (!ctx) return;
      const p = palette();
      const perFrame = Math.max(24, Math.ceil(cells.length / 40));
      const step = () => {
        if (disposed) return;
        const next = Math.min(cells.length, drawn + perFrame);
        paint(ctx, cells, drawn, next, p);
        drawn = next;
        if (next < cells.length) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (armed || disposed) return;
      armed = true;
      /* Glyphs from seven scripts resolve through the page's fonts; wait for
         them so the first pass is the final pass. */
      const go = () => {
        if (disposed) return;
        if (prefersReducedMotion() || document.hidden) paintAll();
        else reveal();
      };
      document.fonts.ready.then(go).catch(go);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          io.disconnect();
        }
      },
      { rootMargin: '96px' }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      if (armed) paintAll();
    });
    ro.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      if (armed) paintAll();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
    };
  });

  return title ? (
    <canvas ref={ref} className={className} role='img' aria-label={title} />
  ) : (
    <canvas ref={ref} className={className} aria-hidden='true' />
  );
}
