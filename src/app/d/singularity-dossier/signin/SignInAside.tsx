'use client';

import { useRef } from 'react';

import { createDitherLoop, globe, type DitherLoopHandle } from '@/lib/dither';
import { createGlyphField, type GlyphFieldHandle } from '@/lib/glyph-field';
import { useMountEffect } from '@/lib/use-mount-effect';

import SignInPalette from './SignInPalette';

/**
 * The sign-in aside: a massive halftone globe (the dither-field plate)
 * standing over the glyph field, the switching word cycling beneath it
 * as the plate's caption — all inked in the house blue. The engines
 * sample --tc-ink off their own canvases, so the blue pair rides the
 * theme through signin.css. No rails, no copy — the instrument is the
 * aside.
 */
export default function SignInAside() {
  const asideRef = useRef<HTMLElement>(null);
  const rainRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<GlyphFieldHandle | null>(null);
  const loopRef = useRef<DitherLoopHandle | null>(null);

  useMountEffect(() => {
    const rainCanvas = rainRef.current;
    const globeCanvas = globeRef.current;
    if (!rainCanvas || !globeCanvas) return;

    /* Canvas type must match the page's own faces. The tokens live on
       .singularity-root, so sample them off the canvas (inside the
       root) — documentElement never carries them. */
    const bodyFamily = getComputedStyle(rainCanvas).fontFamily;
    const monoFamily = getComputedStyle(rainCanvas)
      .getPropertyValue('--tc-mono')
      .trim();

    const field: GlyphFieldHandle | null = createGlyphField({
      canvas: rainCanvas,
      displayFamily: bodyFamily || undefined,
      monoFamily: monoFamily || undefined,
      copy: 'none',
      formWords: false,
    });
    fieldRef.current = field;

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
    loopRef.current = loop;

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
      loopRef.current = null;
      fieldRef.current = null;
    };
  });

  const applyPalette = (darkInk: string, lightInk: string) => {
    const aside = asideRef.current;
    const rainCanvas = rainRef.current;
    const globeCanvas = globeRef.current;
    if (!aside || !rainCanvas || !globeCanvas) return;

    aside.style.setProperty('--sgs-palette-dark', darkInk);
    aside.style.setProperty('--sgs-palette-light', lightInk);
    const ink = getComputedStyle(globeCanvas).getPropertyValue('--tc-ink').trim();
    if (!ink) return;
    fieldRef.current?.setInk(ink);
    loopRef.current?.setOptions({ ink });
  };

  return (
    <aside className='sgs-aside' aria-label='General Translation' ref={asideRef}>
      {/* the globe underneath, the glyph machine over it: the rain reads
          the same either way (same ink), but the switching word and its
          caliper stay legible instead of sinking into the halftone */}
      <canvas ref={globeRef} className='sgs-globe' aria-hidden='true' />
      <canvas ref={rainRef} className='sgs-rain' aria-hidden='true' />
      <SignInPalette onPaletteChange={applyPalette} />
    </aside>
  );
}
