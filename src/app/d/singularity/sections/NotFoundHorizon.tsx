'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { createHorizonField, type HorizonFieldHandle } from '@/lib/horizon-field';

gsap.registerPlugin(useGSAP);

const REDSHIFT_START_ANGLE = 2.55;
const REDSHIFT_DURATION = 210;
const TAU = Math.PI * 2;

/* The field's themed inks: the emission keeps its native additive
   color in BOTH themes — the hole is the hole. Only the ruled lines
   re-ink for the ground they cross; no guide rings (they read as
   stray circles around the horizon). */
const HORIZON_DARK = {
  chroma: 0.64,
  doppler: 0.78,
  exposure: 2.42,
  ink: [1, 1, 1] as [number, number, number],
  ringAlpha: [0, 0, 0] as [number, number, number],
  ruleAlpha: 0.09,
  /* explicit: theme flips patch by merge, so BOTH sets must write the
     core or the other theme's disc color sticks */
  core: [0.02, 0.027, 0.043] as [number, number, number],
};

const HORIZON_LIGHT = {
  ...HORIZON_DARK,
  ink: [0.04, 0.044, 0.051] as [number, number, number],
  /* the white hole: the light sheet trades the disc's ink for paper —
     the chromatic rim carries the horizon's definition */
  core: [0.99, 0.988, 0.984] as [number, number, number],
};

/**
 * The 404 band's horizon: the shared horizon-field shader (lib/horizon-field.ts)
 * fitted so the whole glow — not merely the disc — clears the band, then handed
 * a slow redshift sweep so the bright doppler flank walks the ring once every
 * 210s. The measured geometry is published back to the section as
 * --tcnf-hole-x/y/radius, which the copy, the ruled mask and the ink disc all
 * read, so nothing has to guess where the hole landed.
 */
export default function NotFoundHorizon() {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      const canvas = canvasRef.current;
      const frame = host?.parentElement;
      if (!host || !canvas || !frame) return;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const doc = document.documentElement;
      const themedParams = () =>
        doc.dataset.theme === 'dark' ? HORIZON_DARK : HORIZON_LIGHT;
      const field: HorizonFieldHandle | null = createHorizonField(canvas, {
        speed: 0.3,
        params: themedParams(),
      });
      /* the shader crossfades over the server-rendered stand-in; if
         WebGL is out the stand-in simply stays */
      /* the reveal must not land in the mount frame: the hidden state
         has to paint once, or the crossfade collapses into a swap */
      let reveal = 0;
      if (field) {
        reveal = requestAnimationFrame(() => {
          reveal = requestAnimationFrame(() => {
            host.classList.add('is-live');
          });
        });
      } else {
        /* WebGL out: the stand-in disc surfaces under the copy */
        host.classList.add('is-fallback');
      }
      const themeObserver = new MutationObserver(() => field?.setParams(themedParams()));
      themeObserver.observe(doc, { attributes: true, attributeFilter: ['data-theme'] });

      const fit = () => {
        const width = host.clientWidth;
        const height = host.clientHeight;
        if (width < 2 || height < 2) return;

        const wide = width >= 760;
        /* the GLOW must fit, not just the disc: the halo bleeds to
           ~1.28 × radius, so the fit solves the radius back from the
           band's height with a safe inset — no viewport clips it */
        const glowK = 1.28;
        const edgeInset = 24;
        const fitR = (height / 2 - edgeInset) / glowK;
        const radius = wide
          ? Math.min(Math.max(width * 0.27, 300), 410, fitR)
          : Math.min(width * 0.71, 286, fitR);
        const glowV = radius * glowK;
        const centerX = width / 2;
        const centerY = Math.max(
          Math.min(height * (wide ? 0.5 : 0.47), height - glowV - edgeInset),
          glowV + edgeInset
        );
        const half = radius * 2.08;

        frame.style.setProperty('--tcnf-hole-x', `${centerX}px`);
        frame.style.setProperty('--tcnf-hole-y', `${centerY}px`);
        frame.style.setProperty('--tcnf-hole-radius', `${radius}px`);
        canvas.style.left = `${centerX - half}px`;
        canvas.style.top = `${centerY - half}px`;
        canvas.style.width = `${half * 2}px`;
        canvas.style.height = `${half * 2}px`;
        field?.setParams({
          center: [half, half],
          radius,
          worldOrigin: [centerX - half, centerY - half],
        });
      };

      fit();
      const observer = new ResizeObserver(fit);
      observer.observe(host);

      const tick = () => {
        if (document.hidden) return;
        field?.setParams({
          dopplerAngle: REDSHIFT_START_ANGLE + (gsap.ticker.time / REDSHIFT_DURATION) * TAU,
        });
      };

      if (!reducedMotion) gsap.ticker.add(tick);

      return () => {
        cancelAnimationFrame(reveal);
        observer.disconnect();
        themeObserver.disconnect();
        gsap.ticker.remove(tick);
        field?.destroy();
      };
    },
    { scope: root }
  );

  return (
    <div
      className='tcnf-scene'
      ref={root}
      role='img'
      aria-label='A luminous event horizon bends a field of gravitational lines'
    >
      {/* server-rendered stand-in at the fit formula's resolved
          geometry, so the hole never pops into an empty band */}
      <div className='tcnf-hole-placeholder' aria-hidden='true' />
      <canvas className='tcnf-canvas' ref={canvasRef} aria-hidden='true' />
    </div>
  );
}
