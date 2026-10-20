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

export default function Flag({ code, size = 18 }: { code: LangCode; size?: number }) {
  return (
    <span className='gtp-flag' style={{ width: size, height: Math.round(size * 0.75) }} aria-hidden='true'>
      {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB SVG, drawn at its own size */}
      <img src={`/press/flags/${COUNTRY[code]}.svg`} alt='' width={size} height={Math.round(size * 0.75)} />
    </span>
  );
}
