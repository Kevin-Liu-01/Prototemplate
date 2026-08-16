import 'flag-icons/css/flag-icons.min.css';

import type { ComponentPropsWithoutRef } from 'react';

/** Every roster locale resolved to its flag-icons country — the ui
    package's getLocaleFlagCountryCode (region subtag, inferred from
    likely-subtags when the code has none), hardcoded for the prototype.
    Locales whose region has no ISO flag (eo, es-419, el-EL) are absent:
    the catalog card renders the roster's globe emoji instead. */
const LOCALE_COUNTRIES: Record<string, string> = {
  'af': 'za',
  'am': 'et',
  'ar': 'eg',
  'ar-AE': 'ae',
  'ar-EG': 'eg',
  'ar-LB': 'lb',
  'ar-MA': 'ma',
  'ar-OM': 'om',
  'ar-SA': 'sa',
  'bg': 'bg',
  'bn': 'bd',
  'bs': 'ba',
  'ca': 'es',
  'cs': 'cz',
  'cy': 'gb',
  'da': 'dk',
  'de': 'de',
  'de-AT': 'at',
  'de-CH': 'ch',
  'de-DE': 'de',
  'el': 'gr',
  'el-CY': 'cy',
  'en': 'us',
  'en-AU': 'au',
  'en-CA': 'ca',
  'en-GB': 'gb',
  'en-NZ': 'nz',
  'en-US': 'us',
  'es': 'es',
  'es-AR': 'ar',
  'es-CL': 'cl',
  'es-CO': 'co',
  'es-ES': 'es',
  'es-MX': 'mx',
  'es-PE': 'pe',
  'es-US': 'us',
  'es-VE': 've',
  'et': 'ee',
  'fa': 'ir',
  'fi': 'fi',
  'fil': 'ph',
  'fr': 'fr',
  'fr-BE': 'be',
  'fr-CA': 'ca',
  'fr-CH': 'ch',
  'fr-CM': 'cm',
  'fr-FR': 'fr',
  'fr-SN': 'sn',
  'gu': 'in',
  'ha': 'ng',
  'he': 'il',
  'hi': 'in',
  'hr': 'hr',
  'hu': 'hu',
  'hy': 'am',
  'id': 'id',
  'ig': 'ng',
  'is': 'is',
  'it': 'it',
  'it-CH': 'ch',
  'it-IT': 'it',
  'ja': 'jp',
  'ka': 'ge',
  'kk': 'kz',
  'kn': 'in',
  'ko': 'kr',
  'la': 'va',
  'lt': 'lt',
  'lv': 'lv',
  'mk': 'mk',
  'ml': 'in',
  'mn': 'mn',
  'mr': 'in',
  'ms': 'my',
  'my': 'mm',
  'nb': 'no',
  'nb-NO': 'no',
  'nl': 'nl',
  'nl-BE': 'be',
  'nl-NL': 'nl',
  'nn': 'no',
  'nn-NO': 'no',
  'no': 'no',
  'no-NO': 'no',
  'pa': 'in',
  'pl': 'pl',
  'pt': 'br',
  'pt-BR': 'br',
  'pt-PT': 'pt',
  'ro': 'ro',
  'ru': 'ru',
  'sk': 'sk',
  'sl': 'si',
  'so': 'so',
  'sq': 'al',
  'sr': 'rs',
  'sv': 'se',
  'sw': 'tz',
  'sw-KE': 'ke',
  'sw-TZ': 'tz',
  'ta': 'in',
  'te': 'in',
  'th': 'th',
  'tl': 'ph',
  'tr': 'tr',
  'uk': 'ua',
  'ur': 'pk',
  'uz': 'uz',
  'vi': 'vn',
  'yo': 'ng',
  'zh': 'cn',
  'zh-CN': 'cn',
  'zh-HK': 'hk',
  'zh-Hans': 'cn',
  'zh-Hant': 'tw',
  'zh-SG': 'sg',
  'zh-TW': 'tw',
};

type LocaleFlagProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  locale: string;
};

/** Flag-only chip, the ui package's contract: resolves the locale to a
    flag-icons span, or renders nothing when no country flag exists. */
export default function LocaleFlag({
  locale,
  className,
  ...props
}: LocaleFlagProps) {
  const countryCode = LOCALE_COUNTRIES[locale];
  if (!countryCode) return null;

  return (
    <span
      {...props}
      aria-hidden='true'
      className={`fi fi-${countryCode}${className ? ` ${className}` : ''}`}
    />
  );
}
