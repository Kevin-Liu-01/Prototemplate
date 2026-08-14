import 'flag-icons/css/flag-icons.min.css';

import type { ComponentPropsWithoutRef } from 'react';

/** Every locale the horizon orbit flies, resolved to its flag-icons
    country — the ui package's getLocaleFlagCountryCode, reduced to the
    orbit's own roster for the prototype. */
const LOCALE_COUNTRIES: Record<string, string> = {
  'en-US': 'us',
  'ja-JP': 'jp',
  'pt-BR': 'br',
  'ko-KR': 'kr',
  'uk-UA': 'ua',
  'zh-CN': 'cn',
  'fr-FR': 'fr',
  'ar-SA': 'sa',
  'nl-NL': 'nl',
  'hi-IN': 'in',
  'de-DE': 'de',
  'th-TH': 'th',
  'vi-VN': 'vn',
  'he-IL': 'il',
  'it-IT': 'it',
  'pl-PL': 'pl',
  'sv-SE': 'se',
  'es-MX': 'mx',
  'id-ID': 'id',
  'tr-TR': 'tr',
  'ru-RU': 'ru',
  'el-GR': 'gr',
  'fi-FI': 'fi',
  'no-NO': 'no',
  'da-DK': 'dk',
  'cs-CZ': 'cz',
  'ro-RO': 'ro',
  'hu-HU': 'hu',
  'fil-PH': 'ph',
  'ms-MY': 'my',
};

type LocaleFlagProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  locale: string;
};

/** Flag-only chip: props spread through so the orbit's data-orbit-part
    marker rides the flag span the way it does on the live page. */
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
