/**
 * The public rates generaltranslation.com/pricing/usage renders, as text.
 *
 * Live computes them from @generaltranslation/settings (credits.ts and
 * translation.ts) in packages/ui/src/components/pricing/UsagePricing.tsx
 * and formats them with gt-next's Currency: whole dollars of $1 or more
 * drop the cents (dollar-format.ts), the rest keep two decimals, and the
 * worked example's per-token rates keep three and eight. The values below
 * are the rendered strings of the live page, read on 2026-10-14. The
 * format rows follow live's order: SUPPORTED_FILE_FORMATS without Twilio
 * Content JSON, Lottie and SVG, with MDX and Markdown, TypeScript and
 * JavaScript, and PO and POT merged into one row each.
 */

export const TOKENS_HELP_HREF =
  'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them';

/** The rates the copy quotes, as rendered. */
export const RATE_TEXT = {
  base: '$1.00',
  context: '$0.02',
  slide: '$0.50',
  lcu: '$5',
  cdn: '$0.00',
  storage: '$0.00',
} as const;

/** The worked example: 1,000 input tokens, 3,000 context tokens and four slides. */
export const EXAMPLE = {
  inputTokens: '1,000',
  contextTokens: '3,000',
  slides: '4',
  baseRatePerToken: '$0.001',
  contextRatePerToken: '$0.00000002',
  totalFiles: '$1.06',
  totalSlides: '$3.06',
} as const;

type Rate = { label: string; cost: string; help?: string };

/** Base translation rates, per 1,000 input tokens. */
export const BASE_RATES: readonly Rate[] = [
  {
    label: 'GT Content Files',
    cost: '$2',
    help: 'Structured GT files which represent complete UI components and include additional metadata.',
  },
  { label: 'MDX / Markdown', cost: '$1' },
  { label: 'JSON', cost: '$1' },
  { label: 'YAML', cost: '$1' },
  { label: 'TypeScript / JavaScript', cost: '$1' },
  { label: 'HTML', cost: '$1' },
  { label: 'Plain Text', cost: '$1' },
  { label: 'PO / POT', cost: '$1' },
  { label: 'iOS String Catalogs (.xcstrings)', cost: '$1' },
  { label: 'iOS Strings (.strings)', cost: '$1' },
  { label: 'iOS Plurals (.stringsdict)', cost: '$1' },
  { label: 'Android Strings (XML)', cost: '$1' },
  { label: 'Subtitles (.srt)', cost: '$1' },
  { label: '.NET Resources (.resx)', cost: '$1' },
  { label: 'Google Slides', cost: '$1' },
];

/** Live translation rates, per 1,000 input tokens. */
export const LIVE_RATES: readonly Required<Rate>[] = [
  {
    label: 'GT Runtime',
    cost: '$0.40',
    help: 'Translations generated on demand when dynamic content is requested.',
  },
  {
    label: 'GT Devtime',
    cost: '$0.40',
    help: 'Translations generated during local development for immediate feedback.',
  },
];
