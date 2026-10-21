/* The globe figure's five stops: Euclid's first definition on its way from
   Alexandria to Beijing, in the order the Elements travelled. The passages
   are the first line of the Versions figure's Euclid in USAGE.mdx. */
import { msg } from '@/app/d/blog-globe/_shared/i18n';

import type { LineProps } from '@/app/d/blog-globe/_shared/figure-types';
import type { VersionPanel } from '@/app/d/blog-globe/_shared/figure-types';

/** `label` is the language's own name, as on the Versions figure's stops; `n` is the line's marker there. */
export type GlobeStop = Pick<VersionPanel, 'lang' | 'label'> &
  Pick<LineProps, 'n'> & {
    /** Arabic is 'rtl': set right to left and right aligned. */
    dir: Exclude<VersionPanel['dir'], 'auto'>;
    /** A msg() literal; read it with useMessages(). */
    city: string;
    /** Signed decimal degrees, north and east positive. */
    lat: number;
    lon: number;
    /** The decimal places both coordinates were given to; the label keeps them. */
    places: number;
    /** Negative before the common era. */
    year: number;
    /** A msg() literal, as the label prints the year. */
    yearLabel: string;
    passage: string;
  };

export const STOPS = [
  {
    lang: 'grc',
    label: 'Ἑλληνική',
    dir: 'ltr',
    n: 'α΄.',
    city: msg('Alexandria'),
    lat: 31.2,
    lon: 29.919,
    places: 3,
    year: -300,
    yearLabel: msg('300 BCE'),
    passage: 'Σημεῖόν ἐστιν, οὗ μέρος οὐθέν.',
  },
  {
    lang: 'ar',
    label: 'العربية',
    dir: 'rtl',
    city: msg('Baghdad'),
    lat: 33.345,
    lon: 44.345,
    places: 3,
    year: 800,
    yearLabel: msg('800 CE'),
    passage: 'النقطة هي ما لا جزء له.',
  },
  {
    lang: 'la',
    label: 'Latina',
    dir: 'ltr',
    n: 'I.',
    city: msg('Antioch'),
    lat: 36.2,
    lon: 36.16,
    places: 2,
    year: 1130,
    yearLabel: msg('1130'),
    passage: 'Punctum est, cuius pars nulla est.',
  },
  {
    lang: 'en',
    label: 'English',
    dir: 'ltr',
    n: '1.',
    city: msg('London'),
    lat: 51.517,
    lon: -0.097,
    places: 3,
    year: 1570,
    yearLabel: msg('1570'),
    passage: 'A point is that which has no part.',
  },
  {
    lang: 'zh-Hant',
    label: '文言',
    dir: 'ltr',
    n: '第一界：',
    city: msg('Beijing'),
    lat: 39.9,
    lon: 116.37,
    places: 2,
    year: 1606,
    yearLabel: msg('1606'),
    passage: '點者，無分。',
  },
] as const satisfies readonly GlobeStop[];

/** One coordinate at `places` decimals with its hemisphere: '31.200° N', '0.097° W'. A value that rounds to zero takes N or E. */
export function formatCoordinate(
  value: number,
  axis: 'lat' | 'lon',
  places: number
): string {
  const text = Math.abs(value).toFixed(places);
  const negative = value < 0 && Number(text) > 0;
  const letter = axis === 'lat' ? (negative ? 'S' : 'N') : negative ? 'W' : 'E';
  return `${text}° ${letter}`;
}

/** '31.200° N, 29.919° E' */
export function formatCoordinates(
  stop: Pick<GlobeStop, 'lat' | 'lon' | 'places'>
): string {
  return `${formatCoordinate(stop.lat, 'lat', stop.places)}, ${formatCoordinate(stop.lon, 'lon', stop.places)}`;
}

/** '31.200° N, 29.919° E · Alexandria · 300 BCE'. `read` resolves the msg() fields (pass useMessages()); by default they print as written. */
export function formatStopLabel(
  stop: GlobeStop,
  read: (message: string) => string = (message) => message
): string {
  return [formatCoordinates(stop), read(stop.city), read(stop.yearLabel)].join(
    ' · '
  );
}
