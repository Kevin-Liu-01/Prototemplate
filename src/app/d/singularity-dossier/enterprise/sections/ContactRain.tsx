'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import {
  createInkField,
  type InkFieldHandle,
} from './inkField';

/**
 * The contact sheet's rain: the hero column's material re-mounted on
 * the form column. The field runs that column's strip for the sheet's
 * full height, and the framed panel is its measured clearing — glyphs
 * live only in the slivers above and below the box, between its frame
 * verticals, never through it. Band gates; scenery. Its ink is the
 * host's CSS color, sampled per theme and re-inked on the flip.
 */
export default function ContactRain() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const host = rootRef.current;
    const canvas = canvasRef.current;
    const wrap = host?.parentElement;
    if (!host || !canvas || !wrap) return;
    const panel = wrap.querySelector<HTMLElement>('.contact-form-panel');
    if (!panel) return;

    const style = getComputedStyle(canvas);
    const field: InkFieldHandle | null = createInkField({
      canvas,
      clearEl: panel,
      displayFamily: style.fontFamily,
      glyphColor: style.color,
      minWidth: 340,
      dprCap: 1.5,
      fpsCap: 30,
      /* the clearing eats the middle of this strip — a denser pool
         keeps the slivers alive */
      pool: 760,
    });
    if (!field) return;

    /* the canvas rides the panel's x-strip, the wrap's full height */
    const fit = () => {
      const w = wrap.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      canvas.style.left = `${p.left - w.left}px`;
      canvas.style.width = `${p.width}px`;
      canvas.style.height = `${w.height}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    ro.observe(panel);

    const doc = document.documentElement;
    const theme = new MutationObserver(() =>
      field.setGlyphColor(getComputedStyle(canvas).color)
    );
    theme.observe(doc, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      ro.disconnect();
      theme.disconnect();
      field.destroy();
    };
  }, []);

  return (
    <div className='tce-contact-rain' ref={rootRef} aria-hidden='true'>
      <canvas ref={canvasRef} />
    </div>
  );
}
