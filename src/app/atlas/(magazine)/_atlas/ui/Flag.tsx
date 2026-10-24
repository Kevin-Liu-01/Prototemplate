/* A country's flag for a language, from the flag-icons set gt-cloud's
   LocaleFlag uses, printed matte: square, a hair desaturated, with a
   thin inner edge so a white field holds its shape on the paper. */

import type { LangCode } from '../stories';

const COUNTRY: Record<LangCode, string> = {
  en: 'us',
  es: 'es',
  pt: 'br',
  de: 'de',
  ar: 'eg',
  hi: 'in',
  zh: 'cn',
  ko: 'kr',
  ja: 'jp',
};

/** A language's flag, or with `country` a place's own (en-GB flies the British flag). */
export default function Flag({
  code,
  country,
  size = 18,
}: {
  code?: LangCode;
  country?: string;
  size?: number;
}) {
  const file = country ?? (code ? COUNTRY[code] : 'us');
  return (
    <span
      className='gtp-flag'
      style={{ width: size, height: Math.round(size * 0.75) }}
      aria-hidden='true'
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB SVG, drawn at its own size */}
      <img
        src={`/atlas/flags/${file}.svg`}
        alt=''
        width={size}
        height={Math.round(size * 0.75)}
        // lazy, so React does not preload every flag in the page's head
        loading='lazy'
      />
    </span>
  );
}
