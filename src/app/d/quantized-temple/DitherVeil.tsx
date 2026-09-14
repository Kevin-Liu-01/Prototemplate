'use client';

import { useEffect, useRef } from 'react';

/**
 * The smoke above the monument: a low-resolution value-noise field rendered
 * through an ordered Bayer dither, upscaled with pixelated image rendering so
 * every sample stays a crisp square. Dense ember at the foot, sparse gold at
 * the crown, exactly the halftone material of GT's blog art. The canvas draws
 * one cell per pixel of its internal buffer (about 90 x 70 cells), throttles
 * to ~30fps, pauses off screen and in hidden tabs, and renders a single
 * static frame under prefers-reduced-motion.
 */

/* 8x8 Bayer threshold matrix, values 0..63. */
const BAYER: readonly number[] = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60,
  28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47,
  7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

/* Ink ladder, foot to crown. */
const EMBER: readonly number[] = [178, 66, 22];
const ORANGE: readonly number[] = [224, 110, 40];
const GOLD: readonly number[] = [238, 205, 143];

/* CSS pixels per dither cell. */
const CELL = 5;

function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/** Row ink: gold at the crown, through orange, to ember at the foot. */
function rowColor(vy: number): string {
  const from = vy < 0.55 ? GOLD : ORANGE;
  const to = vy < 0.55 ? ORANGE : EMBER;
  const t = vy < 0.55 ? vy / 0.55 : (vy - 0.55) / 0.45;
  const r = lerpChannel(from[0], to[0], t);
  const g = lerpChannel(from[1], to[1], t);
  const b = lerpChannel(from[2], to[2], t);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function DitherVeil({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Tileable value noise. */
    const SIZE = 128;
    const MASK = SIZE - 1;
    const vals = new Float32Array(SIZE * SIZE);
    let seed = 22695477;
    for (let i = 0; i < vals.length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      vals[i] = seed / 4294967296;
    }
    const noise = (x: number, y: number): number => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const x0 = xi & MASK;
      const x1 = (xi + 1) & MASK;
      const y0 = yi & MASK;
      const y1 = (yi + 1) & MASK;
      const a = vals[y0 * SIZE + x0];
      const b = vals[y0 * SIZE + x1];
      const c = vals[y1 * SIZE + x0];
      const d = vals[y1 * SIZE + x1];
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };

    let cols = 0;
    let rows = 0;
    let raf = 0;
    let last = 0;
    let running = false;
    let onScreen = true;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, cols, rows);
      const cx = (cols - 1) / 2;
      const spread = Math.max(1, cols * 0.36);
      for (let y = 0; y < rows; y++) {
        const vy = rows < 2 ? 1 : y / (rows - 1);
        const base = Math.pow(vy, 1.7);
        ctx.fillStyle = rowColor(vy);
        const rowOffset = (y & 7) * 8;
        for (let x = 0; x < cols; x++) {
          const dx = (x - cx) / spread;
          const g = Math.exp(-dx * dx * 2.4);
          const n =
            noise(x * 0.11 + t * 0.18, y * 0.13 - t * 0.85) * 0.68 +
            noise(x * 0.31 + 7.3, y * 0.29 - t * 1.6) * 0.32;
          const level = base * g * (0.3 + 0.98 * n) * 63;
          if (level > BAYER[rowOffset + (x & 7)]) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;
      last = now;
      draw(now / 1000);
    };

    const start = () => {
      if (running || reduced || !onScreen || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    const fit = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 1 || h < 1) return;
      cols = Math.max(8, Math.floor(w / CELL));
      rows = Math.max(8, Math.floor(h / CELL));
      canvas.width = cols;
      canvas.height = rows;
      draw(performance.now() / 1000);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      onScreen = Boolean(entry?.isIntersecting);
      if (onScreen) start();
      else stop();
    });
    io.observe(canvas);

    document.addEventListener('visibilitychange', onVisibility);

    fit();
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden='true' />;
}
