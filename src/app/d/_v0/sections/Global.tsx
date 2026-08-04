import { ArrowUpRight } from 'lucide-react';
import { Fragment } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import EdgeGlobe from '@/app/d/toolchain/diagrams/EdgeGlobe';

import './global.css';

/**
 * V0Global — "Ship to the world."
 *
 * The global/enterprise beat of the v0 landing: the EdgeGlobe delivery
 * drawing on a permanently-dark plate, a ruled rail of three claims beside
 * it, and the real Theo post as a compact dark card underneath. The first
 * claim carries the spec's combined locale artifact: a ruled panel where a
 * base tag fans into its regional variants while every row speaks the
 * language's own script.
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
  return (
    <section className='v0-glob' id='infrastructure'>
      <header className='v0-glob-head'>
        <h2>Ship to the world.</h2>
        <p>GT is deployed in production apps with millions of global users</p>
      </header>

      <div className='v0-glob-grid'>
        {/* The delivery network as the section's object: the orthographic
            globe on the section's one permanently-dark plate. */}
        <figure className='v0-glob-plate'>
          <div className='v0-glob-art'>
            <EdgeGlobe title='A wireframe globe with five points of presence, the nearest serving a translation 12 ms away' />
          </div>
        </figure>

        <div className='v0-glob-rail'>
          <article className='v0-glob-item'>
            <h3>120+ languages, in every writing system.</h3>
            <p>
              zh is distinct from zh-HK. GT covers every regional variant, with 78 base
              languages that expand into 129 distinct locale tags.
            </p>

            {/* The combined artifact: one ruled panel that explains locale
                codes AND shows scripts — base tags fan into regional
                variants, every row in the language's own writing system. */}
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
      </div>

      {/* The real post, verbatim — do not edit a word of the quote. The link
          stays x.com/theo until the exact status URL is supplied. */}
      <figure className='v0-glob-quote'>
        <blockquote>
          Every once in awhile, I see a snippet of code that makes me a bit emotional. Now
          is one of those moments. Internationalization went from “$%!# this” to “trivial”.
        </blockquote>
        <figcaption>
          <span className='v0-glob-quote-who'>
            <b>Theo</b>
            <span>CEO, T3 Chat</span>
          </span>
          <a
            className='v0-glob-quote-link'
            href='https://x.com/theo'
            target='_blank'
            rel='noreferrer'
          >
            View the post
            <ArrowUpRight aria-hidden='true' />
          </a>
        </figcaption>
      </figure>
    </section>
  );
}
