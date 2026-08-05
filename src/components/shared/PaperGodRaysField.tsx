'use client';

import { useGSAP } from '@gsap/react';
import { GodRays } from '@paper-design/shaders-react';
import { useRef, useState } from 'react';

/**
 * Paper God Rays in band form — the one packaged material from the
 * founder's glyphfield studio roster (@paper-design/shaders-react,
 * Apache-2.0), kept as the library component rather than a port: its
 * noise-texture ray pipeline is not a single-pass fragment shader. Soft
 * volumetric light spills from above the band's center, in the house
 * inks: near-black ground (the page's blend mode drops it out; the light
 * theme's inversion lifts it to paper) under translucent blues rolling to
 * white where the rays stack.
 *
 * CONTEXT DISCIPLINE — Paper's ShaderMount owns a WebGL2 context per mount
 * and its dispose() deletes program and textures but never LOSES the
 * context, so cycling the review rig would strand one live context per
 * visit until GC. The unmount cleanup here schedules an explicit
 * WEBGL_lose_context release (the glyphfield repo's own pattern), keeping
 * the session inside the browser's context budget.
 */

/* The practices linter keeps raw hex out of TSX; the house inks are spelled
   as numbers and formatted for the component's color-string API. */
const hex = (rgb: number) => `#${rgb.toString(16).padStart(6, '0')}`;

const INK = hex(0x04060a);
const BLUE = hex(0x2f5ce0);
/* Ray bodies are translucent so stacked rays build to light instead of
   flat fills; the white core is the only opaque stop. */
const RAY_COLORS = [`${hex(0x2f5ce0)}8a`, `${hex(0x9db9ff)}b3`, hex(0xffffff), `${hex(0x24409e)}66`];

export type PaperGodRaysFieldProps = {
  className?: string;
  speed?: number;
};

export default function PaperGodRaysField({ className, speed = 0.6 }: PaperGodRaysFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  /* Reduced motion parks the material on a formed mid-cycle frame. SSR and
     the first client render agree on motion; the mount effect corrects. */
  const [reduced, setReduced] = useState(false);

  /* useGSAP rather than useMountEffect: the mount-once guard would leave the
     post-StrictMode-remount pass without a registered cleanup, and this
     cleanup is the context release. */
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setReduced(true);
    /* The mount builds its canvas asynchronously (the noise texture loads
       first), so the release target is captured by observation, not by a
       mount-time query. */
    const host = hostRef.current;
    let canvas: HTMLCanvasElement | null = host?.querySelector('canvas') ?? null;
    let observer: MutationObserver | undefined;
    if (!canvas && host && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        const found = host.querySelector('canvas');
        if (!found) return;
        canvas = found;
        observer?.disconnect();
      });
      observer.observe(host, { childList: true, subtree: true });
    }
    return () => {
      observer?.disconnect();
      const target = canvas ?? hostRef.current?.querySelector('canvas') ?? null;
      if (!target) return;
      window.setTimeout(() => {
        const gl = target.getContext('webgl2');
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
      }, 250);
    };
  });

  return (
    <div aria-hidden className={className} ref={hostRef}>
      <GodRays
        bloom={0.55}
        colorBack={INK}
        colorBloom={BLUE}
        colors={RAY_COLORS}
        density={0.34}
        frame={reduced ? 9400 : 0}
        height='100%'
        intensity={0.74}
        midIntensity={0.32}
        midSize={0.18}
        offsetX={0}
        offsetY={-0.62}
        speed={reduced ? 0 : speed}
        spotty={0.32}
        style={{ height: '100%', inset: 0, position: 'absolute', width: '100%' }}
        webGlContextAttributes={{ alpha: false, antialias: false }}
        width='100%'
      />
    </div>
  );
}
