import 'flag-icons/css/flag-icons.min.css';

import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/cn';

/**
 * A locale's flag: gt-cloud's LocaleFlag (packages/ui/src/components/ui/
 * LocaleFlag.tsx) with the same API and the same artwork, the flag-icons SVG
 * pack drawn by its `fi fi-<country>` classes. gt-cloud resolves the country
 * with getLocaleFlagCountryCode from @generaltranslation/locales, which is a
 * workspace package and not on npm, so this reads the same answer from the
 * platform: the region of the locale's likely subtags (Intl.Locale's
 * maximize, the CLDR data that package reads), so `ja` flies Japan's flag,
 * `ar` Egypt's and `pt-BR` Brazil's. A locale with no country renders
 * nothing. The flag is decoration beside a language's name and is hidden
 * from assistive technology.
 */
export function getLocaleFlagCountryCode(locale: string): string | undefined {
  try {
    const region = new Intl.Locale(locale).maximize().region?.toLowerCase();
    return region && /^[a-z]{2}$/.test(region) ? region : undefined;
  } catch {
    return undefined;
  }
}

type LocaleFlagProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  locale: string;
};

export default function LocaleFlag({ locale, className, ...props }: LocaleFlagProps) {
  const countryCode = getLocaleFlagCountryCode(locale);
  if (!countryCode) return null;
  return <span {...props} aria-hidden='true' className={cn('fi', `fi-${countryCode}`, className)} />;
}
