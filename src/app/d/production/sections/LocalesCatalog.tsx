'use client';

import 'flag-icons/css/flag-icons.min.css';

import { useMemo, useState } from 'react';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useMountEffect } from '@/lib/use-mount-effect';

import {
  LOCALE_PROPERTIES,
  SUPPORTED_LOCALE_CODES,
  capitalizeLanguageName,
  filterLocaleCodes,
} from './locales-search';

import './locales.css';

/**
 * SUPPORTED LOCALES — the shipped page, reproduced.
 *
 * The real component is
 * gt-cloud/apps/landing/src/components/pages/supported-locales/SupportedLocalesPage.tsx:
 * one section, centered head, a search rail carrying a live `shown / total`
 * readout, then the whole roster as a three-up card grid — flag, English
 * name, region, then `code • endonym`. Every card links out to the ISO 639
 * list on Wikipedia, anchored on its own code.
 *
 * Kept 1-1, including the parts that only show under a condition the live
 * data never meets:
 *   - the roster is sliced to the first 120 rows until expanded, and the
 *     "Show All" control appears only when the slice hides something. The
 *     package currently lists exactly 120 locales, so on the real page the
 *     control never renders — the branch stays because the real branch does.
 *   - `?search=` round-trips through the URL with router.replace, and a
 *     popstate listener pulls the query back out of the address bar.
 *
 * The flag slot follows the real page's own test: an ISO flag whenever the
 * locale resolves a real country region, and the locale's globe emoji
 * otherwise — which is Esperanto (001), Latin American Spanish (419), and
 * the bare-subtag Greek (EL) row.
 */
export default function LocalesCatalog() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState(() => searchParams.get('search') ?? '');
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    if (!q.trim()) return SUPPORTED_LOCALE_CODES;
    return filterLocaleCodes(SUPPORTED_LOCALE_CODES, q);
  }, [q]);

  const visible = useMemo(() => {
    if (q.trim() || expanded) return filtered;
    return filtered.slice(0, 120);
  }, [filtered, expanded, q]);

  useMountEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setQ(params.get('search') ?? '');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  });

  const handleSearchChange = (value: string) => {
    setQ(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set('search', value);
    else params.delete('search');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : (pathname ?? ''));
  };

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
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder='Search by code, name, or region (e.g., es, fr-CA)'
          aria-label='Search locales'
        />
        <span aria-live='polite'>
          {filtered.length} / {SUPPORTED_LOCALE_CODES.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className='locales-empty' role='status'>
          No matching locales
        </div>
      ) : (
        <>
          <div className='locales-grid' role='list'>
            {visible.map((code) => {
              const properties = LOCALE_PROPERTIES.get(code);
              if (!properties) return null;
              const languageName = capitalizeLanguageName(properties.name);
              const hasIsoFlag =
                Boolean(properties.regionCode) &&
                !/^\d+$/.test(properties.regionCode) &&
                properties.regionName !== properties.regionCode;

              return (
                <a
                  className='locales-card'
                  href={`https://wikipedia.org/wiki/List_of_ISO_639_language_codes#${code}`}
                  key={code}
                  target='_blank'
                  rel='noopener noreferrer'
                  role='listitem'
                  aria-label={`Open locale ${code}`}
                >
                  <span className='locales-card-flag' aria-hidden='true'>
                    {hasIsoFlag ? (
                      properties.flag ? (
                        <span
                          aria-hidden='true'
                          className={`fi inline-block shrink-0 fi-${properties.flag}`}
                        />
                      ) : null
                    ) : (
                      /* no ISO flag for this region — the roster's
                         own globe stands in */
                      <span className='locales-card-globe'>
                        {properties.emoji}
                      </span>
                    )}
                  </span>
                  <span className='locales-card-body'>
                    <strong>{languageName}</strong>
                    <span className='locales-card-region'>
                      {properties.regionName || '—'}
                    </span>
                    <span className='locales-card-code'>
                      <code>{code}</code>
                      <i>•</i>
                      {properties.nativeName || '—'}
                    </span>
                  </span>
                </a>
              );
            })}
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
