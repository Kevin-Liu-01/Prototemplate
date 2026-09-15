'use client';

import { useRef } from 'react';
import type { CSSProperties } from 'react';

import { GREETINGS, LOCALE_COUNT, LOCALE_ROWS, LOCALE_TAIL, SUPPORTED_LOCALES_HREF } from '../data';
import { useRise } from '../reveal';
import Chip from './Chip';
import Globe from './Globe';
import Register from './deco/Register';

/**
 * Languages as material. One long meander runs across the register in
 * courses: a crenellated fret one band cell thick in the ornament color,
 * whose walls stand between every pair of cells and whose bars alternate
 * top and bottom, so every other pocket hangs from the bar above it and
 * every other stands on the bar below it. Each pocket holds one greeting in
 * its own script with the language named in itself and its flag chip, the
 * source language first. Every wall has one owner: a cell draws its left
 * wall and its top or bottom bar, and the last cell of a course draws the
 * right wall. Under it, the atlas: the variants that matter as stepped
 * rows, the long tail, the count, and the halftone globe.
 */
export default function Material() {
  const root = useRef<HTMLDivElement>(null);
  useRise(root);

  return (
    <Register k={3} id='locales' className='sf-material'>
      <div ref={root} className='sf-material-in'>
        <header className='sf-head'>
          <h2 className='sf-h2' data-rise>
            100+ languages, and the variants that matter
          </h2>
          <p className='sf-lead' data-rise>
            zh-Hant is not zh-Hans. Both ship.
          </p>
        </header>

        <ol className='sf-meander' data-rise aria-label='A greeting in each language of the meander'>
          {GREETINGS.map((g) => (
            <li className='sf-pocket' key={g.code}>
              <span className='sf-pocket-text' lang={g.lang} dir={g.rtl ? 'rtl' : 'ltr'}>
                {g.text}
              </span>
              <span className='sf-pocket-name' lang={g.lang} dir={g.rtl ? 'rtl' : 'ltr'}>
                {g.name}
              </span>
              <Chip code={g.code} />
            </li>
          ))}
        </ol>
        <p className='sf-meander-note' data-rise>
          Every string carries its <code>lang</code>. Arabic and Hebrew carry <code>dir=&quot;rtl&quot;</code> and
          the pocket sets them right to left.
        </p>

        <div className='sf-atlas'>
          <div className='sf-atlas-table' data-rise>
            {LOCALE_ROWS.map((row, i) => (
              <div className='sf-atlas-row' style={{ '--i': i } as CSSProperties} key={row.tag}>
                <span className='sf-atlas-tag'>{row.tag}</span>
                <span className='sf-atlas-name'>{row.name}</span>
                <span className='sf-atlas-variants'>
                  {row.variants.map((variant) => (
                    <code
                      key={variant}
                      className={variant === 'zh-Hans' || variant === 'zh-Hant' ? 'sf-loc is-tell' : 'sf-loc'}
                    >
                      {variant}
                    </code>
                  ))}
                </span>
              </div>
            ))}
            <div className='sf-atlas-row is-tail' style={{ '--i': LOCALE_ROWS.length } as CSSProperties}>
              <span className='sf-atlas-tag' aria-hidden='true' />
              <span className='sf-atlas-name is-muted'>and the long tail</span>
              <span className='sf-atlas-variants is-muted'>
                {LOCALE_TAIL.map((t) => (
                  <span className='sf-atlas-tail' key={t.tag}>
                    <code className='sf-loc'>{t.tag}</code> {t.name}
                  </span>
                ))}
              </span>
            </div>
            <p className='sf-atlas-count'>{LOCALE_COUNT}</p>
            <a className='sf-btn sf-btn-line sf-btn-sm' href={SUPPORTED_LOCALES_HREF}>
              Browse All Supported Locales
            </a>
          </div>

          <figure className='sf-atlas-globe' data-rise>
            <div className='sf-globe-well'>
              <Globe />
            </div>
            <figcaption className='sf-atlas-note'>Every variant negotiated per request · served from the edge</figcaption>
          </figure>
        </div>
      </div>
    </Register>
  );
}
