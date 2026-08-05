'use client';

import 'flag-icons/css/flag-icons.min.css';

import { useMemo, useRef, useState } from 'react';

import { useQuietReveal } from '../../sections/reveal';
import { LOCALES, STATS, type LocaleRow } from '../data';

/**
 * The monument itself: all 120 rows, ruled. The two threads run the full
 * height of the body between the name column and the endonym column —
 * source and translation, side by side, never merging. A stronger top rule
 * marks where a new language block begins (71 of them), so the ledger
 * carries its own grouping without a single header row. The filter is a
 * view onto the fixed ledger: rows keep their permanent index when it
 * narrows.
 */

/** Permanent row number and language-block lead, computed once. */
const INDEX = new Map<string, number>(LOCALES.map((r, i) => [r.code, i]));
const LEADS = new Set<string>(
  LOCALES.filter((r, i) => i === 0 || LOCALES[i - 1]?.lang !== r.lang).map(
    (r) => r.code
  )
);

function matches(r: LocaleRow, q: string): boolean {
  return (
    r.code.toLowerCase().includes(q) ||
    r.name.toLowerCase().includes(q) ||
    r.nativeName.toLowerCase().includes(q) ||
    r.region.toLowerCase().includes(q) ||
    r.script.toLowerCase().includes(q) ||
    r.scriptName.toLowerCase().includes(q)
  );
}

export default function Ledger() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);
  const [q, setQ] = useState('');

  const query = q.trim().toLowerCase();
  const rows = useMemo(
    () => (query ? LOCALES.filter((r) => matches(r, query)) : LOCALES),
    [query]
  );

  return (
    <section className='tc-sec' id='ledger' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>The locale ledger</h2>
        <p data-reveal>
          Explore all languages and regional variants supported by General
          Translation. English name, endonym, region, script, and direction —
          right-to-left locales are marked in their own column.
        </p>
      </div>

      <div className='lcl-filter'>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search by code, name, or region (e.g., es, fr-CA)'
          aria-label='Search locales'
          className='lcl-filter-in'
          type='text'
          spellCheck={false}
        />
        <span className='lcl-filter-count'>
          {rows.length} / {STATS.locales} shown
        </span>
      </div>

      <div className='lcl-table'>
        <div className='lcl-row lcl-cols' aria-hidden='true'>
          <span className='lcl-idx'>#</span>
          <span className='lcl-code'>locale</span>
          <span className='lcl-name'>name</span>
          <span className='lcl-native'>endonym</span>
          <span className='lcl-region'>region</span>
          <span className='lcl-script'>script</span>
          <span className='lcl-dir'>dir</span>
        </div>

        {rows.length === 0 ? (
          <p className='lcl-empty'>No matching locales</p>
        ) : (
          <div className='lcl-body'>
            <span className='lcl-thread' aria-hidden='true' />
            {rows.map((r) => {
              const idx = (INDEX.get(r.code) ?? 0) + 1;
              const cls = [
                'lcl-row',
                'lcl-line',
                LEADS.has(r.code) ? 'is-lead' : '',
                r.dir === 'rtl' ? 'is-rtl' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <a
                  key={r.code}
                  className={cls}
                  href={`https://wikipedia.org/wiki/List_of_ISO_639_language_codes#${r.code}`}
                  target='_blank'
                  rel='noreferrer'
                  aria-label={`Open locale ${r.code}`}
                >
                  <span className='lcl-idx'>
                    {String(idx).padStart(3, '0')}
                  </span>
                  <span className='lcl-code'>
                    <span className='lcl-chip'>
                      <span className={`lcl-flag fi fi-${r.flag}`} aria-hidden='true' />
                      <span className='lcl-cc'>{r.code}</span>
                    </span>
                  </span>
                  <span className='lcl-name'>{r.name}</span>
                  <span className='lcl-native' lang={r.code} dir={r.dir}>
                    {r.nativeName}
                  </span>
                  <span
                    className={
                      r.regionExplicit ? 'lcl-region' : 'lcl-region is-inferred'
                    }
                  >
                    {r.region || '—'}
                  </span>
                  <span className='lcl-script'>{r.script}</span>
                  <span className='lcl-dir'>{r.dir}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
