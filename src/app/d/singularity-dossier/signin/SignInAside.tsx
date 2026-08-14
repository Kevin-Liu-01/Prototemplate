'use client';

import { useRef } from 'react';

import { createDitherLoop, globe, type DitherLoopHandle } from '@/lib/dither';
import { createGlyphField, type GlyphFieldHandle } from '@/lib/glyph-field';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The sign-in aside: a massive halftone globe (the dither-field plate)
 * standing over the glyph field, the switching word cycling beneath it
 * as the plate's caption — all inked in the house blue. The engines
 * sample --tc-ink off their own canvases, so the blue pair rides the
 * theme through signin.css. No rails, no copy — the instrument is the
 * aside.
 */
export default function SignInAside() {
  const rainRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const rainCanvas = rainRef.current;
    const globeCanvas = globeRef.current;
    if (!rainCanvas || !globeCanvas) return;

    /* Canvas type must match the page's own faces. */
    const bodyFamily = getComputedStyle(document.body).fontFamily;
    const monoFamily = getComputedStyle(document.documentElement)
      .getPropertyValue('--tc-mono')
      .trim();

    const field: GlyphFieldHandle | null = createGlyphField({
      canvas: rainCanvas,
      displayFamily: bodyFamily || undefined,
      monoFamily: monoFamily || undefined,
      copy: 'none',
      wordFill: 'dithered',
      /* the caption band under the centered globe (the plate is
         clamped to 64svh in signin.css so the two never collide) */
      standalone: { baseline: 0.84, fontScale: 0.13, fontCap: 96 },
    });

    /* The globe: lambert-shaded sphere with noise landmass, no
       graticule — the reference plate at chunky cells, slow spin. */
    const resolveInk = (): string =>
      getComputedStyle(globeCanvas).getPropertyValue('--tc-ink').trim() ||
      '#2563eb';

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
        ink: resolveInk(),
        paper: 'transparent',
        fps: 24,
        gamma: 1.15,
        reducedMotionTime: 8,
        applyStyles: false,
      },
    );

    const themeMo = new MutationObserver(() => {
      loop.setOptions({ ink: resolveInk() });
    });
    themeMo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => {
      themeMo.disconnect();
      loop.destroy();
      field?.destroy();
    };
  });

  return (
    <aside className='sgs-aside' aria-label='General Translation'>
      {/* the globe underneath, the glyph machine over it: the rain reads
          the same either way (same ink), but the switching word and its
          caliper stay legible instead of sinking into the halftone */}
      <canvas ref={globeRef} className='sgs-globe' aria-hidden='true' />
      <canvas ref={rainRef} className='sgs-rain' aria-hidden='true' />
    </aside>
  );
}
