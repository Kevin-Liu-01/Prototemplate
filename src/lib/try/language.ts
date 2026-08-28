// franc stays a dependency: there is no in-tree detector, and its trigram
// data only ever loads server-side.
import { franc } from 'franc';

// Maps a locale's primary subtag to the ISO 639-3 codes franc reports for it.
const FRANC_CODES: Record<string, string[]> = {
  en: ['eng', 'sco'],
  es: ['spa', 'glg', 'cat'],
  fr: ['fra'],
  de: ['deu'],
  ja: ['jpn'],
  it: ['ita'],
  pt: ['por'],
  nl: ['nld'],
  ru: ['rus'],
  zh: ['cmn'],
  ko: ['kor'],
  ar: ['arb', 'ara', 'arz'],
  he: ['heb'],
  pl: ['pol'],
  tr: ['tur'],
  sv: ['swe'],
  da: ['dan'],
  fi: ['fin'],
  no: ['nob', 'nno'],
  nb: ['nob'],
  cs: ['ces'],
  el: ['ell'],
  hi: ['hin'],
  th: ['tha'],
  vi: ['vie'],
  id: ['ind'],
  uk: ['ukr'],
  ro: ['ron'],
  hu: ['hun'],
  fa: ['pes', 'fas'],
  ur: ['urd'],
};

export const RTL_LANGS = new Set([
  'ar',
  'he',
  'fa',
  'ur',
  'ps',
  'yi',
  'ckb',
  'dv',
]);

export type LanguageProfile = {
  totalChunks: number;
  confident: number;
  expectedHits: number;
  defaultHits: number;
  otherHits: number;
  unknown: number;
  expectedShare: number;
  defaultShare: number;
  supported: boolean;
};

export function primarySubtag(localeCode: string | null | undefined): string {
  return (localeCode || '').toLowerCase().split(/[-_]/)[0] ?? '';
}

export function francCodesFor(localeCode: string): string[] | null {
  return FRANC_CODES[primarySubtag(localeCode)] || null;
}

export function detect(text: string): string {
  return franc(text || '', { minLength: 20 });
}

// Classify each text chunk, then report what share of confident chunks
// landed in the expected language vs the site's default language.
export function languageProfile(
  chunks: string[],
  expectedLocale: string,
  defaultLocale: string
): LanguageProfile {
  const expected = francCodesFor(expectedLocale);
  const fallback = francCodesFor(defaultLocale) || ['eng'];
  let expectedHits = 0;
  let defaultHits = 0;
  let otherHits = 0;
  let unknown = 0;

  for (const chunk of chunks) {
    const code = detect(chunk);
    if (code === 'und') {
      unknown += 1;
    } else if (expected && expected.includes(code)) {
      expectedHits += 1;
    } else if (fallback.includes(code)) {
      defaultHits += 1;
    } else {
      otherHits += 1;
    }
  }

  const confident = expectedHits + defaultHits + otherHits;
  return {
    totalChunks: chunks.length,
    confident,
    expectedHits,
    defaultHits,
    otherHits,
    unknown,
    expectedShare: confident ? expectedHits / confident : 0,
    defaultShare: confident ? defaultHits / confident : 0,
    supported: Boolean(expected),
  };
}

// True when the page's text reads as the target locale, not the default.
export function readsAsLocale(
  chunks: string[],
  targetLocale: string,
  defaultLocale: string
): boolean {
  const p = languageProfile(chunks, targetLocale, defaultLocale);
  return p.supported && p.confident >= 1 && p.expectedShare >= 0.5;
}
