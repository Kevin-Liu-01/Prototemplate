import 'flag-icons/css/flag-icons.min.css';

import './flag-tag.css';
import './icons.css';

/**
 * The page's one locale-flag system (founder directive): every bare locale
 * code chip renders flag-first, then the code in the surface's own mono.
 * The flag is identification at text size — it never outgrows the code.
 * Artwork is the flag-icons SVG pack (`fi fi-<country>` background spans),
 * so every platform prints the same crisp flag instead of its emoji font.
 * Values are ISO 3166-1 alpha-2 country codes: language-only locales map
 * to their flagship country, mirroring the retired emoji map exactly.
 */
export const LOCALE_FLAGS: Record<string, string> = {
  en: 'us',
  es: 'es',
  fr: 'fr',
  ja: 'jp',
  de: 'de',
  zh: 'cn',
  ko: 'kr',
  ar: 'sa',
  ru: 'ru',
  hi: 'in',
  pt: 'br',
  it: 'it',
  el: 'gr',
  th: 'th',
  pl: 'pl',
  he: 'il',
  nl: 'nl',
  tr: 'tr',
  sv: 'se',
  id: 'id',
};

/** Explicit region subtags fly their own region (en-GB → gb, ar-EG → eg);
    everything else resolves through its base language (zh-Hant → the zh
    flag). Unknown locales return undefined and render codewise, flagless. */
export function localeFlag(code: string): string | undefined {
  const exact = LOCALE_FLAGS[code];
  if (exact) return exact;
  const [lang, region] = code.split('-');
  if (region && /^[A-Za-z]{2}$/.test(region)) return region.toLowerCase();
  return LOCALE_FLAGS[lang ?? ''];
}

export type LocaleTagProps = {
  code: string;
  className?: string;
};

/**
 * Drop-in content for an existing chip element: the host keeps its own class
 * and box (tct-chip, tf-out-tag, tcb-chips span…); this only swaps the bare
 * code for flag + code. Unknown codes render codewise, flagless.
 */
export default function LocaleTag({ code, className }: LocaleTagProps) {
  const flag = localeFlag(code);
  return (
    <span className={className ? `lct ${className}` : 'lct'}>
      {flag ? <span className={`lct-flag fi fi-${flag}`} aria-hidden='true' /> : null}
      <span className='lct-code'>{code}</span>
    </span>
  );
}
