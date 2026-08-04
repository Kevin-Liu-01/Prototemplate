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
 * it, and the real Theo post as a dark quote card underneath. The first
 * claim carries the spec's combined artifact — base languages fanning out
 * into locale-tag chips, plus the word "language" across eight scripts.
 */

type LocaleRow = {
  base: string;
  tags: readonly string[];
  /** The family keeps going past what fits on the strip. */
  more?: boolean;
};

/** 78 base languages expand into 129 locale tags; three families stand for the rest. */
const LOCALE_ROWS: readonly LocaleRow[] = [
  { base: 'zh', tags: ['zh-CN', 'zh-Hans', 'zh-HK'], more: true },
  { base: 'es', tags: ['es-ES', 'es-419'], more: true },
  { base: 'fr', tags: ['fr-FR', 'fr-CA'] },
];

/** The word "language" in eight writing systems, each token tagged with its language. */
const SCRIPT_TOKENS: readonly { lang: string; word: string }[] = [
  { lang: 'ru', word: 'язык' },
  { lang: 'hi', word: 'भाषा' },
  { lang: 'zh', word: '语言' },
  { lang: 'en', word: 'language' },
  { lang: 'el', word: 'γλώσσα' },
  { lang: 'ar', word: 'لغة' },
  { lang: 'th', word: 'ภาษา' },
  { lang: 'ko', word: '언어' },
];

export default function V0Global() {
  return (
    <section className='v0-glob' id='global'>
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

            {/* The spec's two visuals combined into one artifact: base
                languages fanning into locale tags, scripts line beneath. */}
            <div className='v0-glob-locales'>
              {LOCALE_ROWS.map((row) => (
                <div className='v0-glob-locale-row' key={row.base}>
                  <code className='v0-glob-base'>
                    <LocaleTag code={row.base} />
                  </code>
                  <span className='v0-glob-arrow' aria-hidden='true'>
                    →
                  </span>
                  <span className='v0-glob-tags'>
                    {row.tags.map((tag) => (
                      <code className='v0-glob-tag' key={tag}>
                        {tag}
                      </code>
                    ))}
                    {row.more ? (
                      <span className='v0-glob-more' aria-hidden='true'>
                        …
                      </span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>

            <p className='v0-glob-scripts'>
              {SCRIPT_TOKENS.map((token, i) => (
                <Fragment key={token.lang}>
                  {i > 0 ? (
                    <span className='v0-glob-scripts-dot' aria-hidden='true'>
                      ·
                    </span>
                  ) : null}
                  <span lang={token.lang}>{token.word}</span>
                </Fragment>
              ))}
            </p>
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

      {/* The real post, verbatim — do not edit a word of the quote. */}
      <figure className='v0-glob-quote'>
        <blockquote>
          Every once in awhile, I see a snippet of code that makes me a bit emotional. Now
          is one of those moments. Internationalization went from “$%!# this” to “trivial”.
        </blockquote>
        <figcaption>
          <span className='v0-glob-quote-who'>
            <b>Theo</b>
            <span>CEO, T3Chat</span>
          </span>
          {/* TODO: replace with the exact status URL of the post */}
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
