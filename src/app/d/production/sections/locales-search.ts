/**
 * The roster's search path, ported 1-1 from the workspace package the real
 * page calls — `filterLocaleCodes` in
 * gt-cloud/packages/locales/src/search.ts, with `sortLocalesByPriority` from
 * .../src/utils/sort.ts. This repo cannot install that package, so the two
 * functions are reproduced here against the vendored fixture instead of
 * getLocaleProperties. Behaviour, field-for-field:
 *
 *   - code, name, nativeName and languageCode match on a plain substring —
 *     what people actually type;
 *   - region names match on a WORD PREFIX, so "ger" surfaces Germany but not
 *     Nigeria (which merely contains "ger");
 *   - three hardcoded alternative names (mandarin, cantonese, farsi) map to
 *     their locale sets;
 *   - results sort by exact code, then name prefix, then code prefix, then
 *     native-name prefix, alphabetical by name inside each tier.
 *
 * The sort's `name` is the package's LocaleData.name, i.e.
 * `nameWithRegionCode` — not the capitalized heading the card prints.
 */

import { SUPPORTED_LOCALES, type LocaleProperties } from './locales-data';

/** Hardcoded mappings for common alternative names. */
export const ALTERNATIVE_NAME_MAPPINGS: { [key: string]: string[] } = {
  mandarin: ['zh', 'zh-CN', 'zh-TW', 'zh-SG'],
  cantonese: ['zh-HK'],
  farsi: ['fa'],
};

const BY_CODE = new Map<string, LocaleProperties>(
  SUPPORTED_LOCALES.map((row) => [row.code, row])
);

/**
 * A region counts as a match only when one of its words starts with the
 * query. Splits on any non-letter/number so multi-word regions like
 * "South Korea" still match "korea".
 */
function matchesWordPrefix(text: string, query: string): boolean {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .some((word) => word.length > 0 && word.startsWith(query));
}

function matchesLocale(code: string, query: string): boolean {
  const props = BY_CODE.get(code);

  if (props) {
    const substringFields = [
      code,
      props.name,
      props.nativeName,
      props.languageCode,
    ];
    if (
      substringFields
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query))
    ) {
      return true;
    }
    const regionFields = [props.regionName, props.nativeRegionName];
    if (
      regionFields
        .filter(Boolean)
        .some((field) => matchesWordPrefix(field, query))
    ) {
      return true;
    }
  } else if (code.toLowerCase().includes(query)) {
    return true;
  }

  for (const [altName, localeCodes] of Object.entries(
    ALTERNATIVE_NAME_MAPPINGS
  )) {
    if (
      (altName.includes(query) || altName.startsWith(query)) &&
      localeCodes.includes(code)
    ) {
      return true;
    }
  }

  return false;
}

type LocaleData = { code: string; name: string; nativeName: string };

function toLocaleData(code: string): LocaleData {
  const props = BY_CODE.get(code);
  if (!props) return { code, name: code, nativeName: code };
  return {
    code,
    name: props.nameWithRegionCode,
    nativeName: props.nativeName,
  };
}

function sortLocalesByPriority(
  a: LocaleData,
  b: LocaleData,
  query: string
): number {
  const aCodeExact = a.code.toLowerCase() === query;
  const bCodeExact = b.code.toLowerCase() === query;
  const aCodeStarts = a.code.toLowerCase().startsWith(query);
  const bCodeStarts = b.code.toLowerCase().startsWith(query);
  const aNameStarts = a.name.toLowerCase().startsWith(query);
  const bNameStarts = b.name.toLowerCase().startsWith(query);
  const aNativeStarts = a.nativeName.toLowerCase().startsWith(query);
  const bNativeStarts = b.nativeName.toLowerCase().startsWith(query);

  // 1. Exact locale code matches (highest priority)
  if (aCodeExact && !bCodeExact) return -1;
  if (!aCodeExact && bCodeExact) return 1;

  // 2. Language names that start with query (higher priority than codes)
  if (aNameStarts && !bNameStarts) return -1;
  if (!aNameStarts && bNameStarts) return 1;
  if (aNameStarts && bNameStarts) return a.name.localeCompare(b.name);

  // 3. Locale codes that start with query
  if (aCodeStarts && !bCodeStarts) return -1;
  if (!aCodeStarts && bCodeStarts) return 1;
  if (aCodeStarts && bCodeStarts) return a.name.localeCompare(b.name);

  // 4. Native names that start with query (lowest priority)
  if (aNativeStarts && !bNativeStarts) return -1;
  if (!aNativeStarts && bNativeStarts) return 1;

  return a.name.localeCompare(b.name);
}

/** Filters locale codes by a search query, sorted by relevance. */
export function filterLocaleCodes(locales: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return locales.map((code) => toLocaleData(code).code);

  return locales
    .filter((code) => matchesLocale(code, q))
    .map((code) => toLocaleData(code))
    .sort((a, b) => sortLocalesByPriority(a, b, q))
    .map((data) => data.code);
}

/** `capitalizeLanguageName` from packages/locales/src/utils/display.ts. */
export function capitalizeLanguageName(language: string): string {
  if (!language) return '';
  return (
    language.charAt(0).toUpperCase() +
    (language.length > 1 ? language.slice(1) : '')
  );
}

/** Every code the roster serves, in the package's own order. */
export const SUPPORTED_LOCALE_CODES: string[] = SUPPORTED_LOCALES.map(
  (row) => row.code
);

export { BY_CODE as LOCALE_PROPERTIES };
