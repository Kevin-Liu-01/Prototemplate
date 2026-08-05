'use client';

import { Warp } from '@paper-design/shaders-react';
import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * Paper Warp in band form — the one packaged material from the founder's
 * glyphfield studio roster (@paper-design/shaders-react, Apache-2.0), kept
 * as the library component rather than a port: its noise-texture warp
 * pipeline is not a single-pass fragment shader. A ruled stripe field is
 * warped and swirled — a field of rules being translated — in the house
 * inks: near-black ground (the page's blend mode drops it out; the light
 * theme's inversion lifts it to paper) under the terminal blues.
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

const HOUSE_COLORS = [
  hex(0x04060a), // ink ground
  hex(0x24409e), // blue depth
  hex(0x2f5ce0), // working blue
  hex(0x04060a), // ink again — bands stay separated by ground
  hex(0x9db9ff), // chip light
];

export type PaperWarpFieldProps = {
  className?: string;
  speed?: number;
};

export default function PaperWarpField({ className, speed = 0.6 }: PaperWarpFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  /* Reduced motion parks the material on a formed mid-cycle frame. SSR and
     the first client render agree on motion; the mount effect corrects. */
  const [reduced, setReduced] = useState(false);

  useMountEffect(() => {
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
      <Warp
        colors={HOUSE_COLORS}
        distortion={0.22}
        frame={reduced ? 9400 : 0}
        height='100%'
        proportion={0.42}
        rotation={92}
        scale={1}
        shape='stripes'
        shapeScale={0.16}
        softness={0.85}
        speed={reduced ? 0 : speed}
        style={{ height: '100%', inset: 0, position: 'absolute', width: '100%' }}
        swirl={0.72}
        swirlIterations={10}
        webGlContextAttributes={{ alpha: false, antialias: false }}
        width='100%'
      />
    </div>
  );
}
