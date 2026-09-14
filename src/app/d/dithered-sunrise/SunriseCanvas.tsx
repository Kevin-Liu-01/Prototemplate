'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * DITHERED-SUNRISE — the hero sun, quantized.
 *
 * The whole composition is rendered as ordered 8x8 Bayer dither: a low gold
 * disc with a bright limb, a fan of deco rays, and slow concentric dawn arcs
 * drifting outward. There is not one smooth gradient in the output; every
 * luminance ramp resolves into discrete square cells, dense metal at the
 * center and sparse dots at the edges.
 *
 * Mechanics: the field is evaluated per CELL (3 css px) into a small
 * ImageData buffer, then blitted up with imageSmoothingEnabled=false so the
 * cells stay square. Per-cell geometry (radius, ray angle, falloff) is
 * precomputed on resize; a frame only evaluates two cosines per cell. The
 * loop runs at ~11fps (dither wants a slow shutter), pauses offscreen and on
 * a hidden tab, and under prefers-reduced-motion the sun is drawn exactly
 * once, still.
 */

/* Standard 8x8 ordered Bayer matrix. */
const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55,
  23, 61, 29, 53, 21,
];

const THRESH = new Float32Array(64);
for (let i = 0; i < 64; i++) THRESH[i] = (BAYER8[i] + 0.5) / 64;

/** Css px per dither cell (the blit can stretch it slightly, staying 2-4px). */
const CELL = 3;
/** Buffer width cap; above this the cells grow instead of the cell count. */
const MAX_COLS = 560;
/** ~11fps. Ordered dither reads better with a slow shutter than at 60. */
const FRAME_MS = 90;

const RAYS = 26;
const SUN_X = 0.5;
const SUN_Y = 1.1;
const SUN_R = 0.46;
/** Radians of ring phase per unit of radius: arc spacing ~= 0.11 of height. */
const RING_K = 56;

const BRIGHT: readonly [number, number, number] = [246, 206, 111];
const GOLD: readonly [number, number, number] = [215, 163, 65];
const EMBER: readonly [number, number, number] = [151, 111, 47];

export default function SunriseCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useMountEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const buffer = document.createElement('canvas');
    const bctx = buffer.getContext('2d');
    if (!bctx) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let bw = 0;
    let bh = 0;
    let img: ImageData | null = null;
    /** Ray-angle basis (angle * RAYS), per cell. */
    let angArr = new Float32Array(0);
    /** Ring phase basis ((r - R) * RING_K), per cell. */
    let ringArr = new Float32Array(0);
    /** Radial falloff; -1 marks the disc limb, -2 the disc core. */
    let fallArr = new Float32Array(0);
    /** How strongly the dawn arcs register at this radius. */
    let gainArr = new Float32Array(0);

    /** Re-derive buffers and per-cell geometry from the canvas's css box. */
    const measure = (): boolean => {
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (!cssW || !cssH) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      // Setting width resets ctx state, so the nearest-neighbor flag goes here.
      ctx.imageSmoothingEnabled = false;
      bw = Math.min(MAX_COLS, Math.ceil(cssW / CELL));
      bh = Math.max(1, Math.round(bw * (cssH / cssW)));
      buffer.width = bw;
      buffer.height = bh;
      img = bctx.createImageData(bw, bh);
      const n = bw * bh;
      angArr = new Float32Array(n);
      ringArr = new Float32Array(n);
      fallArr = new Float32Array(n);
      gainArr = new Float32Array(n);
      const aspect = cssW / cssH;
      for (let y = 0; y < bh; y++) {
        const v = (y + 0.5) / bh;
        const dy = v - SUN_Y;
        for (let x = 0; x < bw; x++) {
          const i = y * bw + x;
          const u = (x + 0.5) / bw;
          const dx = (u - SUN_X) * aspect;
          const r = Math.hypot(dx, dy);
          if (r < SUN_R) {
            fallArr[i] = r < SUN_R * 0.86 ? -2 : -1;
            continue;
          }
          const fall = Math.pow(SUN_R / r, 1.9);
          fallArr[i] = fall;
          angArr[i] = Math.atan2(dy, dx) * RAYS;
          ringArr[i] = (r - SUN_R) * RING_K;
          gainArr[i] = Math.min(1, fall * 2.4);
        }
      }
      return true;
    };

    const render = (nowMs: number) => {
      if (!img) return;
      const t = nowMs / 1000;
      // Rays sway a fraction of one ray width; arcs drift slowly outward.
      const sway = reduced ? 0 : 0.35 * Math.sin(t * 0.26);
      const drift = reduced ? 0 : t * 0.9;
      const data = img.data;
      let i = 0;
      let p = 0;
      for (let y = 0; y < bh; y++) {
        const rowT = (y & 7) << 3;
        for (let x = 0; x < bw; x++, i++, p += 4) {
          const f = fallArr[i];
          let lum: number;
          if (f < 0) {
            lum = 2; // solid disc: always above every Bayer threshold
          } else {
            const w = 0.5 + 0.5 * Math.cos(angArr[i] + sway);
            const ray = w * w * w;
            lum = f * (0.2 + 0.8 * ray);
            const c = 0.5 + 0.5 * Math.cos(ringArr[i] - drift);
            const c2 = c * c;
            const c4 = c2 * c2;
            const c8 = c4 * c4;
            lum += 0.16 * c8 * c4 * gainArr[i];
          }
          if (lum > THRESH[rowT | (x & 7)]) {
            const tier =
              f < 0
                ? f < -1.5
                  ? GOLD
                  : BRIGHT
                : lum > 0.85
                  ? BRIGHT
                  : lum > 0.4
                    ? GOLD
                    : EMBER;
            data[p] = tier[0];
            data[p + 1] = tier[1];
            data[p + 2] = tier[2];
            data[p + 3] = 255;
          } else {
            data[p + 3] = 0;
          }
        }
      }
      bctx.putImageData(img, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(buffer, 0, 0, bw, bh, 0, 0, canvas.width, canvas.height);
    };

    let raf = 0;
    let last = 0;
    let visible = true;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      last = now;
      render(now);
    };
    const start = () => {
      if (!raf && !reduced && visible && !document.hidden) {
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const ro = new ResizeObserver(() => {
      if (measure()) render(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (measure()) render(performance.now());
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  });

  return <canvas aria-hidden='true' className={className} ref={canvasRef} />;
}
