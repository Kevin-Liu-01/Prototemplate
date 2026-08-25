'use client';

import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import {
  ArrowLeft,
  Coins,
  FileText,
  Gauge,
  HelpCircle,
  Plus,
  Presentation,
  ScanText,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  CREDIT_RATIOS,
  CREDITS_PER_DOLLAR,
  LAYOUT_VISION_PRICE_PER_SLIDE_USD,
  SUPPORTED_FILE_FORMATS,
  TRANSLATION_CONTEXT_TOKEN_BASIS,
  TRANSLATION_UNIT_RATE_TOKEN_BASIS,
  getTranslationUnitRate,
} from './usage-rates-data';
import type { FileFormat, TranslationServiceType } from './usage-rates-data';

import './usage-rates.css';

/**
 * PRODUCTION — /pricing/usage, the shipped usage-rates page.
 *
 * A reproduction, not a proposal: the same four rate tables in the same
 * order with the same rows and the same published figures, the same
 * formula card with its Files / Google Slides toggle and its worked
 * example, and the real page's own copy throughout.
 *
 * Mirrors, one to one:
 *   apps/landing/src/components/pages/pricing/UsagePricingPage.tsx
 *     (the back link, the hero, the content wrapper)
 *   packages/ui/src/components/pricing/UsagePricing.tsx
 *     (everything inside the content wrapper)
 *
 * Two substitutions, both forced by this repo's constraints and neither
 * changing what a reader sees: the rate constants are vendored (see
 * usage-rates-data.ts) instead of imported from the settings package, and
 * gt-next's <Currency>/<Num>/<T> become plain Intl formatting of the
 * English strings. The shadcn table/button/tooltip primitives — absent
 * here — are redrawn in usage-rates.css against the same design tokens.
 */

const DISPLAY_TOKEN_BASIS = 1_000;
const DISPLAY_CONTEXT_TOKEN_BASIS = TRANSLATION_CONTEXT_TOKEN_BASIS;
const TOKENS_HELP_HREF =
  'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them';

/* gt-next's <Num> and <Currency>, reduced to the fixed shapes this page
   asks for. The locale is pinned: the control renders the English page. */
const NUMBER = new Intl.NumberFormat('en-US');
const usd = (digits: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
const USD_2 = usd(2);
const USD_3 = usd(3);
const USD_8 = usd(8);
/* the shared <Dollar>: 0–2 fraction digits, so $2 / $0.1 / $0 stay short */
const DOLLAR = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const MERGED_FORMAT_GROUPS: FileFormat[][] = [
  ['MDX', 'MD'],
  ['TS', 'JS'],
  ['PO', 'POT'],
];
const FORMAT_GROUP_BY_MEMBER = new Map<FileFormat, FileFormat[]>(
  MERGED_FORMAT_GROUPS.flatMap((group) =>
    group.map((format) => [format, group] as const)
  )
);
const FORMATS: { formats: FileFormat[] }[] = (() => {
  const rows: { formats: FileFormat[] }[] = [];
  const seen = new Set<FileFormat>();
  for (const format of SUPPORTED_FILE_FORMATS) {
    if (
      format === 'TWILIO_CONTENT_JSON' ||
      format === 'LOTTIE' ||
      format === 'SVG'
    )
      continue;
    if (seen.has(format)) continue;
    const group = FORMAT_GROUP_BY_MEMBER.get(format) ?? [format];
    group.forEach((member) => seen.add(member));
    rows.push({ formats: group });
  }
  return rows;
})();

const FORMAT_LABELS = new Map<FileFormat, string>([
  ['GTJSON', 'GT Content Files'],
  ['MDX', 'MDX'],
  ['JSON', 'JSON'],
  ['YAML', 'YAML'],
  ['MD', 'Markdown'],
  ['TS', 'TypeScript'],
  ['JS', 'JavaScript'],
  ['HTML', 'HTML'],
  ['TXT', 'Plain Text'],
  ['PO', 'PO'],
  ['POT', 'POT'],
  ['TWILIO_CONTENT_JSON', 'Twilio Content JSON'],
]);

const LIVE_WORKFLOWS: {
  id: 'runtime' | 'devtime';
  serviceType: TranslationServiceType;
  name: string;
  description: string;
}[] = [
  {
    id: 'runtime',
    serviceType: 'RUN_TIME',
    name: 'GT Runtime',
    description:
      'Translations generated on demand when dynamic content is requested.',
  },
  {
    id: 'devtime',
    serviceType: 'DEV_TIME',
    name: 'GT Devtime',
    description:
      'Translations generated during local development for immediate feedback.',
  },
];

/* ---------- the tooltip, redrawn ----------
   The shipped page uses the shared PricingHelpTooltip: radix, hover and
   focus to open, a click to pin, and a scroll to let a pinned one go.
   Same behaviour without radix — and, as radix does, the chip is placed
   in the viewport rather than in flow, so the table wrapper's and the
   formula card's `overflow: hidden` cannot clip it. */

type TipAnchor = { top: number; left: number };

const TIP_HALF_WIDTH = 115;
const TIP_EDGE_GUTTER = 12;

function useTipAnchor() {
  const ref = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState<TipAnchor | null>(null);

  /* a pinned chip would drift away from its trigger on scroll; the
     shipped tooltip closes instead, so this one does too */
  useMountEffect(() => {
    const close = () => setAnchor(null);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  });

  const show = (next: boolean) => {
    const trigger = ref.current;
    if (!next || !trigger) {
      setAnchor(null);
      return;
    }
    const box = trigger.getBoundingClientRect();
    const centre = box.left + box.width / 2;
    setAnchor({
      top: box.top,
      left: Math.min(
        Math.max(centre, TIP_HALF_WIDTH + TIP_EDGE_GUTTER),
        window.innerWidth - TIP_HALF_WIDTH - TIP_EDGE_GUTTER
      ),
    });
  };

  return { ref, anchor, show };
}

function TipChip({ anchor, children }: { anchor: TipAnchor; children: ReactNode }) {
  return (
    <span
      className='pu-tip'
      role='tooltip'
      style={{ top: `${anchor.top}px`, left: `${anchor.left}px` }}
    >
      {children}
    </span>
  );
}

function UsageTip({
  children,
  label = 'More information',
}: {
  children: ReactNode;
  label?: string;
}) {
  const { ref, anchor, show } = useTipAnchor();
  return (
    <span className='pu-tip-host'>
      <button
        ref={ref}
        type='button'
        aria-label={label}
        className='pu-tip-btn'
        onPointerEnter={() => show(true)}
        onPointerLeave={() => show(false)}
        onFocus={() => show(true)}
        onBlur={() => show(false)}
        onClick={() => show(anchor === null)}
      >
        <HelpCircle aria-hidden className='pu-tip-mark' strokeWidth={1.8} />
      </button>
      {anchor ? <TipChip anchor={anchor}>{children}</TipChip> : null}
    </span>
  );
}

/** A formula chip that is itself the tooltip trigger (the numbered terms). */
function UsageTipChip({
  tip,
  badge,
  icon: Icon,
  label,
  children,
}: {
  tip: ReactNode;
  badge?: string;
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  const { ref, anchor, show } = useTipAnchor();
  return (
    <span className='pu-tip-host'>
      <button
        ref={ref}
        type='button'
        className='pu-term pu-term-tip'
        data-badged={badge ? true : undefined}
        onPointerEnter={() => show(true)}
        onPointerLeave={() => show(false)}
        onFocus={() => show(true)}
        onBlur={() => show(false)}
        onClick={() => show(anchor === null)}
      >
        <Icon className='pu-term-mark' aria-hidden />
        <span className='pu-sr'>{label}</span>
        <span className='pu-term-value pu-term-dotted'>{children}</span>
        {badge ? <span className='pu-badge pu-badge-pin'>{badge}</span> : null}
      </button>
      {anchor ? <TipChip anchor={anchor}>{tip}</TipChip> : null}
    </span>
  );
}

function FormulaTerm({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className='pu-term'>
      <Icon className='pu-term-mark' aria-hidden />
      <span className='pu-term-label'>{children}</span>
    </div>
  );
}

function OpeningFormulaParenthesis() {
  return (
    <svg
      className='pu-paren'
      viewBox='0 0 16 100'
      preserveAspectRatio='none'
      aria-hidden
    >
      <path
        d='M14 1C5 16 2 33 2 50S5 84 14 99'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='1.5'
        vectorEffect='non-scaling-stroke'
      />
    </svg>
  );
}

function ClosingFormulaParenthesis() {
  return (
    <svg
      className='pu-paren'
      viewBox='0 0 16 100'
      preserveAspectRatio='none'
      aria-hidden
    >
      <path
        d='M2 1C11 16 14 33 14 50S11 84 2 99'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='1.5'
        vectorEffect='non-scaling-stroke'
      />
    </svg>
  );
}

/** "Per 1,000 input tokens" — the right-hand gauge on two table heads. */
function PerThousandTokens() {
  return (
    <span className='pu-gauge'>
      Per {NUMBER.format(DISPLAY_TOKEN_BASIS)} input{' '}
      <a href={TOKENS_HELP_HREF} target='_blank' rel='noopener noreferrer'>
        tokens
      </a>
    </span>
  );
}

/** The context surcharge, written the same way in two places. */
function ContextSurcharge({ rate }: { rate: number }) {
  return (
    <>
      + {USD_2.format(rate)} per {NUMBER.format(DISPLAY_TOKEN_BASIS)} input
      tokens per {NUMBER.format(DISPLAY_CONTEXT_TOKEN_BASIS)} context tokens
    </>
  );
}

export default function UsageRates() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  const [isSlidesWorkflow, setIsSlidesWorkflow] = useState(false);

  const rateDivisor = TRANSLATION_UNIT_RATE_TOKEN_BASIS / DISPLAY_TOKEN_BASIS;
  const contextRateForDisplayBasis =
    (CREDIT_RATIOS.credits_per_context_token_basis * DISPLAY_TOKEN_BASIS) /
    CREDITS_PER_DOLLAR;
  const exampleInputTokens = 1_000;
  const exampleContextTokens = 3_000;
  const exampleSlides = 4;
  const slideBaseRate =
    (getTranslationUnitRate('BUILD_TIME', 'MD') ?? 0) / rateDivisor;
  const exampleBaseRate = slideBaseRate;
  const exampleBaseRatePerToken = exampleBaseRate / DISPLAY_TOKEN_BASIS;
  const contextRatePerInputAndContextToken =
    contextRateForDisplayBasis /
    DISPLAY_TOKEN_BASIS /
    DISPLAY_CONTEXT_TOKEN_BASIS;
  const exampleBasePrice = exampleInputTokens * exampleBaseRatePerToken;
  const exampleContextPrice =
    exampleInputTokens *
    exampleContextTokens *
    contextRatePerInputAndContextToken;
  const exampleSlidesPrice = exampleSlides * LAYOUT_VISION_PRICE_PER_SLIDE_USD;
  const exampleTotal =
    exampleBasePrice +
    exampleContextPrice +
    (isSlidesWorkflow ? exampleSlidesPrice : 0);

  return (
    <section className='tc-sec pu-page'>
      <div className='pu-back'>
        <a href={`${base}/pricing`}>
          <ArrowLeft className='pu-back-mark' aria-hidden />
          Back to Pricing
        </a>
      </div>

      <header className='pu-hero'>
        <div className='pu-hero-inner'>
          <h1>Usage rates</h1>
          <p>
            Usage-based pricing for General Translation&apos;s standard
            workflows.
            <br />
            <a className='pu-hero-link' href={`${base}/enterprise/contact`}>
              Contact us
            </a>{' '}
            for custom pricing.
          </p>
        </div>
      </header>

      <div className='pu-content'>
        <div className='pu-stack'>
          {/* ---- rates + formula ----
              DOM order follows the shipped component: the formula card is
              written first and the three rate tables carry `order-first`,
              so the tables read above the formula. Reproduced here with
              the same trick (.pu-rates takes the leading order slot). */}
          <section className='pu-sec'>
            <div className='pu-formula-head'>
              <h2>Formula</h2>
            </div>

            <div className='pu-formula'>
              <div className='pu-formula-bar'>
                <span className='pu-formula-bar-label'>
                  Translation workflows for...
                </span>
                <div
                  className='pu-seg'
                  role='group'
                  aria-label='Translation type'
                >
                  <button
                    type='button'
                    className='pu-btn'
                    data-variant={isSlidesWorkflow ? 'outline' : 'default'}
                    aria-pressed={!isSlidesWorkflow}
                    onClick={() => setIsSlidesWorkflow(false)}
                  >
                    <FileText className='pu-btn-mark' aria-hidden />
                    Files
                  </button>
                  <button
                    type='button'
                    className='pu-btn'
                    data-variant={isSlidesWorkflow ? 'default' : 'outline'}
                    aria-pressed={isSlidesWorkflow}
                    onClick={() => setIsSlidesWorkflow(true)}
                  >
                    <Presentation className='pu-btn-mark' aria-hidden />
                    Google Slides
                  </button>
                </div>
              </div>

              <div className='pu-formula-body'>
                <div className='pu-row'>
                  <FormulaTerm icon={Coins}>Input tokens</FormulaTerm>
                  <X className='pu-op' strokeWidth={2.5} aria-hidden />
                  <div className='pu-group'>
                    <OpeningFormulaParenthesis />
                    <div className='pu-group-inner'>
                      <FormulaTerm icon={Gauge}>Base workflow rate</FormulaTerm>
                      <Plus className='pu-op' strokeWidth={2.5} aria-hidden />
                      <FormulaTerm icon={ScanText}>Context rate</FormulaTerm>
                    </div>
                    <ClosingFormulaParenthesis />
                  </div>
                  {isSlidesWorkflow ? (
                    <>
                      <Plus className='pu-op' strokeWidth={2.5} aria-hidden />
                      <div className='pu-group'>
                        <OpeningFormulaParenthesis />
                        <div className='pu-group-inner'>
                          <FormulaTerm icon={Presentation}>
                            Number of slides
                          </FormulaTerm>
                          <X
                            className='pu-op'
                            strokeWidth={2.5}
                            aria-hidden
                          />
                          <FormulaTerm icon={Gauge}>Per-slide rate</FormulaTerm>
                        </div>
                        <ClosingFormulaParenthesis />
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <details className='pu-example'>
                <summary>
                  <span className='pu-example-show'>See example</span>
                  <span className='pu-example-hide'>Hide example</span>
                </summary>

                <div className='pu-example-head'>
                  <div className='pu-example-title'>
                    <span className='pu-example-name'>
                      {isSlidesWorkflow
                        ? 'Google Slides example'
                        : 'Markdown example'}
                    </span>
                    <span className='pu-example-note'>
                      {isSlidesWorkflow
                        ? 'One Google Slides deck translated with Platform Context'
                        : 'One Markdown file translated with Platform Context'}
                    </span>
                  </div>
                  <div className='pu-example-facts'>
                    <span className='pu-fact'>
                      <Coins className='pu-fact-mark' aria-hidden />
                      <span className='pu-fact-value'>
                        {NUMBER.format(exampleInputTokens)}
                      </span>
                      {isSlidesWorkflow
                        ? 'slide input tokens'
                        : 'Markdown input tokens'}
                    </span>
                    <span className='pu-fact'>
                      <ScanText className='pu-fact-mark' aria-hidden />
                      <span className='pu-fact-value'>
                        {NUMBER.format(exampleContextTokens)}
                      </span>
                      context tokens
                    </span>
                    {isSlidesWorkflow ? (
                      <span className='pu-fact'>
                        <Presentation className='pu-fact-mark' aria-hidden />
                        <span className='pu-fact-value'>
                          {NUMBER.format(exampleSlides)}
                        </span>
                        slides
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className='pu-example-body'>
                  <div className='pu-row'>
                    <div className='pu-term'>
                      <Coins className='pu-term-mark' aria-hidden />
                      <span className='pu-sr'>Input tokens</span>
                      <span className='pu-term-value'>
                        {NUMBER.format(exampleInputTokens)}
                      </span>
                    </div>
                    <X className='pu-op' strokeWidth={2.5} aria-hidden />
                    <div className='pu-group'>
                      <OpeningFormulaParenthesis />
                      <div className='pu-group-inner'>
                        <UsageTipChip
                          icon={Gauge}
                          label='Base workflow rate'
                          badge='1'
                          tip={
                            <>
                              The base translation rate is{' '}
                              {USD_2.format(exampleBaseRate)} per{' '}
                              {NUMBER.format(DISPLAY_TOKEN_BASIS)} input tokens.
                            </>
                          }
                        >
                          {USD_3.format(exampleBaseRatePerToken)}
                        </UsageTipChip>
                        <Plus className='pu-op' strokeWidth={2.5} aria-hidden />
                        <UsageTipChip
                          icon={ScanText}
                          label='Context rate'
                          badge='2'
                          tip={
                            <>
                              Platform Context costs{' '}
                              {USD_2.format(contextRateForDisplayBasis)} per{' '}
                              {NUMBER.format(DISPLAY_TOKEN_BASIS)} input tokens
                              per {NUMBER.format(DISPLAY_CONTEXT_TOKEN_BASIS)}{' '}
                              context tokens.
                            </>
                          }
                        >
                          {NUMBER.format(exampleContextTokens)} &times;{' '}
                          {USD_8.format(contextRatePerInputAndContextToken)}
                        </UsageTipChip>
                      </div>
                      <ClosingFormulaParenthesis />
                    </div>
                    {isSlidesWorkflow ? (
                      <>
                        <Plus className='pu-op' strokeWidth={2.5} aria-hidden />
                        <div className='pu-group'>
                          <OpeningFormulaParenthesis />
                          <div className='pu-group-inner'>
                            <UsageTipChip
                              icon={Presentation}
                              label='Number of slides'
                              tip={<>Number of slides in this example.</>}
                            >
                              {NUMBER.format(exampleSlides)}
                            </UsageTipChip>
                            <X
                              className='pu-op'
                              strokeWidth={2.5}
                              aria-hidden
                            />
                            <UsageTipChip
                              icon={Gauge}
                              label='Per-slide rate'
                              badge='3'
                              tip={
                                <>
                                  Adds{' '}
                                  {USD_2.format(
                                    LAYOUT_VISION_PRICE_PER_SLIDE_USD
                                  )}{' '}
                                  for every slide, on top of token and context
                                  charges.
                                </>
                              }
                            >
                              {USD_2.format(LAYOUT_VISION_PRICE_PER_SLIDE_USD)}
                            </UsageTipChip>
                          </div>
                          <ClosingFormulaParenthesis />
                        </div>
                      </>
                    ) : null}
                    <span className='pu-equals'>=</span>
                    <span className='pu-total'>
                      {USD_2.format(exampleTotal)}
                    </span>
                  </div>

                  <div className='pu-footnotes'>
                    <span className='pu-footnote'>
                      <span className='pu-badge'>1</span>$1 per 1,000 input
                      tokens
                    </span>
                    <span className='pu-footnote pu-footnote-top'>
                      <span className='pu-badge'>2</span>
                      <span>
                        +{USD_2.format(contextRateForDisplayBasis)} per{' '}
                        {NUMBER.format(DISPLAY_TOKEN_BASIS)} input tokens per{' '}
                        {NUMBER.format(DISPLAY_CONTEXT_TOKEN_BASIS)} context
                        tokens
                      </span>
                    </span>
                    {isSlidesWorkflow ? (
                      <span className='pu-footnote'>
                        <span className='pu-badge'>3</span>
                        <span>
                          <span className='pu-nums'>
                            +
                            {USD_2.format(LAYOUT_VISION_PRICE_PER_SLIDE_USD)}
                          </span>{' '}
                          per slide
                        </span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </details>
            </div>

            <div className='pu-rates'>
              {/* ---- base translation rates ---- */}
              <div className='pu-table-head'>
                <h2 id='base-translation-rates'>Base translation rates</h2>
                <PerThousandTokens />
              </div>

              <div className='pu-table-wrap'>
                <table className='pu-table'>
                  <thead>
                    <tr>
                      <th className='pu-col-label'>Format</th>
                      {/* Eventually split this cost column into Flagship
                          workflows (full context, trying our hardest for
                          maximum quality) and Economy workflows (high-volume
                          use cases where cost is more important). */}
                      <th className='pu-col-cost'>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FORMATS.map(({ formats }) => {
                      const isGtLibraries = formats.includes('GTJSON');
                      const formatLabel = formats
                        .map((format) => FORMAT_LABELS.get(format) ?? format)
                        .join(' / ');
                      return (
                        <tr key={formats.join('-')}>
                          <td>
                            <div className='pu-cell-row'>
                              <span>{formatLabel}</span>
                              {isGtLibraries ? (
                                <UsageTip>
                                  Structured GT files which represent complete
                                  UI components and include additional
                                  metadata.
                                </UsageTip>
                              ) : null}
                            </div>
                          </td>
                          <td className='pu-cost'>
                            {DOLLAR.format(
                              (getTranslationUnitRate(
                                'BUILD_TIME',
                                formats[0]
                              ) ?? 0) / rateDivisor
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td>Google Slides</td>
                      <td className='pu-cost'>
                        {DOLLAR.format(slideBaseRate)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ---- live translation rates ---- */}
              <div className='pu-block'>
                <div className='pu-table-head'>
                  <h2 id='live-translation-rates'>Live translation rates</h2>
                  <PerThousandTokens />
                </div>
                <div className='pu-table-wrap'>
                  <table className='pu-table'>
                    <thead>
                      <tr>
                        <th className='pu-col-label'>Format</th>
                        <th className='pu-col-cost'>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LIVE_WORKFLOWS.map((workflow) => (
                        <tr key={workflow.id}>
                          <td>
                            {/* inline-flex, as the shipped cell is: the
                                name and its help mark stay on one line */}
                            <span className='pu-cell-row is-inline'>
                              {workflow.name}
                              <UsageTip>{workflow.description}</UsageTip>
                            </span>
                          </td>
                          <td className='pu-cost'>
                            {DOLLAR.format(
                              (getTranslationUnitRate(
                                workflow.serviceType,
                                'GTJSON'
                              ) ?? 0) / rateDivisor
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ---- additional rates ---- */}
              <div className='pu-block'>
                <div className='pu-table-head'>
                  <h2 id='additional-rates'>Additional rates</h2>
                </div>
                <div className='pu-table-wrap'>
                  <table className='pu-table'>
                    <thead>
                      <tr>
                        <th className='pu-col-label'>Feature</th>
                        <th className='pu-col-cost'>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className='pu-cell-row'>
                            <span>GT Platform Context</span>
                            <UsageTip>
                              Platform Context includes the glossary terms and
                              directives applied to your project to guide
                              terminology, tone, and style.
                            </UsageTip>
                          </div>
                        </td>
                        <td className='pu-cost'>
                          <ContextSurcharge rate={contextRateForDisplayBasis} />
                        </td>
                      </tr>
                      <tr>
                        <td>Google Slides</td>
                        <td className='pu-cost'>
                          + {USD_2.format(LAYOUT_VISION_PRICE_PER_SLIDE_USD)} /
                          slide
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <div className='pu-rule' role='separator' />

          {/* ---- agent workflows ---- */}
          <section className='pu-sec'>
            <div className='pu-sec-head'>
              <h2>Agent workflows</h2>
              <p>
                Locadex is a localization cloud agent. It connects your GitHub,
                CMS, and other systems with General Translation APIs to automate
                localization from end-to-end.
              </p>
            </div>
            <div className='pu-table-wrap'>
              <table className='pu-table'>
                <thead>
                  <tr>
                    <th className='pu-col-label'>Format</th>
                    <th className='pu-col-cost'>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className='pu-cell-row'>
                        <span aria-hidden className='pu-locadex-mark' />
                        <span>Locadex Compute Unit (LCU)</span>
                        <UsageTip>
                          Locadex Compute Units (LCUs) meter the resource costs
                          for an agent to run end-to-end.
                        </UsageTip>
                      </div>
                    </td>
                    <td className='pu-cost'>
                      {DOLLAR.format(
                        CREDIT_RATIOS.credits_per_lcu / CREDITS_PER_DOLLAR
                      )}{' '}
                      / LCU
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className='pu-rule' role='separator' />

          {/* ---- data rates ---- */}
          <section className='pu-sec'>
            <h2>Data rates</h2>
            <div className='pu-table-wrap'>
              <table className='pu-table'>
                <thead>
                  <tr>
                    <th className='pu-col-label'>Feature</th>
                    <th className='pu-col-cost'>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Translation CDN</td>
                    <td className='pu-cost'>
                      {DOLLAR.format(
                        CREDIT_RATIOS.credits_per_cdn_request /
                          CREDITS_PER_DOLLAR
                      )}{' '}
                      / request
                    </td>
                  </tr>
                  <tr>
                    <td>Data Storage</td>
                    <td className='pu-cost'>{DOLLAR.format(0)} / GB-month</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
