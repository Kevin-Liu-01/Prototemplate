'use client';

import { useMemo, useRef, useState } from 'react';

import { useQuietReveal } from '../sections/reveal';
import { LOCALES, STATS, type LocaleRow } from './locales-data';

/**
 * The monument itself: all 120 rows, ruled, in type alone. English name and
 * endonym sit side by side — source and translation, never merging — with
 * the endonym set in its own script and its own direction. A stronger top
 * rule marks where a new language block begins (71 of them), so the ledger
 * carries its own grouping without a single header row; right-to-left rows
 * are marked by weight in the dir column, not by a pill. The filter is a
 * view onto the fixed ledger: rows keep their permanent index when it
 * narrows.
 */

/** Permanent row number and language-block lead, computed once. */
const INDEX = new Map<string, number>(LOCALES.map((r, i) => [r.code, i]));
const LEADS = new Set<string>(
  LOCALES.filter((r, i) => i === 0 || LOCALES[i - 1]?.lang !== r.lang).map((r) => r.code)
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

export default function LocaleLedger() {
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
      <header className='cp-head' data-reveal>
        <span className='cp-kicker'>The ledger</span>
        <h2>Every locale, entered in full.</h2>
        <p>
          Explore all languages and regional variants supported by General Translation.
          English name, endonym, region, script, and direction &mdash; right-to-left locales
          are marked in their own column.
        </p>
      </header>

      <div className='cpl-filter'>
        <input
          aria-label='Search locales'
          className='cpl-filter-in'
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search by code, name, or region (e.g., es, fr-CA)'
          spellCheck={false}
          type='text'
          value={q}
        />
        <span className='cpl-filter-count'>
          {rows.length} / {STATS.locales} shown
        </span>
      </div>

      <div className='cpl-table'>
        <div className='cpl-row is-cols' aria-hidden='true'>
          <span className='cpl-idx'>#</span>
          <span className='cpl-code'>locale</span>
          <span className='cpl-name'>name</span>
          <span className='cpl-native'>endonym</span>
          <span className='cpl-region'>region</span>
          <span className='cpl-script'>script</span>
          <span className='cpl-dir'>dir</span>
        </div>

        {rows.length === 0 ? (
          <p className='cpl-empty'>No matching locales</p>
        ) : (
          rows.map((r) => {
            const idx = (INDEX.get(r.code) ?? 0) + 1;
            const cls = [
              'cpl-row',
              LEADS.has(r.code) ? 'is-lead' : '',
              r.dir === 'rtl' ? 'is-rtl' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <a
                aria-label={`Open locale ${r.code}`}
                className={cls}
                href={`https://wikipedia.org/wiki/List_of_ISO_639_language_codes#${r.code}`}
                key={r.code}
                rel='noreferrer'
                target='_blank'
              >
                <span className='cpl-idx'>{String(idx).padStart(3, '0')}</span>
                <span className='cpl-code'>{r.code}</span>
                <span className='cpl-name'>{r.name}</span>
                <span className='cpl-native' dir={r.dir} lang={r.code}>
                  {r.nativeName}
                </span>
                <span className={r.regionExplicit ? 'cpl-region' : 'cpl-region is-inferred'}>
                  {r.region || '—'}
                </span>
                <span className='cpl-script'>{r.script}</span>
                <span className='cpl-dir'>{r.dir}</span>
              </a>
            );
          })
        )}
      </div>
    </section>
  );
}
