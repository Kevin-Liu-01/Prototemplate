/* The press's catalog: which posts it carries and in what order, each
   title in the languages of the language slider, and the live demos that
   join a figure's recorded frames. The text itself comes from the blog's
   MDX (content.ts). */

import type { LatLon } from './coords';

export type LangCode = 'en' | 'es' | 'pt' | 'de' | 'ar' | 'hi' | 'zh' | 'ko' | 'ja';

export type Lang = LatLon & {
  code: LangCode;
  /** The language's own name. */
  name: string;
  city: string;
  dir: 'ltr' | 'rtl';
};

/* West to east, so the globe turns one way through the slider. */
export const LANGS: readonly Lang[] = [
  { code: 'en', name: 'English', city: 'San Francisco', dir: 'ltr', lat: 37.7749, lon: -122.4194 },
  { code: 'pt', name: 'Português', city: 'São Paulo', dir: 'ltr', lat: -23.5505, lon: -46.6333 },
  { code: 'es', name: 'Español', city: 'Madrid', dir: 'ltr', lat: 40.4168, lon: -3.7038 },
  { code: 'de', name: 'Deutsch', city: 'Berlin', dir: 'ltr', lat: 52.52, lon: 13.405 },
  { code: 'ar', name: 'العربية', city: 'Cairo', dir: 'rtl', lat: 30.0444, lon: 31.2357 },
  { code: 'hi', name: 'हिन्दी', city: 'New Delhi', dir: 'ltr', lat: 28.6139, lon: 77.209 },
  { code: 'zh', name: '中文', city: 'Beijing', dir: 'ltr', lat: 39.9042, lon: 116.4074 },
  { code: 'ko', name: '한국어', city: 'Seoul', dir: 'ltr', lat: 37.5665, lon: 126.978 },
  { code: 'ja', name: '日本語', city: 'Tokyo', dir: 'ltr', lat: 35.6762, lon: 139.6503 },
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
export const TOPICS = ['docs', 'design', 'open source', 'translation'] as const;
export type Topic = (typeof TOPICS)[number];

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
    live: { 'the-first-definition-city-by-city': 'stops' },
    look: 'book',
  },
  {
    slug: 'designing-docs-for-humans',
    topics: ['docs', 'design'],
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
    topics: ['docs'],
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
    topics: ['docs', 'open source'],
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

export const AUTHORS: Record<string, string> = {
  kevin: 'Kevin Liu',
  taylor: 'Taylor Fang',
  archie: 'Archie McKenzie',
  'kevin-wu': 'Kevin Wu',
  gt: 'General Translation',
};
