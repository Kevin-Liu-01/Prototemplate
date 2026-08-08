'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { createGlyphField } from '@/lib/glyph-field';

import './deploy.css';

gsap.registerPlugin(useGSAP);

/**
 * V0 closing band — "Deploy today." recomposed around the glyph-rain hero's
 * condensation field (founder note): the copy block stands LEFT, and the
 * RIGHT side is the field itself — glyphs from eight scripts drifting in
 * depth, condensing into the word "language" in one script after another
 * (createGlyphField with the rising drift: the band launches its glyphs
 * upward, the closing counterpart to the hero's fall). ONE canvas spans
 * the rail column: the engine's own dithered
 * copy-clearing keeps the left zone quiet for the type, so no mask and no
 * second ambient field ever fight it. The band is permanently dark, so the
 * canvas pins --tc-ink to the white ramp (deploy.css) and both themes render
 * the same plate. prefers-reduced-motion gets one printed still, inside the
 * library. Two-part copy only (display + sub) — no eyebrow, no mono, no
 * uppercase tracking per house rules.
 */
export default function Deploy() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      const canvas = stage.current;
      if (!rootEl || !canvas) return;

      /* The field draws with the band's own faces, resolved off the DOM —
         the same wiring the glyph-rain hero uses. rAF, resize, theme
         re-inking and the reduced-motion still are internal to the library;
         destroy() on unmount is ours. */
      const h2 = rootEl.querySelector('h2');
      /* the narrow fold's quiet zone anchors to the copy block's REAL
         bottom (offset metrics — same box the canvas fills), so a
         deep-wrapping locale can never push the CTAs into the rain */
      const copyEl = rootEl.querySelector<HTMLElement>('.v0-dep-copy');
      const field = createGlyphField({
        canvas,
        drift: 'rise',
        displayFamily: h2 ? getComputedStyle(h2).fontFamily : undefined,
        monoFamily: getComputedStyle(rootEl).getPropertyValue('--tc-mono').trim() || undefined,
        copyBottom: copyEl
          ? () => copyEl.offsetTop + copyEl.offsetHeight
          : undefined,
      });

      return () => field?.destroy();
    },
    { scope: root }
  );

  return (
    <section className='v0-dep' id='deploy' ref={root}>
      <div className='v0-dep-in'>
        {/* inside the rails, so the formed word is never struck by them */}
        <canvas className='v0-dep-field' ref={stage} aria-hidden='true' />
        <div className='v0-dep-copy'>
          <h2>Deploy today</h2>
          <p className='v0-dep-sub'>
            Join the world’s best developer teams on General Translation.
          </p>
          <div className='v0-dep-acts'>
            {/* the hero's rainbow ring, verbatim grammar (founder: same
                effects as the Get started at the very top) */}
            <span className='v0-dep-cta'>
              <a className='v0-dep-btn v0-dep-btn-solid' href='#pricing'>
                Get started
              </a>
            </span>
            <a className='v0-dep-btn v0-dep-btn-line' href='#contact'>
              Get a demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
