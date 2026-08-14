'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import { createGlyphField } from './glyphField';

type GlyphRainProps = {
  className: string;
  canvasClassName: string;
};

export default function GlyphRain({
  className,
  canvasClassName,
}: GlyphRainProps) {
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
