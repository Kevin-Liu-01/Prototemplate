'use client';

import { Languages } from 'lucide-react';
import { useRef } from 'react';

/* EdgeGlobe and LocaleRouting were stale snapshots of toolchain's — the
   imports point at the source of truth now (v2 globe, LocaleTag chips ride
   along). The lang family stays fork-local: its lang.css carries this
   fork's larger diagram sizes. */
import EdgeGlobe from '@/app/d/toolchain/diagrams/EdgeGlobe';
import LocaleRouting from '@/app/d/toolchain/diagrams/LocaleRouting';

import ContextResolve from '../diagrams/lang/ContextResolve';
import LocaleVariants from '../diagrams/lang/LocaleVariants';
import ScriptSampler from '../diagrams/lang/ScriptSampler';
import WordMorph from '../diagrams/lang/WordMorph';

import { useQuietReveal } from './reveal';

/**
 * M13 — the locales section. "100+ languages" is converted into a technical
 * claim twice over: the script field shows the writing systems the browser
 * has to shape, and the variants table opens four base languages into the
 * regional tags that naive tools flatten. The globe closes the loop — the
 * same tags, served from the edge.
 */
export default function Scripts() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='locales' ref={root}>
      <div className='tc-head'>
        <Languages className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>100+ languages, and the variants that matter.</h2>
        <p data-reveal>
          zh-Hant is not zh-Hans. Both ship — 78 base languages expand into 129 distinct locale tags,
          canonicalized by the platform.
        </p>
      </div>

      {/* ---- writing systems beside the variant table ---- */}
      <div className='tc-row is-tilt'>
        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Every writing system</h3>
            <p>
              Latin, Cyrillic, Greek, Arabic, Devanagari, Han, Hangul, Thai — joined, stacked and
              bidi-resolved by the browser, with per-script fallbacks in the SDK.
            </p>
            <div className='tc-lang is-night'>
              <ScriptSampler title='The word “language” in eight writing systems' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-framed' data-reveal>
          <div className='tc-card'>
            <h3>One language is many locales</h3>
            <p>
              Every tag below is production-ready, verbatim from the platform&rsquo;s supported-locales
              list. The regional variants are where naive tools flatten.
            </p>
            <div className='tc-lang'>
              <LocaleVariants title='Arabic, Chinese, Spanish and French expanded into their real regional variants' />
            </div>
          </div>
        </div>
      </div>

      {/* ---- the same tags, resolved and served ---- */}
      <div className='tc-row is-three'>
        <div className='tc-cell is-short is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Context</h3>
            <p>One word, two meanings. A context tag decides which translation ships.</p>
            <div className='tc-lang'>
              <ContextResolve title='Save resolving to speichern or sparen by context' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-short is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Terminology</h3>
            <p>
              One term, six locales, decided once. Per-locale style rules keep the wording identical
              everywhere it appears.
            </p>
            <div className='tc-lang'>
              <WordMorph title='The term Settings printed in six locales' />
            </div>
          </div>
        </div>

        <div className='tc-cell is-short is-framed' data-reveal>
          <div className='tc-card'>
            <h3>Routing</h3>
            <p>Automatic detection and locale-based routing, on SEO-friendly paths you never configure.</p>
            <div className='tc-surface is-plated'>
              <LocaleRouting title='The same page routed for all six configured locales, /fr/a-propos localized, with the detection order beneath' />
            </div>
          </div>
        </div>
      </div>

      <div className='tc-hatch' aria-hidden='true' />

      {/* ---- delivery: the night cell ---- */}
      <div className='tc-row is-wide-right is-reverse'>
        <div className='tc-cell is-tall is-framed is-night' data-reveal>
          <div className='tc-card'>
            <div className='tc-art-center'>
              <div className='tc-art-globe'>
                <EdgeGlobe title='A meridian cage with three points of presence and one serving 12 ms away' />
              </div>
            </div>
            <p className='tc-night-note'>5 points of presence shown · anycast · versioned per locale</p>
          </div>
        </div>

        <div className='tc-cell is-tall' data-reveal>
          <h3>Delivery</h3>
          <p>
            A global, low-latency translation CDN. Push over-the-air updates without redeploying your
            app.
          </p>
          <ul className='tc-list'>
            <li>Fix a translation and ship it without touching your build</li>
            <li>Served from the edge, close to whoever asked for it</li>
            <li>Versioned per locale, so a rollback is one step</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
