'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import {
  createInkField,
  type InkFieldHandle,
} from './inkField';

/**
 * The hero band's rain, contained: the ink-field material — the
 * eight-script inventory rising in its set 34px columns — floods the
 * proof COLUMN only, the zone the two top-down frame verticals define.
 * The canvas mounts inside the framed cell and the solid proof card
 * paints over it, so glyphs live in the column's slivers and never
 * show through the box. Band gates otherwise: 1.5x device-pixel
 * ceiling, 30fps drift, parked when the column collapses. Its ink is
 * the canvas's CSS color, sampled per theme and re-inked on the flip.
 * Scenery — bands never set interactive.
 */
export default function HeroInkField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const style = getComputedStyle(canvas);
    const field: InkFieldHandle | null = createInkField({
      canvas,
      clearing: 'none',
      displayFamily: style.fontFamily,
      glyphColor: style.color,
      minWidth: 340,
      dprCap: 1.5,
      fpsCap: 30,
    });
    if (!field) return;

    const doc = document.documentElement;
    const theme = new MutationObserver(() =>
      field.setGlyphColor(getComputedStyle(canvas).color)
    );
    theme.observe(doc, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      theme.disconnect();
      field.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className='tce-hero-field' aria-hidden />;
}
