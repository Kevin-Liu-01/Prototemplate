/** Shared, purely static copy for the Typographic Broadcast direction. */

export const FLAGS: ReadonlyArray<readonly [string, string]> = [
  ['es', 'Español'],
  ['fr', 'Français'],
  ['jp', '日本語'],
  ['de', 'Deutsch'],
  ['cn', '中文'],
  ['kr', '한국어'],
  ['br', 'Português'],
  ['it', 'Italiano'],
  ['in', 'हिन्दी'],
  ['sa', 'العربية'],
  ['ru', 'Русский'],
  ['nl', 'Nederlands'],
  ['pl', 'Polski'],
  ['tr', 'Türkçe'],
  ['vn', 'Tiếng Việt'],
  ['th', 'ไทย'],
  ['se', 'Svenska'],
  ['il', 'עברית'],
  ['id', 'Bahasa'],
  ['gr', 'Ελληνικά'],
];

export const TRUSTED_BY = ['Cursor', 'Ramp', 'Mintlify', 'Profound', 'Partiful', 'ClickHouse'];

/** Scripts that orbit the shared LanguageWheel in the hero. */
export const WHEEL_GLYPHS = '語한文عñßЖ中れ글अй字ه日ट';

export const STATS: ReadonlyArray<readonly [string, string]> = [
  ['118', 'languages'],
  ['1,000,000,000', 'next users'],
  ['6', 'frameworks'],
  ['$0', 'to start'],
];

/** Dock captions for the shared story — one plain sentence per beat. */
export const DOCK_CAPTIONS = [
  'gt helps you…',
  'GT knows your context.',
  'GT does your translating.',
  'Around any component.',
  'With your own context.',
  'With your review.',
  'This is where Locadex comes in.',
  'Code is pushed. Locadex scans.',
  'Locadex maps what changed.',
  'It edits code — and translates in context.',
  '…and opens the PR. Review, merge, live.',
];

export const HERO_ROTATION = [
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Chinese',
  'Portuguese',
  'Korean',
  'Italian',
  'Hindi',
  'Arabic',
];

export const CTA_ROTATION = ['every language', 'español', 'français', '日本語', 'Deutsch', '中文', '한국어'];
