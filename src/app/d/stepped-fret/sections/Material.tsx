'use client';

import { useRef } from 'react';
import type { CSSProperties } from 'react';

import { DOCS_HREF, GREETINGS, LOCALE_COUNT, LOCALE_ROWS, LOCALE_TAIL } from '../data';
import { useRise } from '../reveal';
import Chip from './Chip';
import FretBand from './deco/FretBand';
import Globe from './Globe';
import Register from './deco/Register';

/** The meander runs one fret unit per cell; at 10px cells a cell is 130px wide. */
const MEANDER_CELL = 10;

/**
 * Languages as material. A long meander runs the width of the register,
 * one fret unit over every cell, and each cell below it holds a greeting in
 * its own script with the language named in itself and its flag chip. The
 * strip scrolls inside its own box on narrow screens. Under it, the atlas:
 * the variants that matter as stepped rows, the long tail, the count, and
 * the halftone globe.
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

        <div className='sf-meander' data-rise>
          <div className='sf-meander-scroll'>
            <div className='sf-meander-track' style={{ '--cells': GREETINGS.length, '--mc': `${MEANDER_CELL}px` } as CSSProperties}>
              <FretBand cell={MEANDER_CELL} tone='ornament' edges='bottom' className='sf-meander-band' />
              <ul className='sf-mcells'>
                {GREETINGS.map((g) => (
                  <li className='sf-mcell' key={g.code}>
                    <span className='sf-mcell-text' lang={g.lang} dir={g.rtl ? 'rtl' : 'ltr'}>
                      {g.text}
                    </span>
                    <span className='sf-mcell-name' lang={g.lang} dir={g.rtl ? 'rtl' : 'ltr'}>
                      {g.name}
                    </span>
                    <Chip code={g.code} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

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
            <a className='sf-btn sf-btn-line sf-btn-sm' href={`${DOCS_HREF}/reference/supported-locales`}>
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
