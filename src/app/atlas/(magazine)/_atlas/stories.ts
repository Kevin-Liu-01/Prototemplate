/* The press's catalog: which posts it carries and in what order, each
   title in the languages of the language slider, and the live demos that
   join a figure's recorded frames. The text itself comes from the blog's
   MDX (content.ts). */

import type { LatLon } from './coords';

export type LangCode = 'en' | 'es' | 'pt' | 'de' | 'ar' | 'hi' | 'zh' | 'ko' | 'ja';

/** A city where a language is spoken: its locale and the country whose flag it flies. */
export type Place = LatLon & {
  city: string;
  /** BCP 47: 'es-MX' */
  locale: string;
  /** ISO 3166 alpha-2 in lower case, for the flag: 'mx' */
  country: string;
};

export type Lang = LatLon & {
  code: LangCode;
  /** The language's own name. */
  name: string;
  city: string;
  dir: 'ltr' | 'rtl';
  /** Major cities that speak it, the first being the language's own place above; the globe tours them. */
  places: readonly Place[];
};

const place = (city: string, locale: string, country: string, lat: number, lon: number): Place => ({ city, locale, country, lat, lon });

/** Each language in its first city, with the others it is spoken in. */
function lang(code: LangCode, name: string, dir: 'ltr' | 'rtl', places: Place[]): Lang {
  const first = places[0]!;
  return { code, name, dir, city: first.city, lat: first.lat, lon: first.lon, places };
}

/* The order Kevin set for the flags: English, Spanish, Chinese, German, Hindi, then the rest. */
export const LANGS: readonly Lang[] = [
  lang('en', 'English', 'ltr', [
    place('San Francisco', 'en-US', 'us', 37.7749, -122.4194),
    place('London', 'en-GB', 'gb', 51.5074, -0.1278),
    place('Sydney', 'en-AU', 'au', -33.8688, 151.2093),
    place('Toronto', 'en-CA', 'ca', 43.6532, -79.3832),
    place('Lagos', 'en-NG', 'ng', 6.5244, 3.3792),
  ]),
  lang('es', 'Español', 'ltr', [
    place('Mexico City', 'es-MX', 'mx', 19.4326, -99.1332),
    place('Madrid', 'es-ES', 'es', 40.4168, -3.7038),
    place('Buenos Aires', 'es-AR', 'ar', -34.6037, -58.3816),
    place('Bogotá', 'es-CO', 'co', 4.711, -74.0721),
  ]),
  lang('zh', '中文', 'ltr', [
    place('Beijing', 'zh-CN', 'cn', 39.9042, 116.4074),
    place('Shanghai', 'zh-CN', 'cn', 31.2304, 121.4737),
    place('Taipei', 'zh-TW', 'tw', 25.033, 121.5654),
    place('Singapore', 'zh-SG', 'sg', 1.3521, 103.8198),
  ]),
  lang('de', 'Deutsch', 'ltr', [
    place('Berlin', 'de-DE', 'de', 52.52, 13.405),
    place('Vienna', 'de-AT', 'at', 48.2082, 16.3738),
    place('Zürich', 'de-CH', 'ch', 47.3769, 8.5417),
  ]),
  lang('hi', 'हिन्दी', 'ltr', [
    place('New Delhi', 'hi-IN', 'in', 28.6139, 77.209),
    place('Lucknow', 'hi-IN', 'in', 26.8467, 80.9462),
    place('Jaipur', 'hi-IN', 'in', 26.9124, 75.7873),
  ]),
  lang('pt', 'Português', 'ltr', [
    place('São Paulo', 'pt-BR', 'br', -23.5505, -46.6333),
    place('Lisbon', 'pt-PT', 'pt', 38.7223, -9.1393),
    place('Luanda', 'pt-AO', 'ao', -8.839, 13.2894),
  ]),
  lang('ar', 'العربية', 'rtl', [
    place('Cairo', 'ar-EG', 'eg', 30.0444, 31.2357),
    place('Riyadh', 'ar-SA', 'sa', 24.7136, 46.6753),
    place('Dubai', 'ar-AE', 'ae', 25.2048, 55.2708),
    place('Casablanca', 'ar-MA', 'ma', 33.5731, -7.5898),
  ]),
  lang('ko', '한국어', 'ltr', [place('Seoul', 'ko-KR', 'kr', 37.5665, 126.978), place('Busan', 'ko-KR', 'kr', 35.1796, 129.0756)]),
  lang('ja', '日本語', 'ltr', [place('Tokyo', 'ja-JP', 'jp', 35.6762, 139.6503), place('Osaka', 'ja-JP', 'jp', 34.6937, 135.5023)]),
];

export type Localized = Record<LangCode, string>;

export const TAGLINE: Localized = {
  en: 'Essays on design, engineering and language from General Translation.',
  es: 'Ensayos sobre diseño, ingeniería y lenguaje de General Translation.',
  pt: 'Ensaios sobre design, engenharia e linguagem da General Translation.',
  de: 'Essays über Design, Engineering und Sprache von General Translation.',
  ar: 'مقالات عن التصميم والهندسة واللغة من General Translation.',
  hi: 'General Translation की ओर से डिज़ाइन, इंजीनियरिंग और भाषा पर निबंध।',
  zh: '来自 General Translation 的设计、工程与语言随笔。',
  ko: 'General Translation이 전하는 디자인, 엔지니어링, 언어에 관한 에세이.',
  ja: 'General Translation によるデザイン、エンジニアリング、言語についてのエッセイ。',
};

/** A demo built in the page that joins a figure as its first stop. */
export type LiveKind = 'toc' | 'corners' | 'hitlist' | 'globe' | 'wipe' | 'stops' | 'clerk';

/** How a story's pages are set: the docs reader, Fumadocs' own look for Fuma Nama, or a printed book for Euclid. */
export type Look = 'docs' | 'fuma' | 'book';

/** The topics the home page filters the shelf by. */
export const TOPICS = ['translation', 'open-source', 'craft'] as const;
export type Topic = (typeof TOPICS)[number];

/** Each topic as its tag reads. */
export const TOPIC_NAMES: Record<Topic, string> = { translation: 'Translation', 'open-source': 'Open Source', craft: 'Craft' };

export type StoryEntry = {
  slug: string;
  titles: Localized;
  topics: readonly Topic[];
  /** Figure id -> the live demo that opens its stops. */
  live?: Record<string, LiveKind>;
  look?: Look;
};

export const STORIES: readonly StoryEntry[] = [
  {
    slug: 'translating-euclid',
    topics: ['translation'],
    titles: {
      en: 'The first translation of Euclid’s Elements into Chinese',
      es: 'La primera traducción de los Elementos de Euclides al chino',
      pt: 'A primeira tradução dos Elementos de Euclides para o chinês',
      de: 'Die erste Übersetzung von Euklids Elementen ins Chinesische',
      ar: 'أول ترجمة لكتاب العناصر لإقليدس إلى الصينية',
      hi: 'यूक्लिड के एलिमेंट्स का चीनी में पहला अनुवाद',
      zh: '欧几里得《几何原本》的第一个中文译本',
      ko: '유클리드 『원론』의 첫 중국어 번역',
      ja: 'ユークリッド『原論』の最初の中国語訳',
    },
    live: { 'the-first-definitions-city-by-city': 'stops' },
    look: 'book',
  },
  {
    slug: 'designing-docs-for-humans',
    topics: ['craft'],
    titles: {
      en: 'Designing docs for humans',
      es: 'Diseñar documentación para personas',
      pt: 'Projetar documentação para pessoas',
      de: 'Dokumentation für Menschen gestalten',
      ar: 'تصميم التوثيق للبشر',
      hi: 'इंसानों के लिए दस्तावेज़ डिज़ाइन करना',
      zh: '为人设计文档',
      ko: '사람을 위한 문서 디자인',
      ja: '人のためのドキュメント設計',
    },
    live: {
      'H0-cover-final': 'wipe',
      'designing-docs-toc-slide': 'toc',
      'ui-primitives': 'corners',
      'E5-localized': 'globe',
      'the-hit-list': 'hitlist',
    },
  },
  {
    slug: 'rewriting-our-docs',
    topics: ['craft'],
    titles: {
      en: 'Rewriting docs for humans and agents',
      es: 'Reescribir la documentación para personas y agentes',
      pt: 'Reescrever a documentação para pessoas e agentes',
      de: 'Dokumentation für Menschen und Agenten neu schreiben',
      ar: 'إعادة كتابة التوثيق للبشر والوكلاء',
      hi: 'इंसानों और एजेंटों के लिए दस्तावेज़ दोबारा लिखना',
      zh: '为人和智能体重写文档',
      ko: '사람과 에이전트를 위한 문서 다시 쓰기',
      ja: '人とエージェントのためにドキュメントを書き直す',
    },
  },
  {
    slug: 'fuma-nama',
    topics: ['open-source', 'craft'],
    titles: {
      en: 'Fuma Nama: The philosophy of an open-sourcerer',
      es: 'Fuma Nama: la filosofía de un hechicero del código abierto',
      pt: 'Fuma Nama: a filosofia de um feiticeiro do código aberto',
      de: 'Fuma Nama: Die Philosophie eines Open-Source-Zauberers',
      ar: 'فوما ناما: فلسفة ساحر المصادر المفتوحة',
      hi: 'फ़ुमा नामा: एक ओपन-सोर्स जादूगर का दर्शन',
      zh: 'Fuma Nama：一位开源魔法师的哲学',
      ko: 'Fuma Nama: 오픈소스 마법사의 철학',
      ja: 'Fuma Nama：オープンソースの魔法使いの哲学',
    },
    live: { 'fumadocs-slider': 'clerk' },
    look: 'fuma',
  },
];

/** A place on a story's map sheet; `home` marks where the story was filed from or lived. */
export type SheetPlace = { name: string; lat: number; lon: number; home?: true };

/**
 * The map sheet printed inside a story's magazine, which the rack's lifted
 * corner shows (ui/MapSheet.tsx): its centre, how many degrees of longitude
 * it spans, its places in order, whether a route joins them, and the line
 * under its title.
 */
export type MapSheet = { lat: number; lon: number; span: number; places: readonly SheetPlace[]; route?: string; note: string };

const SAN_FRANCISCO: SheetPlace = { name: 'San Francisco', lat: 37.7749, lon: -122.4194, home: true };

export const SHEETS: Record<string, MapSheet> = {
  // Ricci's road from Macau to Peking, by the cities he stopped in
  'translating-euclid': {
    lat: 31,
    lon: 115.6,
    span: 26,
    route: 'Ricci’s road, 1582–1601',
    note: 'Macau to Peking, 1582–1601',
    places: [
      { name: 'Macau', lat: 22.1987, lon: 113.5439 },
      { name: 'Zhaoqing', lat: 23.0472, lon: 112.4651 },
      { name: 'Shaozhou', lat: 24.8104, lon: 113.5972 },
      { name: 'Nanchang', lat: 28.682, lon: 115.8579 },
      { name: 'Nanjing', lat: 32.0603, lon: 118.7969 },
      { name: 'Peking', lat: 39.9042, lon: 116.4074, home: true },
    ],
  },
  'designing-docs-for-humans': { lat: 37.5, lon: -121, span: 24, note: 'Filed from San Francisco', places: [SAN_FRANCISCO] },
  'rewriting-our-docs': { lat: 34, lon: -112, span: 60, note: 'Filed from San Francisco', places: [SAN_FRANCISCO] },
  'fuma-nama': { lat: 22.8, lon: 113.8, span: 12, note: 'Where Fuma Nama grew up', places: [{ name: 'Hong Kong', lat: 22.3193, lon: 114.1694, home: true }] },
};

/** The sheet of a story with none of its own: General Translation's home. */
export const HOME_SHEET: MapSheet = { lat: 37.5, lon: -121, span: 24, note: 'Filed from San Francisco', places: [SAN_FRANCISCO] };

/** A story's name as a magazine's credit line carries it in English, where the title is too long for one line. */
export const SHORT_TITLES: Record<string, string> = {
  'translating-euclid': 'Translating Euclid',
};

export const AUTHORS: Record<string, string> = {
  kevin: 'Kevin Liu',
  taylor: 'Taylor Fang',
  archie: 'Archie McKenzie',
  'kevin-wu': 'Kevin Wu',
  gt: 'General Translation',
};
