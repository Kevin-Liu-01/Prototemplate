'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { createGlyphField } from '@/lib/glyph-field';

gsap.registerPlugin(useGSAP);

/**
 * The close band's glyph field, carried over from the shipped page's
 * GlyphRain (apps/landing/src/components/landing/shared/GlyphRain.tsx) with
 * its four arguments unchanged: copy 'none' (a standalone plate — no copy
 * clearing, full-bleed rain, the formed word centred), the rising drift,
 * glyphScale 0.9, and the host's own resolved faces so the canvas type
 * matches the page's. The shipped component reads the same library this app
 * carries at src/lib/glyph-field.ts.
 */
export default function CareersGlyphRain() {
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
    <div className='prc-glyph-scene' ref={root} aria-hidden='true'>
      <canvas className='prc-glyph-canvas' ref={canvasRef} />
    </div>
  );
}
