/* The globe figure's five stops: Euclid's definitions 1 to 8 on their way
   from Alexandria to Beijing, in the order the Elements travelled. The lines
   are the Versions figure's Euclid in USAGE.mdx, markers verbatim; `passage`
   and `n` are the first line's. */
import { msg } from '@/app/d/blog-globe/_shared/i18n';

import type { LineProps } from '@/app/d/blog-globe/_shared/figure-types';
import type { VersionPanel } from '@/app/d/blog-globe/_shared/figure-types';

/** One definition: its marker as the edition sets it (the Arabic has none) and its text. */
export type PassageLine = Pick<LineProps, 'n'> & { text: string };

type Eight<T> = readonly [T, T, T, T, T, T, T, T];

/** `label` is the language's own name, as on the Versions figure's stops; `n` is the first line's marker there. */
export type GlobeStop = Pick<VersionPanel, 'lang' | 'label'> &
  Pick<LineProps, 'n'> & {
    /** Arabic is 'rtl': set right to left and right aligned. */
    dir: Exclude<VersionPanel['dir'], 'auto'>;
    /** A msg() literal; read it with useMessages(). */
    city: string;
    /** Signed decimal degrees, north and east positive. */
    lat: number;
    lon: number;
    /** The decimal places both coordinates were given to; the label's seconds keep that precision. */
    places: number;
    /** Negative before the common era. */
    year: number;
    /** A msg() literal, as the label prints the year. */
    yearLabel: string;
    /** The first definition. */
    passage: string;
    /** Definitions 1 to 8. */
    lines: Eight<PassageLine>;
  };

const GREEK = [
  { n: 'α΄.', text: 'Σημεῖόν ἐστιν, οὗ μέρος οὐθέν.' },
  { n: 'β΄.', text: 'Γραμμὴ δὲ μῆκος ἀπλατές.' },
  { n: 'γ΄.', text: 'Γραμμῆς δὲ πέρατα σημεῖα.' },
  {
    n: 'δ΄.',
    text: "Εὐθεῖα γραμμή ἐστιν, ἥτις ἐξ ἴσου τοῖς ἐφ' ἑαυτῆς σημείοις κεῖται.",
  },
  { n: 'ε΄.', text: 'Ἐπιφάνεια δέ ἐστιν, ὃ μῆκος καὶ πλάτος μόνον ἔχει.' },
  { n: 'ϛ΄.', text: 'Ἐπιφανείας δὲ πέρατα γραμμαί.' },
  {
    n: 'ζ΄.',
    text: "Ἐπίπεδος ἐπιφάνειά ἐστιν, ἥτις ἐξ ἴσου ταῖς ἐφ' ἑαυτῆς εὐθείαις κεῖται.",
  },
  {
    n: 'η΄.',
    text: "Ἐπίπεδος δὲ γωνία ἐστὶν ἡ ἐν ἐπιπέδῳ δύο γραμμῶν ἁπτομένων ἀλλήλων καὶ μὴ ἐπ' εὐθείας κειμένων πρὸς ἀλλήλας τῶν γραμμῶν κλίσις.",
  },
] as const satisfies Eight<PassageLine>;

const ARABIC = [
  { text: 'النقطة هي ما لا جزء له.' },
  { text: 'والخط طول بلا عرض.' },
  { text: 'ونهايتا الخط نقطتان.' },
  { text: 'والخط المستقيم هو الذي يقع على استقامة ما عليه من النقط.' },
  { text: 'والسطح ما له طول وعرض فقط.' },
  { text: 'ونهايات السطح خطوط.' },
  {
    text: 'والسطح المستوي هو الذي يقع على استقامة ما عليه من الخطوط المستقيمة.',
  },
  {
    text: 'والزاوية المسطحة هي ميل أحد خطين يلتقيان في سطح واحد على الآخر، وليسا على استقامة واحدة.',
  },
] as const satisfies Eight<PassageLine>;

const LATIN = [
  { n: 'I.', text: 'Punctum est, cuius pars nulla est.' },
  { n: 'II.', text: 'Linea vero, longitudo latitudinis expers.' },
  { n: 'III.', text: 'Lineae autem termini, sunt puncta.' },
  { n: 'IIII.', text: 'Recta linea est, quae ex aequo sua interiacet puncta.' },
  {
    n: 'V.',
    text: 'Superficies est, quae longitudinem, & latitudinem tantum habet.',
  },
  { n: 'VI.', text: 'Superficiei autem extrema, sunt lineae.' },
  {
    n: 'VII.',
    text: 'Plana superficies est, quae ex aequo suas interiacet lineas.',
  },
  {
    n: 'VIII.',
    text: 'Planus angulus est, duarum linearum in plano se mutuo tangentium, & non in directum iacentium, alterius ad alteram inclinatio.',
  },
] as const satisfies Eight<PassageLine>;

const ENGLISH = [
  { n: '1.', text: 'A point is that which has no part.' },
  { n: '2.', text: 'A line is breadthless length.' },
  { n: '3.', text: 'The extremities of a line are points.' },
  {
    n: '4.',
    text: 'A straight line is a line which lies evenly with the points on itself.',
  },
  { n: '5.', text: 'A surface is that which has length and breadth only.' },
  { n: '6.', text: 'The extremities of a surface are lines.' },
  {
    n: '7.',
    text: 'A plane surface is a surface which lies evenly with the straight lines on itself.',
  },
  {
    n: '8.',
    text: 'A plane angle is the inclination to one another of two lines in a plane which meet one another and do not lie in a straight line.',
  },
] as const satisfies Eight<PassageLine>;

const CHINESE = [
  { n: '第一界：', text: '點者，無分。' },
  { n: '第二界：', text: '線，有長無廣。' },
  { n: '第三界：', text: '線之界是點。' },
  { n: '第四界：', text: '直線止有兩端，兩端之間上下更無一點。' },
  { n: '第五界：', text: '面者，止有長有廣。' },
  { n: '第六界：', text: '面之界是線。' },
  { n: '第七界：', text: '平面，一面平在界之內。' },
  { n: '第八界：', text: '平角者，兩直線於平面縱橫相遇交接處。' },
] as const satisfies Eight<PassageLine>;

export const STOPS = [
  {
    lang: 'grc',
    label: 'Ἑλληνική',
    dir: 'ltr',
    n: GREEK[0].n,
    city: msg('Alexandria'),
    lat: 31.2,
    lon: 29.919,
    places: 3,
    year: -300,
    yearLabel: msg('300 BCE'),
    passage: GREEK[0].text,
    lines: GREEK,
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
    passage: ARABIC[0].text,
    lines: ARABIC,
  },
  {
    lang: 'la',
    label: 'Latina',
    dir: 'ltr',
    n: LATIN[0].n,
    city: msg('Antioch'),
    lat: 36.2,
    lon: 36.16,
    places: 2,
    year: 1130,
    yearLabel: msg('1130'),
    passage: LATIN[0].text,
    lines: LATIN,
  },
  {
    lang: 'en',
    label: 'English',
    dir: 'ltr',
    n: ENGLISH[0].n,
    city: msg('London'),
    lat: 51.517,
    lon: -0.097,
    places: 3,
    year: 1570,
    yearLabel: msg('1570'),
    passage: ENGLISH[0].text,
    lines: ENGLISH,
  },
  {
    lang: 'zh-Hant',
    label: '文言',
    dir: 'ltr',
    n: CHINESE[0].n,
    city: msg('Beijing'),
    lat: 39.9,
    lon: 116.37,
    places: 2,
    year: 1606,
    yearLabel: msg('1606'),
    passage: CHINESE[0].text,
    lines: CHINESE,
  },
] as const satisfies readonly GlobeStop[];

/* Inside one coordinate the parts are joined by no-break spaces, so a label
   that wraps breaks between the two coordinates and never inside one. */
const JOIN = ' ';

/**
 * One coordinate in degrees, minutes and seconds with its hemisphere:
 * '31° 12′ 0″ N', '0° 5′ 49.2″ W'. The seconds keep only the precision of a
 * value given to `places` decimals of a degree (0.001° is 3.6″, so one
 * decimal for 3 places and none for 2), without trailing zeros. A value
 * that rounds to zero takes N or E.
 */
export function formatCoordinate(
  value: number,
  axis: 'lat' | 'lon',
  places: number
): string {
  // the value in its last given place, then in the seconds' last place:
  // k * 3600 / 10^places seconds is a whole number of 10^-decimals seconds
  const k = Math.round(Math.abs(value) * 10 ** places);
  const decimals = Math.max(0, places - 2);
  const units = k * 36 * 10 ** Math.max(0, 2 - places);
  const perMinute = 60 * 10 ** decimals;
  const perDegree = 60 * perMinute;
  const degrees = Math.floor(units / perDegree);
  const minutes = Math.floor((units % perDegree) / perMinute);
  const seconds = Number(
    ((units % perMinute) / 10 ** decimals).toFixed(decimals)
  );
  const negative = value < 0 && k > 0;
  const letter = axis === 'lat' ? (negative ? 'S' : 'N') : negative ? 'W' : 'E';
  return [`${degrees}°`, `${minutes}′`, `${seconds}″`, letter].join(JOIN);
}

/** '31° 12′ 0″ N 29° 55′ 8.4″ E': latitude, then longitude, with no comma. */
export function formatCoordinates(
  stop: Pick<GlobeStop, 'lat' | 'lon' | 'places'>
): string {
  return `${formatCoordinate(stop.lat, 'lat', stop.places)} ${formatCoordinate(stop.lon, 'lon', stop.places)}`;
}

/** '31° 12′ 0″ N 29° 55′ 8.4″ E · Alexandria · 300 BCE'. `read` resolves the msg() fields (pass useMessages()); by default they print as written. */
export function formatStopLabel(
  stop: GlobeStop,
  read: (message: string) => string = (message) => message
): string {
  return [formatCoordinates(stop), read(stop.city), read(stop.yearLabel)].join(
    ' · '
  );
}
