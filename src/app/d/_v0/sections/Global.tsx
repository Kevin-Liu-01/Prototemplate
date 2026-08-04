'use client';

import { Globe } from 'lucide-react';
import { Fragment, useRef } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import EdgeGlobe from '@/app/d/toolchain/diagrams/EdgeGlobe';
import { useQuietReveal } from '@/app/d/toolchain/sections/reveal';
import { BentoCell } from '@/components/shell/Bento';

import '@/app/d/toolchain/pricing/pricing.css';

import './global.css';

/**
 * V0Global — "Ship to the world."
 *
 * The global/enterprise beat, seated in the shell's own grammar: a tc-head
 * header band, then one is-lead bento row — the EdgeGlobe on toolchain's
 * is-night card (the card IS the dark plate; the row owns the frame) beside
 * a framed cell stacking the three claims as a ruled rail — and the real
 * Theo post as one quiet full-width night cell. Only the artifacts inside
 * the cells (globe mount, locale panel, post type) are v0-styled.
 */

type VariantCell = {
  code: string;
  /** Native name rendered in the UI face — only where the mock shows one. */
  native?: string;
};

type FamilyRow = {
  base: string;
  native: string;
  variants: readonly VariantCell[];
  /** The ar row flips the whole reading direction, not just its label. */
  rtl?: boolean;
};

/** Base languages fanning into regional locale tags, per the mock's rows. */
const FAMILY_ROWS: readonly FamilyRow[] = [
  {
    base: 'zh',
    native: '中文',
    variants: [
      { code: 'zh-HK', native: '中文（香港）' },
      { code: 'zh-TW', native: '中文（台灣）' },
    ],
  },
  {
    base: 'en',
    native: 'English',
    variants: [{ code: 'en-GB' }, { code: 'en-AU' }],
  },
  {
    base: 'ar',
    native: 'العربية',
    variants: [{ code: 'ar-EG' }, { code: 'ar-SA' }],
    rtl: true,
  },
];

/** The script belt: four more writing systems close the panel. */
const SCRIPT_BELT: readonly { code: string; native: string }[] = [
  { code: 'hi', native: 'हिन्दी' },
  { code: 'el', native: 'Ελληνικά' },
  { code: 'he', native: 'עברית' },
  { code: 'ko', native: '한국어' },
];

export default function V0Global() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec v0-glob' id='infrastructure' ref={root}>
      <div className='tc-head'>
        <Globe className='tc-head-icon' strokeWidth={1} aria-hidden />
        <h2 data-reveal>Ship to the world.</h2>
        <p data-reveal>GT is deployed in production apps with millions of global users.</p>
      </div>

      {/* ---- row 1: the globe on its night card, the ruled rail of claims ---- */}
      <div className='tc-row is-lead' data-eq-heads>
        {/* The delivery network as the section's object: the night card is
            the dark plate itself, so the artifact draws no frame of its own —
            the row's mat ground is the one line around it. */}
        <BentoCell cell='is-tall is-framed is-night'>
          <div className='v0-glob-art'>
            <EdgeGlobe title='A wireframe globe with five points of presence, the nearest serving a translation 12 ms away' />
          </div>
        </BentoCell>

        <BentoCell cell='is-tall is-framed'>
          <div className='v0-glob-rail'>
            <article className='v0-glob-item'>
              <h3>120+ languages, in every writing system.</h3>
              <p>
                zh is distinct from zh-HK. GT covers every regional variant, with 78 base
                languages that expand into 129 distinct locale tags.
              </p>

              {/* The combined artifact: base tags fan into regional variants,
                  every row in the language's own writing system. It draws no
                  perimeter — only the single hairlines between its rows. */}
              <div className='v0-glob-locales'>
                {FAMILY_ROWS.map((row) => (
                  <div
                    className='v0-glob-lrow'
                    dir={row.rtl ? 'rtl' : undefined}
                    key={row.base}
                  >
                    <span className='v0-glob-lbase'>
                      <span className='v0-glob-chip'>
                        <LocaleTag code={row.base} />
                      </span>
                      <span className='v0-glob-native is-base' lang={row.base}>
                        {row.native}
                      </span>
                    </span>
                    <span className='v0-glob-larrow' aria-hidden='true'>
                      {row.rtl ? '←' : '→'}
                    </span>
                    <span className='v0-glob-lvars'>
                      {row.variants.map((variant, i) => (
                        <Fragment key={variant.code}>
                          {i > 0 ? (
                            <span className='v0-glob-ldot' aria-hidden='true'>
                              ·
                            </span>
                          ) : null}
                          <span className='v0-glob-lvar'>
                            <code className='v0-glob-chip'>{variant.code}</code>
                            {variant.native ? (
                              <span className='v0-glob-native' lang={variant.code}>
                                {variant.native}
                              </span>
                            ) : null}
                          </span>
                        </Fragment>
                      ))}
                    </span>
                  </div>
                ))}

                <p className='v0-glob-belt'>
                  {SCRIPT_BELT.map((token, i) => (
                    <Fragment key={token.code}>
                      {i > 0 ? (
                        <span className='v0-glob-ldot' aria-hidden='true'>
                          ·
                        </span>
                      ) : null}
                      <span className='v0-glob-lvar'>
                        <span className='v0-glob-chip'>
                          <LocaleTag code={token.code} />
                        </span>
                        <span className='v0-glob-native' lang={token.code}>
                          {token.native}
                        </span>
                      </span>
                    </Fragment>
                  ))}
                </p>
              </div>
            </article>

            <article className='v0-glob-item'>
              <h3>Served from the edge.</h3>
              <p>
                Translations are served from a low-latency CDN, versioned per locale. Fix a
                string or roll it back without touching your code.
              </p>
            </article>

            <article className='v0-glob-item'>
              <h3>Built for the enterprise.</h3>
              <p>
                Enterprise plans include custom FDE hours to build any workflow for your use
                case. Plus SSO, SOC 2 Type II, ISO 27001, and audit logs.
              </p>
            </article>
          </div>
        </BentoCell>
      </div>

      {/* ---- row 2: the OLD proof row, restored — Theo's real quote set
          against the brand's doubled thread (the toolchain pricing
          component's exact figure grammar), with the real status URL. */}
      <div className='tc-row is-one'>
        <div className='tc-cell' data-reveal>
          <figure className='tcp-quote'>
            <blockquote cite='https://x.com/theo/status/2008302190168019187'>
              <p>Every once in awhile, I see a snippet of code that makes me a bit emotional.</p>
              <p>
                Now is one of those moments. Internationalization went from &ldquo;$%!#
                this&rdquo; to &ldquo;trivial&rdquo;.
              </p>
            </blockquote>
            <figcaption>
              <b>Theo</b>
              <span>CEO, T3 Chat</span>
              <a href='https://x.com/theo/status/2008302190168019187' rel='noreferrer' target='_blank'>
                x.com/theo
              </a>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
