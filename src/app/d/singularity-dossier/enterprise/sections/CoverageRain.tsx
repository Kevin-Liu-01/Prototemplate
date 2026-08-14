'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import {
  createInkField,
  type InkFieldHandle,
} from './inkField';

/**
 * The coverage stage's weather: the ink field floods the full stage
 * and keeps clear of the frameworks core — rain lives in the strips
 * above and below the row, dithered at the rim, never through it.
 * Band gates; scenery. Ink sampled from the host's CSS color per
 * theme, re-inked on the flip.
 */
export default function CoverageRain() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const host = rootRef.current;
    const canvas = canvasRef.current;
    const stage = host?.parentElement;
    if (!host || !canvas || !stage) return;
    const core = stage.querySelector<HTMLElement>('.tcf-core');
    if (!core) return;

    const style = getComputedStyle(canvas);
    const field: InkFieldHandle | null = createInkField({
      canvas,
      clearEl: core,
      displayFamily: style.fontFamily,
      glyphColor: style.color,
      minWidth: 340,
      dprCap: 1.5,
      fpsCap: 30,
      pool: 700,
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

  return (
    <div className='tcf-rain' ref={rootRef} aria-hidden='true'>
      <canvas ref={canvasRef} />
    </div>
  );
}
