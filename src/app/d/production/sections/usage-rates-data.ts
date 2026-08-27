/**
 * VENDORED RATE CARD — the published usage numbers, carried over verbatim so
 * this control page derives its figures the way the real page does instead of
 * hardcoding the strings the real page happens to render today.
 *
 * The shipped page (apps/landing/src/components/pages/pricing/UsagePricingPage
 * → packages/ui/src/components/pricing/UsagePricing) reads these from the
 * @generaltranslation/settings workspace package, which this repo has no
 * access to. Only the fields UsagePricing touches are copied:
 *
 *   gt-cloud/packages/settings/src/credits.ts     — CREDITS_PER_DOLLAR,
 *     WORKFLOW_PRICING, CREDIT_RATIOS, getTranslationUnitRate and the
 *     TRANSLATION_* / LAYOUT_VISION_* constants derived from them
 *   gt-cloud/packages/settings/src/translation.ts — SUPPORTED_FILE_FORMATS
 *   gt-cloud/packages/settings/src/services.ts    — TranslationServiceType
 *
 * Nothing here is invented: change a number only when the source changes.
 */

export const CREDITS_PER_DOLLAR = 1_000_000;

/** services.ts — TRANSLATION_SERVICES */
export type TranslationServiceType =
  | 'BUILD_TIME'
  | 'RUN_TIME'
  | 'DEV_TIME'
  | 'LAYOUT_PROCESSING';

/** translation.ts — SUPPORTED_FILE_FORMATS, in source order (the table's order) */
export const SUPPORTED_FILE_FORMATS = [
  'GTJSON',
  'MDX',
  'JSON',
  'YAML',
  'MD',
  'TS',
  'JS',
  'HTML',
  'TXT',
  'PO',
  'POT',
  'TWILIO_CONTENT_JSON',
  'LOTTIE',
  'SVG',
] as const;

export type FileFormat = (typeof SUPPORTED_FILE_FORMATS)[number];

export type TranslationUnitRate = { default: number } & Partial<
  Record<FileFormat, number>
>;

/** credits.ts — WORKFLOW_PRICING, trimmed to what the usage page reads */
export const WORKFLOW_PRICING = {
  translation: {
    inputTokenBasis: 10_000,
    unitRates: {
      BUILD_TIME: { default: 10, GTJSON: 20 },
      DEV_TIME: { default: 1, GTJSON: 4 },
      RUN_TIME: { default: 1 },
      LAYOUT_PROCESSING: { default: 0 },
    },
    context: {
      contextTokenBasis: 1_000,
      usdPerInputTokenBasisPerContextTokenBasis: 0.2,
    },
    layout: {
      googleSlides: { usdPerSlide: 0.5 },
    },
  },
  locadex: { usdPerLcu: 5 },
  cdn: { usdPerRequest: 0 },
} as const satisfies {
  translation: {
    inputTokenBasis: number;
    unitRates: Record<TranslationServiceType, TranslationUnitRate>;
    context: {
      contextTokenBasis: number;
      usdPerInputTokenBasisPerContextTokenBasis: number;
    };
    layout: { googleSlides: { usdPerSlide: number } };
  };
  locadex: { usdPerLcu: number };
  cdn: { usdPerRequest: number };
};

export const TRANSLATION_UNIT_RATE_TOKEN_BASIS =
  WORKFLOW_PRICING.translation.inputTokenBasis;

export const TRANSLATION_UNIT_RATES: Record<
  TranslationServiceType,
  TranslationUnitRate
> = WORKFLOW_PRICING.translation.unitRates;

export const TRANSLATION_CONTEXT_TOKEN_BASIS =
  WORKFLOW_PRICING.translation.context.contextTokenBasis;

export const LAYOUT_VISION_PRICE_PER_SLIDE_USD =
  WORKFLOW_PRICING.translation.layout.googleSlides.usdPerSlide;

export const CREDITS_PER_LCU =
  WORKFLOW_PRICING.locadex.usdPerLcu * CREDITS_PER_DOLLAR;

export const CREDIT_RATIOS = {
  credits_per_context_token_basis:
    (WORKFLOW_PRICING.translation.context
      .usdPerInputTokenBasisPerContextTokenBasis *
      CREDITS_PER_DOLLAR) /
    TRANSLATION_UNIT_RATE_TOKEN_BASIS,
  credits_per_cdn_request:
    WORKFLOW_PRICING.cdn.usdPerRequest * CREDITS_PER_DOLLAR,
  credits_per_lcu: CREDITS_PER_LCU,
};

/**
 * Translation units charged per 10,000 input tokens for a workflow and file
 * format. Returns null when the service type is not billed.
 */
export function getTranslationUnitRate(
  translationServiceType: TranslationServiceType,
  fileFormat?: FileFormat
): number | null {
  const rates: TranslationUnitRate | undefined =
    TRANSLATION_UNIT_RATES[translationServiceType];
  if (!rates) {
    return null;
  }
  if (fileFormat !== undefined) {
    const formatRate = rates[fileFormat];
    if (formatRate !== undefined) {
      return formatRate;
    }
  }
  return rates.default;
}
