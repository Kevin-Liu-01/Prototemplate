'use client';

import { useRef } from 'react';

import ExpansionBars from '../diagrams/lang/ExpansionBars';
import SentenceWidth from '../diagrams/lang/SentenceWidth';

import CodeBlock from './code';
import { useQuietReveal } from './reveal';

/**
 * M07 — translation as a layout problem. The section leads with the two
 * measured diagrams (the browser does the measuring, not the designer), then
 * lands the enforcement: the width cap is a prop on the call site, so the
 * fix lives next to the string it protects.
 */

const MAXCHARS = `import { T } from 'gt-next';

export function Cta() {
  return (
    <T $context="homepage CTA button" $maxChars={20}>
      Get started
    </T>
  );
}`;

export default function Measure() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='platform' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Your layout has to survive translation.</h2>
        <p data-reveal>
          Get started is 11 characters in English, 13 in German and 3 in Japanese. Every one of them
          has to fit inside the same button.
        </p>
      </div>

      {/* ---- the two measured diagrams, side by side ---- */}
      <div className='tc-row is-lead'>
        <div className='tc-cell is-tall is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Every locale is a different length</h3>
            <p>
              One button in four languages, measured by the browser rather than estimated. German runs
              long, Japanese runs short, and Arabic re-anchors the whole line.
            </p>
            <div className='tc-lang is-lead'>
              <SentenceWidth title='The same sentence measured in English, German, Japanese and Arabic' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-tall is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Ranked against English</h3>
            <p>A layout that only fits the source string breaks somewhere near the top of this list.</p>
            <div className='tc-lang'>
              <ExpansionBars title='Text expansion by locale, relative to English' />
            </div>
          </div>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- the enforcement: a cap where the string lives ---- */}
      <div className='tc-row is-split'>
        <div className='tc-cell is-tall' data-reveal>
          <h3>Enforced at the call site</h3>
          <p>
            The entry that has to fit is steered from the component that renders it — context for the
            translator, a hard cap for the layout.
          </p>
          <ul className='tc-list'>
            <li>
              <code className='tc-chip'>$maxChars</code> caps the translation where the layout needs it
            </li>
            <li>
              <code className='tc-chip'>$context</code> tells the model what the string is for
            </li>
            <li>
              <code className='tc-chip'>$id</code> and <code className='tc-chip'>$requiresReview</code>{' '}
              steer one entry without touching the rest
            </li>
            <li>Widths measured at render with measureText, not typed</li>
          </ul>
        </div>

        <div className='tc-cell is-panel is-framed' data-reveal>
          <div className='tc-card'>
            <h3>One prop, not a policy document</h3>
            <p>
              <code className='tc-chip'>Jetzt starten</code> is two characters over an 11-character
              button. The cap catches it at translation time, not in production.
            </p>
            <CodeBlock file='components/Cta.tsx' code={MAXCHARS} />
          </div>
        </div>
      </div>
    </section>
  );
}
