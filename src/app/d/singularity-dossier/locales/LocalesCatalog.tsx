'use client';

import { useMemo, useState } from 'react';

import { Search } from 'lucide-react';

import LocaleFlag from './LocaleFlag';
import { LOCALES, type LocaleRow } from './locales-data';

/* The live page's search, mirrored from @generaltranslation/locales:
   codes and names match on substring; regions match on a word prefix,
   so "ger" surfaces Germany but not Nigeria; a handful of alternative
   language names route to their codes. */

const ALTERNATIVE_NAMES: Record<string, string[]> = {
  mandarin: ['zh', 'zh-CN', 'zh-TW', 'zh-SG'],
  cantonese: ['zh-HK'],
  farsi: ['fa'],
};

function matchesWordPrefix(text: string, query: string): boolean {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .some((word) => word.length > 0 && word.startsWith(query));
}

function matchesLocale(row: LocaleRow, query: string): boolean {
  const substringFields = [row.code, row.name, row.nativeName, row.lang];
  if (substringFields.some((s) => s.toLowerCase().includes(query))) {
    return true;
  }
  const regionFields = [row.regionName, row.nativeRegionName];
  if (regionFields.some((s) => s && matchesWordPrefix(s, query))) {
    return true;
  }
  for (const [altName, localeCodes] of Object.entries(ALTERNATIVE_NAMES)) {
    if (altName.includes(query) && localeCodes.includes(row.code)) {
      return true;
    }
  }
  return false;
}

/** The library's relevance order: exact code match first, then names,
    codes, and native names that start with the query, then alphabetical. */
function sortByPriority(a: LocaleRow, b: LocaleRow, query: string): number {
  const aCodeExact = a.code.toLowerCase() === query;
  const bCodeExact = b.code.toLowerCase() === query;
  if (aCodeExact && !bCodeExact) return -1;
  if (!aCodeExact && bCodeExact) return 1;

  const aNameStarts = a.name.toLowerCase().startsWith(query);
  const bNameStarts = b.name.toLowerCase().startsWith(query);
  if (aNameStarts && !bNameStarts) return -1;
  if (!aNameStarts && bNameStarts) return 1;
  if (aNameStarts && bNameStarts) return a.name.localeCompare(b.name);

  const aCodeStarts = a.code.toLowerCase().startsWith(query);
  const bCodeStarts = b.code.toLowerCase().startsWith(query);
  if (aCodeStarts && !bCodeStarts) return -1;
  if (!aCodeStarts && bCodeStarts) return 1;
  if (aCodeStarts && bCodeStarts) return a.name.localeCompare(b.name);

  const aNativeStarts = a.nativeName.toLowerCase().startsWith(query);
  const bNativeStarts = b.nativeName.toLowerCase().startsWith(query);
  if (aNativeStarts && !bNativeStarts) return -1;
  if (!aNativeStarts && bNativeStarts) return 1;

  return a.name.localeCompare(b.name);
}

/** The production page's fold: the grid caps here until Show All. */
const VISIBLE_CAP = 120;

/**
 * The production catalog, mirrored whole: centered head, the contained
 * rounded search with its live count, and every roster locale as a card —
 * flag (or the roster's globe when the region has no ISO flag), language,
 * region, code • endonym. Search runs on the inlined rows; the URL-param
 * sync of the live page stays out of the static prototype.
 */
export default function LocalesCatalog() {
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return LOCALES;
    return LOCALES.filter((row) => matchesLocale(row, query)).sort((a, b) =>
      sortByPriority(a, b, query)
    );
  }, [q]);

  const visible = useMemo(() => {
    if (q.trim() || expanded) return filtered;
    return filtered.slice(0, VISIBLE_CAP);
  }, [filtered, expanded, q]);

  return (
    <section
      className='tc-sec locales-catalog'
      aria-labelledby='locale-catalog-title'
    >
      <div className='locales-head'>
        <h1 id='locale-catalog-title'>Supported Locales</h1>
        <p>
          Explore all languages and regional variants supported by General
          Translation
        </p>
      </div>

      <div className='locales-search'>
        <Search aria-hidden='true' />
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder='Search by code, name, or region (e.g., es, fr-CA)'
          aria-label='Search locales'
        />
        <span aria-live='polite'>
          {filtered.length} / {LOCALES.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className='locales-empty' role='status'>
          No matching locales
        </div>
      ) : (
        <>
          <div className='locales-grid' role='list'>
            {visible.map((row) => (
              <a
                className='locales-card'
                href={`https://wikipedia.org/wiki/List_of_ISO_639_language_codes#${row.code}`}
                key={row.code}
                target='_blank'
                rel='noopener noreferrer'
                role='listitem'
                aria-label={`Open locale ${row.code}`}
              >
                <span className='locales-card-flag' aria-hidden='true'>
                  {row.regionCode &&
                  !/^\d+$/.test(row.regionCode) &&
                  row.regionName !== row.regionCode ? (
                    <LocaleFlag locale={row.code} />
                  ) : (
                    /* no ISO flag for this region — the roster's
                       own globe stands in */
                    <span className='locales-card-globe'>{row.emoji}</span>
                  )}
                </span>
                <span className='locales-card-body'>
                  <strong>{row.name}</strong>
                  <span className='locales-card-region'>
                    {row.regionName || '—'}
                  </span>
                  <span className='locales-card-code'>
                    <code>{row.code}</code>
                    <i>•</i>
                    {row.nativeName || '—'}
                  </span>
                </span>
              </a>
            ))}
          </div>

          {!q.trim() && filtered.length > visible.length && (
            <div className='locales-show-all'>
              <button
                className='tc-btn tc-btn-line'
                type='button'
                onClick={() => setExpanded(true)}
              >
                Show All {filtered.length}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
