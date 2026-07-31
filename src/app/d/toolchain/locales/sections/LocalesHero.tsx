'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../sections/reveal';
import { LOCALES, STATS } from '../data';

/**
 * The count is the headline. Every figure in the band below is derived from
 * the same 120 rows the ledger prints — nothing here is typed in by hand.
 */

const ARABIC_RTL = LOCALES.filter(
  (r) => r.dir === 'rtl' && r.script === 'Arab'
).length;
const HEBREW_RTL = LOCALES.filter(
  (r) => r.dir === 'rtl' && r.script === 'Hebr'
).length;

export default function LocalesHero() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='locales' ref={root}>
      <div className='lcl-hero'>
        <h1 data-reveal>
          <em>{STATS.locales} locales</em>, ready today.
        </h1>
        <p data-reveal>
          Every language and regional variant supported by General Translation,
          printed in full — the same list the SDKs, the CLI, and the edge serve
          from, row for row.
        </p>
        <p className='lcl-src' data-reveal>
          @generaltranslation/supported-locales · listSupportedLocales()
        </p>
      </div>

      <div className='lcl-stats' data-reveal>
        <div className='lcl-stat'>
          <span className='lcl-stat-n'>{STATS.locales}</span>
          <span className='lcl-stat-l'>locales</span>
          <span className='lcl-stat-s'>every code the API serves</span>
        </div>
        <div className='lcl-stat'>
          <span className='lcl-stat-n'>{STATS.languages}</span>
          <span className='lcl-stat-l'>languages</span>
          <span className='lcl-stat-s'>
            {STATS.regionalVariants} regional variants among them
          </span>
        </div>
        <div className='lcl-stat'>
          <span className='lcl-stat-n'>{STATS.scripts}</span>
          <span className='lcl-stat-l'>writing systems</span>
          <span className='lcl-stat-s'>Latin to Telugu</span>
        </div>
        <div className='lcl-stat'>
          <span className='lcl-stat-n'>{STATS.rtl}</span>
          <span className='lcl-stat-l'>right-to-left</span>
          <span className='lcl-stat-s'>
            Arabic script ×{ARABIC_RTL} · Hebrew ×{HEBREW_RTL}
          </span>
        </div>
      </div>
    </section>
  );
}
