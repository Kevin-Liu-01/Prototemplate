'use client';

/**
 * The great hall: the Apadana's 6 by 6 column field, twenty-five bays.
 * Twenty-four hold one locale each, the endonym set as the script sample
 * with its lang and dir, the English name, and the flag chip; the two
 * script variants of Chinese flank the center so the tell reads across the
 * axis. The center bay is the halftone globe with the source chip. Under
 * the hall, the variants register expands four languages into their
 * regional tags, then the tail line and the count line (A7).
 */
import { globe } from '@/lib/dither';

import { COUNT_LINE, HALL_ROWS, LOCALES_URL, VARIANT_ROWS } from '../data';
import { GLOBE_SPIN, useDither } from '../fields';
import { Rosette } from './deco/Rosette';
import { Bay, Hall, Row } from './deco/Hall';
import { LocaleChip } from './LocaleChip';

export function GreatHall() {
  const orb = useDither(
    (aspect) =>
      globe({
        aspect,
        radius: 0.42,
        graticule: 0.3,
        meridians: 12,
        parallels: 7,
        spin: GLOBE_SPIN,
        landmass: 0.2,
        ambient: 0.1,
      }),
    { scale: 3, fps: 20 }
  );

  return (
    <section className='apg-hall is-great' id='languages' aria-labelledby='apg-great-h'>
      <div className='apg-thresh'>
        <Rosette />
        <h2 id='apg-great-h'>100+ languages, and the variants that matter</h2>
        <p>zh-Hant is not zh-Hans. Both ship.</p>
      </div>

      <Hall cols={5} base={56} className='is-great'>
        {HALL_ROWS.map((row, r) => (
          <Row key={r}>
            {row.map((cell, c) =>
              cell ? (
                <Bay
                  key={cell.code}
                  className={cell.tell ? 'is-locale is-tell' : 'is-locale'}
                  lang={cell.lang}
                  dir={cell.dir}
                >
                  <p className='apg-script'>{cell.native}</p>
                  <span className='apg-locale-name' lang='en' dir='ltr'>
                    {cell.name}
                  </span>
                  <LocaleChip code={cell.code} tell={cell.tell} className='is-seat' />
                </Bay>
              ) : (
                <Bay key={`globe-${r}-${c}`} className='is-globe'>
                  <canvas
                    ref={orb}
                    className='apg-globe'
                    role='img'
                    aria-label='A halftone globe at the center of the hall, the source locale'
                  />
                  <LocaleChip code='en' source className='is-seat' />
                </Bay>
              )
            )}
          </Row>
        ))}
      </Hall>

      <div className='apg-register' aria-label='Regional variants'>
        <div className='apg-reg-rows'>
          {VARIANT_ROWS.map((row) => (
            <div className='apg-reg-row' key={row.tag}>
              <span className='apg-reg-lead'>
                <LocaleChip code={row.tag} />
                <span className='apg-reg-name'>{row.name}</span>
              </span>
              <span className='apg-reg-variants'>
                {row.variants.map((variant) => (
                  <LocaleChip
                    key={variant}
                    code={variant}
                    tell={variant === 'zh-Hans' || variant === 'zh-Hant'}
                  />
                ))}
              </span>
            </div>
          ))}
          <div className='apg-reg-row is-tail'>
            <span className='apg-reg-lead'>
              <span className='apg-reg-name'>Also</span>
            </span>
            <span className='apg-reg-variants'>
              <LocaleChip code='cnr' />
              <span className='apg-reg-note'>Montenegrin</span>
              <LocaleChip code='cy' />
              <span className='apg-reg-note'>Welsh</span>
            </span>
          </div>
        </div>
        <div className='apg-reg-foot'>
          <span className='apg-count'>{COUNT_LINE}</span>
          <a className='apg-btn is-line is-sm' href={LOCALES_URL}>
            Browse All Supported Locales
          </a>
        </div>
      </div>
    </section>
  );
}
