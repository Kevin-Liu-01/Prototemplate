/**
 * The Mintlify language band's data path, vendored.
 *
 * The live page (apps/landing/src/components/pages/mintlify/MintlifyPage.tsx)
 * imports MINTLIFY_SUPPORTED_LANGUAGES from
 * @generaltranslation/locales/frameworks/mintlify.js and narrows it at render
 * time with two rules of its own:
 *
 *   const ALIASES = ['cn', 'jp'];
 *   const DISPLAYED_LANGUAGES = MINTLIFY_SUPPORTED_LANGUAGES.filter(
 *     (locale, index, locales) =>
 *       !ALIASES.includes(locale) &&
 *       !locales.some((other, i) => i !== index && isSupersetLocale(other, locale))
 *   );
 *
 * Prototemplate has neither package, so the raw code list is copied verbatim
 * from packages/locales/src/frameworks/mintlify.ts and the same two rules are
 * applied here, in the open, so the filtered list can be checked against the
 * source rather than trusted. Endonyms and direction are looked up in the
 * ledger this repo already vendors (locales-data.ts), which was generated from
 * the same generaltranslation getLocaleProperties() call the live chip uses —
 * no display name is typed in by hand.
 */

import { LOCALES } from './locales-data';

/** packages/locales/src/frameworks/mintlify.ts — the union, verbatim. */
export const MINTLIFY_SUPPORTED_LANGUAGES = [
  'en',
  'cn',
  'zh',
  'zh-Hans',
  'zh-Hant',
  'es',
  'fr',
  'fr-CA',
  'ja',
  'jp',
  'pt',
  'pt-BR',
  'de',
  'ko',
  'it',
  'ro',
  'ru',
  'cs',
  'sv',
  'no',
  'lv',
  'nl',
  'uk',
  'vi',
  'id',
  'ar',
  'tr',
  'hi',
  'pl',
  'uz',
  'he',
] as const;

/** The page's own alias list — legacy two-letter codes Mintlify still accepts. */
const ALIASES: readonly string[] = ['cn', 'jp'];

/**
 * isSupersetLocale(other, locale) in miniature: within this flat list a
 * superset is always the bare language subtag of a tagged variant, so
 * 'zh' swallows 'zh-Hans' / 'zh-Hant', 'fr' swallows 'fr-CA', and 'pt'
 * swallows 'pt-BR' — exactly the four the live filter drops.
 */
function hasSupersetInList(code: string, list: readonly string[]): boolean {
  const dash = code.indexOf('-');
  if (dash < 0) return false;
  return list.includes(code.slice(0, dash));
}

/** The 25 codes the live band actually renders, after both rules. */
export const MINTLIFY_DISPLAYED_LANGUAGES: readonly string[] =
  MINTLIFY_SUPPORTED_LANGUAGES.filter(
    (code) =>
      !ALIASES.includes(code) &&
      !hasSupersetInList(code, MINTLIFY_SUPPORTED_LANGUAGES)
  );

export type MintlifyLanguage = {
  /** the Mintlify navigation language code */
  code: string;
  /** the language named in itself, capitalized the way the live chip is */
  nativeName: string;
  dir: 'ltr' | 'rtl';
};

/** capitalizeLanguageName() from @generaltranslation/locales/utils/display. */
function capitalizeLanguageName(language: string): string {
  if (!language) return '';
  return (
    language.charAt(0).toUpperCase() + (language.length > 1 ? language.slice(1) : '')
  );
}

const BY_CODE = new Map(LOCALES.map((row) => [row.code, row]));

export const MINTLIFY_LANGUAGES: readonly MintlifyLanguage[] =
  MINTLIFY_DISPLAYED_LANGUAGES.map((code) => {
    const row = BY_CODE.get(code);
    return {
      code,
      nativeName: capitalizeLanguageName(row?.nativeName ?? code),
      dir: row?.dir ?? 'ltr',
    };
  });
