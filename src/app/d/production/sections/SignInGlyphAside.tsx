'use client';

import { useRef } from 'react';

import {
  createDitherLoop,
  globe,
  type DitherLoopHandle,
} from '@/lib/dither';
import { GLYPHS } from '@/lib/glyph-field';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The sign-in aside — a halftone globe over ambient glyph rain.
 *
 * Reproduces apps/dashboard/src/components/signin/SignInGlyphAside.tsx: the
 * same lambert-shaded, noise-landmass globe from the shared dither engine,
 * with the same knobs (scale 4, 24fps, gamma 1.15, radius 0.44, spin 0.14,
 * graticule off), inked off the canvas's own --tc-ink so a theme flip
 * re-inks it.
 *
 * The one substitution: the real aside's rain layer is
 * `createGlyphField({ copy: 'none', formWords: false })`. This repo's copy of
 * that engine (src/lib/glyph-field.ts) predates the `formWords` flag, so
 * `copy: 'none'` would condense the field into the printed word "language"
 * over the globe — an element the real plate does not have. The ambient drift
 * is therefore drawn here instead, from the engine's own glyph inventory
 * (GLYPHS, the letters of the eight words), on the engine's column pitch and
 * depth fade. Same material, no word.
 */
export default function SignInGlyphAside() {
  const glyphRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const glyphCanvas = glyphRef.current;
    const globeCanvas = globeRef.current;
    if (!glyphCanvas || !globeCanvas) return;

    /* The ink follows the theme: resolved off each canvas so the value is
       the page's own, never a guess. */
    const resolveInk = (canvas: HTMLCanvasElement): string =>
      getComputedStyle(canvas).getPropertyValue('--tc-ink').trim() || 'currentColor';

    /* ---- the globe: the reference plate ---- */
    const loop: DitherLoopHandle = createDitherLoop(
      globeCanvas,
      globe({
        cx: 0.5,
        cy: 0.5,
        radius: 0.44,
        ambient: 0.14,
        rim: 0.16,
        graticule: 0,
        landmass: 0.42,
        spin: 0.14,
      }),
      {
        scale: 4,
        ink: resolveInk(globeCanvas),
        paper: 'transparent',
        fps: 24,
        gamma: 1.15,
        reducedMotionTime: 8,
        applyStyles: false,
      }
    );
    /* applyStyles is off (the loop's 100%-sizing would fight the centered
       square box in the sheet), so pin the upscale behavior here */
    globeCanvas.style.imageRendering = 'pixelated';

    /* ---- the rain: ambient drift, no word ---- */
    const rain = createGlyphRain(glyphCanvas, () => resolveInk(glyphCanvas));

    /* This repo resolves dark mode as [data-theme] on the root (the real app
       uses a root class) — re-ink on flips either way. */
    const themeMo = new MutationObserver(() => {
      loop.setOptions({ ink: resolveInk(globeCanvas) });
      rain.reink();
    });
    themeMo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => {
      themeMo.disconnect();
      loop.destroy();
      rain.destroy();
    };
  });

  return (
    /* desktop only: on a phone the form is the page — the plate never mounts
       visibly, and both engines idle at zero size */
    <aside aria-label='General Translation' className='psi-aside'>
      <canvas aria-hidden='true' className='psi-globe' ref={globeRef} />
      <canvas aria-hidden='true' className='psi-rain' ref={glyphRef} />
    </aside>
  );
}

/* ============================================================
   The ambient drift.

   The pool is built once per layout and reused every frame — the
   loop allocates nothing. Glyphs are set in columns on the glyph
   engine's own 34px pitch, with depth rendered as size plus an
   alpha ramp so overlapping glyphs separate by depth instead of
   colliding at equal ink, and the field is depth-sorted once so
   near ink lands over far. prefers-reduced-motion draws exactly one
   frame and never starts the loop; a hidden tab or an offscreen
   plate stops it.
   ============================================================ */

type RainHandle = { reink: () => void; destroy: () => void };

const RAIN_PITCH = 34;
const RAIN_FAMILY = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

function createGlyphRain(
  canvas: HTMLCanvasElement,
  resolveInk: () => string
): RainHandle {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { reink: () => {}, destroy: () => {} };

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let ink = resolveInk();
  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let visible = true;

  type Drop = {
    x: number;
    y: number;
    z: number;
    size: number;
    fall: number;
    sway: number;
    phase: number;
    glyph: string;
  };
  let drops: Drop[] = [];

  /* Deterministic layout: the plate looks the same on every load, which is
     what makes it read as typesetting rather than static. */
  let seed = 0x67746c67;
  const rand = (): number => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const measure = (): void => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    if (width <= 0 || height <= 0) {
      drops = [];
      return;
    }
    seed = 0x67746c67;
    const columns = Math.max(1, Math.round(width / RAIN_PITCH));
    const rows = Math.max(1, Math.round(height / RAIN_PITCH));
    drops = [];
    for (let c = 0; c < columns; c += 1) {
      for (let r = 0; r < rows; r += 1) {
        const z = rand();
        drops.push({
          x: (c + 0.5) * (width / columns) + (rand() - 0.5) * 9,
          y: (r + 0.5) * (height / rows) + (rand() - 0.5) * 14,
          z,
          size: 21 - z * 10,
          fall: 7 + (1 - z) * 15,
          sway: 2 + rand() * 5,
          phase: rand() * Math.PI * 2,
          glyph: GLYPHS[Math.floor(rand() * GLYPHS.length)] ?? 'a',
        });
      }
    }
    /* far first, so near ink lands over far ink */
    drops.sort((a, b) => b.z - a.z);
  };

  const draw = (timeSec: number, dt: number): void => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = ink;
    for (const d of drops) {
      d.y += d.fall * dt;
      if (d.y > height + 26) d.y -= height + 52;
      const x = d.x + Math.sin(timeSec * 0.22 + d.phase) * d.sway;
      /* far glyphs fade, and the top and bottom edges feather out so the
         field never terminates on a ruled line */
      const edge =
        Math.min(1, Math.max(0, d.y / 70)) *
        Math.min(1, Math.max(0, (height - d.y) / 90));
      ctx.globalAlpha = (0.05 + (1 - d.z) * 0.19) * edge;
      ctx.font = `${Math.round(d.size)}px ${RAIN_FAMILY}`;
      ctx.fillText(d.glyph, x, d.y);
    }
    ctx.globalAlpha = 1;
  };

  const tick = (now: number): void => {
    raf = requestAnimationFrame(tick);
    if (!visible || document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    draw(now / 1000, dt);
  };

  measure();

  const ro = new ResizeObserver(() => {
    measure();
    if (reduced) draw(8, 0);
  });
  ro.observe(canvas);

  let io: IntersectionObserver | null = null;

  if (reduced) {
    draw(8, 0);
  } else {
    io = new IntersectionObserver(
      (entries) => {
        visible = entries[0] ? entries[0].isIntersecting : true;
      },
      { rootMargin: '120px' }
    );
    io.observe(canvas);
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  return {
    reink: () => {
      ink = resolveInk();
      if (reduced) draw(8, 0);
    },
    destroy: () => {
      ro.disconnect();
      io?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    },
  };
}
