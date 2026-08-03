'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { createGlyphField, type GlyphFieldHandle } from '@/lib/glyph-field';

gsap.registerPlugin(useGSAP);

/**
 * The manifesto: the word-swarm prints "language" in script after script
 * above one sentence of intent. The same condensation engine as the
 * contact bay, given the whole column and the page's own ink — on light
 * paper the swarm is ink-dark, in dark mode it re-inks itself.
 */
export default function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      let field: GlyphFieldHandle | null = null;
      if (canvas) {
        field = createGlyphField({
          canvas,
          displayFamily: getComputedStyle(canvas).getPropertyValue('--tc-disp').trim() || undefined,
        });
      }
      return () => {
        field?.destroy();
      };
    },
    { scope: root }
  );

  return (
    <section className='sgp-manifesto' aria-label='The manifesto' ref={root}>
      <div className='sgp-manifesto-field'>
        <canvas ref={canvasRef} aria-hidden />
      </div>
      <div className='sgp-manifesto-copy'>
        <h2>Language is not a feature. It is the market.</h2>
        <p>
          Every enterprise below started with one locale and a backlog. Each one now ships
          everywhere, on every merge, through the same machine you just scrolled past.
        </p>
      </div>
    </section>
  );
}
