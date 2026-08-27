/**
 * The flag region for every locale the /mintlify page renders a flag for.
 *
 * The shipped page draws its flags with LocaleFlag
 * (packages/ui/src/components/ui/LocaleFlag.tsx), which asks
 * getLocaleFlagCountryCode(locale) for the region of the MAXIMIZED locale
 * and renders `fi fi-<region>`. That resolver is Intl-backed:
 *
 *   new Intl.Locale(code).maximize().region
 *
 * This repo has neither package, so the answer for each of the 28 codes the
 * page actually renders — the 25 language chips in the marquee plus the
 * three output locales in the hero diagram — is recorded here from that same
 * call. Nothing is typed in by hand: the map is the resolver's output for
 * this list, and re-running the one line above reproduces it.
 */
export const MINTLIFY_FLAG_REGION: Readonly<Record<string, string>> = {
  en: 'us',
  zh: 'cn',
  es: 'es',
  fr: 'fr',
  ja: 'jp',
  pt: 'br',
  de: 'de',
  ko: 'kr',
  it: 'it',
  ro: 'ro',
  ru: 'ru',
  cs: 'cz',
  sv: 'se',
  no: 'no',
  lv: 'lv',
  nl: 'nl',
  uk: 'ua',
  vi: 'vn',
  id: 'id',
  ar: 'eg',
  tr: 'tr',
  hi: 'in',
  pl: 'pl',
  uz: 'uz',
  he: 'il',
};
