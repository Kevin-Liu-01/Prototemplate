/**
 * The public rates generaltranslation.com/pricing/usage renders, as text.
 *
 * Live computes them from @generaltranslation/settings (credits.ts,
 * services.ts and translation.ts) in packages/ui/src/components/pricing/
 * UsagePricing.tsx and formats them with gt-next's Currency: whole dollars
 * of $1 or more drop the cents (dollar-format.ts), the rest keep two
 * decimals, and the worked example's per-token rates keep four and eight.
 * The values below are what gt-cloud origin/main renders after #5726 (rates
 * by service type and file format: $0.50 per 1,000 input tokens for files,
 * $0.20 for live requests), #5774 (data storage at $10 per GB-month after
 * the first GB) and #5977 (the page reordered, the Visual Content workflow,
 * SVG and Lottie rates), read from those files on 2026-11-18. The format
 * rows follow live's order: the FileFormat enum without the media formats,
 * with MDX and Markdown, TypeScript and JavaScript, and PO and POT merged
 * into one row each, then the three Google formats.
 */

export const TOKENS_HELP_HREF =
  'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them';

/** The rates the copy quotes, as rendered. */
export const RATE_TEXT = {
  base: '$0.50',
  live: '$0.20',
  context: '$0.20',
  slide: '$0.50',
  svg: '$3.00',
  lottie: '$0.20',
  lcu: '$5',
  cdn: '$0.00',
  storage: '$10',
  storageIncludedGb: '1',
} as const;

/** The worked example: 1,000 input tokens, 3,000 context tokens and four slides. */
export const EXAMPLE = {
  inputTokens: '1,000',
  contextTokens: '3,000',
  slides: '4',
  baseRatePerToken: '$0.0005',
  contextRatePerToken: '$0.00000020',
  totalFiles: '$1.10',
  totalSlides: '$3.10',
} as const;

export type Rate = { label: string; cost: string; help?: string };

/** How many rows a rates table shows before its "Show more" row. */
export const PREVIEW = { formats: 4, rates: 1 } as const;

const base = (label: string, help?: string): Rate => ({ label, cost: RATE_TEXT.base, ...(help ? { help } : {}) });
const live = (label: string, help?: string): Rate => ({ label, cost: RATE_TEXT.live, ...(help ? { help } : {}) });

/** Base translation rates, per 1,000 input tokens. */
export const BASE_RATES: readonly Rate[] = [
  base('GT Content', 'Structured GT files which represent complete UI components and include additional metadata.'),
  base('JSON'),
  base('YAML'),
  base('MDX / Markdown'),
  base('TypeScript / JavaScript'),
  base('HTML'),
  base('Plain Text'),
  base('PO / POT'),
  base('Twilio Content JSON'),
  base('Lottie (.lottie)'),
  base('SVG'),
  base('iOS String Catalogs (.xcstrings)'),
  base('iOS Strings (.strings)'),
  base('iOS Plurals (.stringsdict)'),
  base('Android Strings (XML)'),
  base('Subtitles (.srt)'),
  base('.NET Resources (.resx / .resw)'),
  base('Google Slides'),
  base('Google Docs'),
  base('Google Sheets'),
];

/** Live translation rates, per 1,000 input tokens. */
export const LIVE_RATES: readonly Rate[] = [
  live('GT Content', 'JSX and React content in GT\u2019s structured format, preserving UI elements and variables.'),
  live('MDX / Markdown'),
  live('Plain Text'),
  live('ICU MessageFormat'),
  live('i18next'),
];
