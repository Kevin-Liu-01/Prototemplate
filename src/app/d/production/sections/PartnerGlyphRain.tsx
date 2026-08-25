'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { createGlyphField } from '@/lib/glyph-field';

gsap.registerPlugin(useGSAP);

type PartnerGlyphRainProps = {
  className: string;
  canvasClassName: string;
};

/**
 * GlyphRain, reproduced.
 *
 * 1-1 with apps/landing/src/components/landing/shared/GlyphRain.tsx: the
 * standalone plate configuration of the shared glyph field — copy 'none'
 * (no copy clearing, full-bleed rain, the condensed word centred), the
 * rising drift, glyphs at 0.9 of the library's rain sizes — with the display
 * and mono faces read off the host so the canvas type matches the page's.
 * The shipped page mounts this in two places, and both are on this control:
 * the yc benefit band's right column and the mintlify close band's.
 */
export default function PartnerGlyphRain({
  className,
  canvasClassName,
}: PartnerGlyphRainProps) {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      const canvas = canvasRef.current;
      if (!host || !canvas) return;

      const styles = getComputedStyle(host);
      const field = createGlyphField({
        canvas,
        copy: 'none',
        drift: 'rise',
        glyphScale: 0.9,
        displayFamily: styles.fontFamily,
        monoFamily: styles.getPropertyValue('--tc-mono').trim() || undefined,
      });

      return () => field?.destroy();
    },
    { scope: root }
  );

  return (
    <div className={className} ref={root} aria-hidden='true'>
      <canvas className={canvasClassName} ref={canvasRef} />
    </div>
  );
}
