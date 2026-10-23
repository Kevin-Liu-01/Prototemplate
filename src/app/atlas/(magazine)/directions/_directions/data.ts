/* What the directions print. The title languages and the story's titles
   come from the press (stories.ts). The rest is the issue's own matter:
   Euclid's first definition in the five languages that carried it, Ricci's
   road to Peking, and the opening of Book I as it was set in 1607. */

import { LANGS, STORIES, type LangCode } from '../../_atlas/stories';

export const ISSUE_SLUG = 'translating-euclid';

const story = STORIES.find((s) => s.slug === ISSUE_SLUG);
if (!story) throw new Error(`press directions: no story ${ISSUE_SLUG} in _atlas/stories.ts`);

/** Which face a title is set in, as data-script on the element. */
export type Script = 'latn' | 'arab' | 'deva' | 'hans' | 'kore' | 'jpan';

const SCRIPT: Partial<Record<LangCode, Script>> = { ar: 'arab', hi: 'deva', zh: 'hans', ko: 'kore', ja: 'jpan' };

export type TitleLang = {
  code: LangCode;
  /** Two letters, for the language buttons. */
  short: string;
  /** The language's own name. */
  label: string;
  city: string;
  lat: number;
  lon: number;
  dir: 'ltr' | 'rtl';
  script: Script;
  title: string;
};

/** The press's nine title languages, west to east, each with the story's title. */
export const TITLE_LANGS: readonly TitleLang[] = LANGS.map((l) => ({
  code: l.code,
  short: l.code.toUpperCase(),
  label: l.name,
  city: l.city,
  lat: l.lat,
  lon: l.lon,
  dir: l.dir,
  script: SCRIPT[l.code] ?? 'latn',
  title: story.titles[l.code],
}));

/** One of the story's sections, as a contents line. */
export type Chapter = { n: string; text: string; lang: string; note: string; href: string };

/** The issue as the server reads it from the story's MDX (issue.ts). */
export type Issue = {
  href: string;
  title: string;
  /** October 19, 2026 */
  date: string;
  /** Oct 19, 2026 */
  dateShort: string;
  /** 2026.10.19 */
  dateDots: string;
  minutes: number;
  chapters: Chapter[];
};

export type Definition = {
  /** The BCP 47 tag the passage is set with. */
  code: string;
  short: string;
  label: string;
  name: string;
  text: string;
  city: string;
  year: string;
  lat: number;
  lon: number;
  dir: 'ltr' | 'rtl';
};

/** Euclid's first definition in the five languages that carried Elements,
    at the city and year of each version: the passages, places and
    coordinates of the article's globe figure (EUCLID in _atlas/plates/Live.tsx). */
export const DEFS: readonly Definition[] = [
  { code: 'grc', short: 'GR', label: 'Ἑλληνική', name: 'Greek', text: 'Σημεῖόν ἐστιν, οὗ μέρος οὐθέν.', city: 'Alexandria', year: '300 BCE', lat: 31.2, lon: 29.919, dir: 'ltr' },
  { code: 'ar', short: 'AR', label: 'العربية', name: 'Arabic', text: 'النقطة هي ما لا جزء له.', city: 'Baghdad', year: '800 CE', lat: 33.345, lon: 44.345, dir: 'rtl' },
  { code: 'la', short: 'LA', label: 'Latina', name: 'Latin', text: 'Punctum est, cuius pars nulla est.', city: 'Antioch', year: '1130', lat: 36.2, lon: 36.16, dir: 'ltr' },
  { code: 'en', short: 'EN', label: 'English', name: 'English', text: 'A point is that which has no part.', city: 'London', year: '1570', lat: 51.517, lon: -0.097, dir: 'ltr' },
  { code: 'zh-Hant', short: 'ZH', label: '文言', name: 'Classical Chinese', text: '點者，無分。', city: 'Beijing', year: '1607', lat: 39.9, lon: 116.37, dir: 'ltr' },
];

/** Great-circle distance in kilometres. */
function km(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371.0088;
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLon = (b.lon - a.lon) * r;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export type Stop = { name: string; zh: string; year: number; lat: number; lon: number; km: number };

const CITIES = [
  { name: 'Macau', zh: '澳門', year: 1582, lat: 22.1987, lon: 113.5439 },
  { name: 'Zhaoqing', zh: '肇慶', year: 1583, lat: 23.0472, lon: 112.4651 },
  { name: 'Shaozhou', zh: '韶州', year: 1589, lat: 24.8104, lon: 113.5972 },
  { name: 'Nanchang', zh: '南昌', year: 1595, lat: 28.682, lon: 115.8579 },
  { name: 'Nanjing', zh: '南京', year: 1599, lat: 32.0603, lon: 118.7969 },
  { name: 'Peking', zh: '北京', year: 1601, lat: 39.9042, lon: 116.4074 },
];

/** Matteo Ricci's road from Macau to Peking, with the straight-line legs added up. */
export const ROUTE: readonly Stop[] = CITIES.map((c, i) => ({
  ...c,
  km: CITIES.slice(1, i + 1).reduce((sum, city, j) => sum + km(CITIES[j]!, city), 0),
}));

/** Beijing, where the translation was printed. */
export const BEIJING = { lat: 39.9042, lon: 116.4074 };

/** General Translation's home, for the colophon. */
export const SAN_FRANCISCO = { lat: 37.7749, lon: -122.4194 };

/** The opening of Book I as printed in 1607: title, the translators, the preamble, Definition 1. */
export const JIHE: readonly { text: string; cls: 'hd' | 'in1' | 'in2' | 'in9' }[] = [
  { text: '幾何原本第一卷之首', cls: 'hd' },
  { text: '泰西利瑪竇口譯', cls: 'in9' },
  { text: '吳淞徐光啟筆受', cls: 'in9' },
  { text: '界說三十六則', cls: 'in1' },
  { text: '凡造論先當分別解說論中所用名目故曰界說', cls: 'in1' },
  { text: '凡歷法地理樂律算章技藝工巧諸事有度有數者皆依賴十府中幾何府屬凡論幾何先從一點始自點引之為線線展為面面積為體是名三度', cls: 'in1' },
  { text: '第一界', cls: 'in1' },
  { text: '點者無分', cls: 'in2' },
  { text: '無長短廣狹厚薄', cls: 'in2' },
];

/** The pictures the covers print. The spread is the story's own header picture. */
export const PICTURES = {
  spread: '/atlas/euclid/18-chinese-spread-header.webp',
  plate: '/atlas/directions/atlas-plate.webp',
} as const;

/** What the spread shows, for its alt text. */
export const SPREAD_ALT = 'An open copy of Jihe Yuanben, the 1607 Chinese translation of Euclid, at the first page of Book I.';
