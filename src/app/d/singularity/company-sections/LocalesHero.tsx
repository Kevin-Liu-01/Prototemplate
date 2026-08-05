'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';
import { LOCALES, STATS } from './locales-data';

/**
 * The count is the headline. Every figure in the stat band is derived from
 * the same 120 rows the ledger prints — nothing here is typed in by hand.
 */

const ARABIC_RTL = LOCALES.filter((r) => r.dir === 'rtl' && r.script === 'Arab').length;
const HEBREW_RTL = LOCALES.filter((r) => r.dir === 'rtl' && r.script === 'Hebr').length;

export default function LocalesHero() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='cp-hero'>
        <span className='cp-kicker' data-reveal>
          Supported locales
        </span>
        <h1 data-reveal>{STATS.locales} locales, ready today.</h1>
        <p data-reveal>
          Every language and regional variant supported by General Translation, printed in
          full &mdash; the same list the SDKs, the CLI, and the edge serve from, row for row.
        </p>
        <div className='cp-colophon' data-reveal>
          <span>@generaltranslation/supported-locales &middot; listSupportedLocales()</span>
        </div>
      </div>

      <div className='cpl-stats' data-reveal>
        <div className='cpl-stat'>
          <span className='cpl-stat-n'>{STATS.locales}</span>
          <span className='cpl-stat-l'>locales</span>
          <span className='cpl-stat-s'>every code the API serves</span>
        </div>
        <div className='cpl-stat'>
          <span className='cpl-stat-n'>{STATS.languages}</span>
          <span className='cpl-stat-l'>languages</span>
          <span className='cpl-stat-s'>{STATS.regionalVariants} regional variants among them</span>
        </div>
        <div className='cpl-stat'>
          <span className='cpl-stat-n'>{STATS.scripts}</span>
          <span className='cpl-stat-l'>writing systems</span>
          <span className='cpl-stat-s'>Latin to Telugu</span>
        </div>
        <div className='cpl-stat'>
          <span className='cpl-stat-n'>{STATS.rtl}</span>
          <span className='cpl-stat-l'>right-to-left</span>
          <span className='cpl-stat-s'>
            Arabic script &times;{ARABIC_RTL} &middot; Hebrew &times;{HEBREW_RTL}
          </span>
        </div>
      </div>
    </section>
  );
}
