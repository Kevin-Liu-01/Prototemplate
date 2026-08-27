'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { createGlyphField } from '@/lib/glyph-field';

import './deploy.css';

gsap.registerPlugin(useGSAP);

/* The closing band's CTA targets, as the shipped page resolves them for
   en-US: Get Started goes to the localized dashboard sign-in
   (getDashboardSignInHref('en-US') against the deployed dashboard host),
   and Get a Demo goes to the enterprise contact page. This concept has no
   /enterprise/contact route of its own, so the demo funnel keeps the real
   absolute URL rather than a concept-relative dead end. */
const DEPLOY_CTAS = {
  getStarted: 'https://dash.generaltranslation.com/en-US/signin',
  demo: 'https://generaltranslation.com/enterprise/contact',
} as const;

/**
 * The closing band — "Deploy today" beside a glyph condensation field: the
 * copy block stands LEFT, and the RIGHT side is the field itself — glyphs
 * from eight scripts drifting in depth, condensing into the word "language"
 * in one script after another (createGlyphField with the rising drift: the
 * band launches its glyphs upward, the closing counterpart to the hero's
 * fall). ONE canvas spans the rail column: the engine's own dithered
 * copy-clearing keeps the left zone quiet for the type, so no mask and no
 * second ambient field ever fight it. deploy.css keys the plate per theme
 * and pins --tc-ink on the canvas — the engine resolves its ink off that
 * token. prefers-reduced-motion gets one printed still, inside the library.
 * Two-part copy only (display + sub) — no eyebrow, no mono, no uppercase
 * tracking.
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
            Join the world’s best developer teams on General Translation
          </p>
          <div className='v0-dep-acts'>
            {/* the rainbow-ring CTA — the same ring grammar as the hero's
                Get started */}
            <span className='v0-dep-cta'>
              <a
                className='v0-dep-btn v0-dep-btn-solid'
                href={DEPLOY_CTAS.getStarted}
              >
                Get Started
              </a>
            </span>
            {/* the demo funnel's one instrumented click on the real page
                (TrackedLink, posthog cta_clicked, location landing-cta) —
                here it is the plain link to the same destination */}
            <a className='v0-dep-btn v0-dep-btn-line' href={DEPLOY_CTAS.demo}>
              Get a Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
