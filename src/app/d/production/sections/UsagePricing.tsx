'use client';

import {
  CircleStackIcon as CircleStackMicroIcon,
  DocumentMagnifyingGlassIcon as DocumentMagnifyingGlassMicroIcon,
  PhotoIcon as PhotoMicroIcon,
} from '@heroicons/react/16/solid';
import {
  CircleStackIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  PhotoIcon,
  TagIcon,
} from '@heroicons/react/24/solid';
import { ChevronDown, Plus, X } from 'lucide-react';
import { useId, useState, type ComponentType, type ReactNode, type SVGProps } from 'react';

import PricingHelp from './PricingHelp';
import {
  BASE_RATES,
  EXAMPLE,
  LIVE_RATES,
  PREVIEW,
  RATE_TEXT,
  TOKENS_HELP_HREF,
  type Rate,
} from './usage-rates-data';

/**
 * The shipped usage rates body: gt-cloud packages/ui/src/components/
 * pricing/UsagePricing.tsx, which /pricing/usage mounts, as of #5977. The
 * DOM keeps its order and grouping (Base and Additional rates, then the
 * Formula card, then the Live translation rates, Agent workflows and Data
 * rates sections between rail-wide separators; the long tables show their
 * first rows and a "Show more" row, with every rate in the server HTML),
 * and usage-pricing.css restates its Tailwind and shadcn classes under
 * .usage-pricing-root.
 *
 * Two departures. The rates are the values the live page renders, held in
 * usage-rates-data.ts instead of computed from @generaltranslation/settings.
 * The help bubbles are the mirror's CSS bubble (PricingHelp): hover and
 * focus open them, and a click keeps one open while its trigger holds
 * focus, where live pins a Radix tooltip in a portal.
 */

function FormulaTerm({
  icon: Icon,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
}) {
  return (
    <div className='up-term'>
      <Icon aria-hidden className='up-emph' />
      <span>{children}</span>
    </div>
  );
}

function Paren({ side }: { side: 'open' | 'close' }) {
  return (
    <svg aria-hidden className='up-paren' preserveAspectRatio='none' viewBox='0 0 16 100'>
      <path
        d={side === 'open' ? 'M14 1C5 16 2 33 2 50S5 84 14 99' : 'M2 1C11 16 14 33 14 50S11 84 2 99'}
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='1.5'
        vectorEffect='non-scaling-stroke'
      />
    </svg>
  );
}

const Times = () => <X aria-hidden className='up-op' strokeWidth={2.5} />;
const PlusSign = () => <Plus aria-hidden className='up-op' strokeWidth={2.5} />;

/** A numbered chip of the worked example; its bubble explains the number. */
function ExampleChip({
  icon: Icon,
  label,
  value,
  badge,
  tip,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: ReactNode;
  badge?: number;
  tip: ReactNode;
}) {
  return (
    <PricingHelp
      trigger={(describedBy) => (
        <button aria-describedby={describedBy} className={badge ? 'up-chip has-badge' : 'up-chip'} type='button'>
          <Icon aria-hidden className='up-emph' />
          <span className='up-sr'>{label}</span>
          <span className='up-chip-value'>{value}</span>
          {badge ? <span className='up-badge up-chip-badge'>{badge}</span> : null}
        </button>
      )}
    >
      <span>{tip}</span>
    </PricingHelp>
  );
}

/** The two-column rate table every section uses: a label column at 34% and a centred cost column; past `preview` rows the rest stay in the HTML, hidden until the "Show more" row opens them. */
function RateTable({
  head,
  rows,
  preview,
  kind,
}: {
  head: string;
  rows: readonly { key: string; label: ReactNode; cost: ReactNode }[];
  preview?: number;
  kind?: 'formats' | 'rates';
}) {
  const rowsId = useId();
  const [open, setOpen] = useState(false);
  const more = preview === undefined ? 0 : rows.length - preview;
  const noun = kind === 'formats' ? 'format' : 'rate';
  return (
    <div className='up-table-wrap'>
      <table className='up-table'>
        <thead>
          <tr>
            <th className='up-label-col'>{head}</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody id={rowsId}>
          {rows.map((row, index) => (
            <tr key={row.key} hidden={!open && preview !== undefined && index >= preview}>
              <td>{row.label}</td>
              <td>{row.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {more > 0 ? (
        <button aria-controls={rowsId} aria-expanded={open} className='up-more' type='button' onClick={() => setOpen(!open)}>
          {open ? `Show fewer ${noun}s` : `Show ${more} more ${more === 1 ? noun : `${noun}s`}`}
          <ChevronDown aria-hidden className={open ? 'is-open' : undefined} />
        </button>
      ) : null}
    </div>
  );
}

/** A rate's label cell, with its help bubble when it has one. */
const rateLabel = (rate: Rate) => (
  <span className='up-cell-row'>
    <span>{rate.label}</span>
    {rate.help ? <PricingHelp>{rate.help}</PricingHelp> : null}
  </span>
);

function PerTokens() {
  return (
    <span className='up-per'>
      Per 1,000 input{' '}
      <a href={TOKENS_HELP_HREF} rel='noopener noreferrer' target='_blank'>
        tokens
      </a>
    </span>
  );
}

export default function UsagePricing() {
  const [slides, setSlides] = useState(false);

  return (
    <div className='up-body'>
      <section className='up-section'>
        <div className='up-rates'>
          <div className='up-head-row'>
            <h2 id='base-translation-rates'>Base translation rates</h2>
            <PerTokens />
          </div>
          <p className='up-lead'>
            Translations produced for uploaded files of any filetype. Charges only apply for new content. Previously
            translated content is free.
          </p>
          <RateTable
            head='Format'
            kind='formats'
            preview={PREVIEW.formats}
            rows={BASE_RATES.map((rate) => ({ key: rate.label, label: rateLabel(rate), cost: rate.cost }))}
          />

          <div className='up-subsection'>
            <h2 id='additional-rates'>Additional rates</h2>
            <RateTable
              head='Feature'
              kind='rates'
              preview={PREVIEW.rates}
              rows={[
                {
                  key: 'context',
                  label: (
                    <span className='up-cell-row'>
                      <span>GT Context</span>
                      <PricingHelp>
                        Context includes the glossary terms and directives applied to your project to guide
                        terminology, tone, and style, plus any metadata uploaded alongside individual translation
                        requests, such as the{' '}
                        <a href='https://generaltranslation.com/docs/react/reference/components/t#context' rel='noopener noreferrer' target='_blank'>
                          context prop
                        </a>{' '}
                        component.
                      </PricingHelp>
                    </span>
                  ),
                  cost: `+ ${RATE_TEXT.context} per 1,000 input tokens per 1,000 context tokens`,
                },
                { key: 'slides', label: 'Google Slides', cost: `+ ${RATE_TEXT.slide} / slide` },
                { key: 'svg', label: 'SVG', cost: `+ ${RATE_TEXT.svg} / graphic` },
                {
                  key: 'lottie',
                  label: rateLabel({
                    label: 'Lottie',
                    cost: '',
                    help: 'Layout processing is charged per animated property (transition), in addition to token and context charges.',
                  }),
                  cost: `+ ${RATE_TEXT.lottie} / transition`,
                },
              ]}
            />
          </div>
        </div>

        <div className='up-formula-wrap'>
        <div className='up-formula-head'>
          <h2>Formula</h2>
          </div>

          <div className='up-formula'>
          <div className='up-formula-bar'>
            <span className='up-strong'>Translation workflows for:</span>
            <div aria-label='Translation type' className='up-toggle' role='group'>
              <button
                aria-pressed={!slides}
                className={slides ? 'up-btn is-outline' : 'up-btn'}
                type='button'
                onClick={() => setSlides(false)}
              >
                <DocumentTextIcon aria-hidden />
                Files
              </button>
              <button
                aria-pressed={slides}
                className={slides ? 'up-btn' : 'up-btn is-outline'}
                type='button'
                onClick={() => setSlides(true)}
              >
                <PhotoIcon aria-hidden />
                Visual Content
              </button>
            </div>
          </div>

          <div className='up-formula-body'>
            <div className='up-row'>
              <FormulaTerm icon={CircleStackIcon}>Input tokens</FormulaTerm>
              <Times />
              <div className='up-group'>
                <Paren side='open' />
                <div className='up-row up-inner'>
                  <FormulaTerm icon={TagIcon}>Base workflow rate</FormulaTerm>
                  <PlusSign />
                  <FormulaTerm icon={DocumentMagnifyingGlassIcon}>Context rate</FormulaTerm>
                </div>
                <Paren side='close' />
              </div>
              {slides ? (
                <>
                  <PlusSign />
                  <div className='up-group'>
                    <Paren side='open' />
                    <div className='up-row up-inner'>
                      <FormulaTerm icon={PhotoIcon}>Layout units</FormulaTerm>
                      <Times />
                      <FormulaTerm icon={TagIcon}>Per-unit rate</FormulaTerm>
                    </div>
                    <Paren side='close' />
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <details className='up-example'>
            <summary>
              <span className='up-when-closed'>See example</span>
              <span className='up-when-open'>Hide example</span>
            </summary>
            <div className='up-example-head'>
              <div className='up-example-title'>
                <span className='up-strong'>{slides ? 'Google Slides example' : 'Markdown example'}</span>
                <span className='up-muted'>
                  {slides
                    ? 'One Google Slides deck translated with Platform Context'
                    : 'One Markdown file translated with Platform Context'}
                </span>
              </div>
              <div className='up-example-facts'>
                <span>
                  <CircleStackMicroIcon aria-hidden className='up-emph' />
                  <span className='up-fact'>{EXAMPLE.inputTokens}</span>
                  input tokens
                </span>
                <span>
                  <DocumentMagnifyingGlassMicroIcon aria-hidden className='up-emph' />
                  <span className='up-fact'>{EXAMPLE.contextTokens}</span>
                  context tokens
                </span>
                {slides ? (
                  <span>
                    <PhotoMicroIcon aria-hidden className='up-emph' />
                    <span className='up-fact'>{EXAMPLE.slides}</span>
                    slides
                  </span>
                ) : null}
              </div>
            </div>

            <div className='up-example-body'>
              <div className='up-row up-example-row'>
                <div className='up-term up-term-value'>
                  <CircleStackIcon aria-hidden className='up-emph' />
                  <span className='up-sr'>Input tokens</span>
                  <span className='up-chip-value is-plain'>{EXAMPLE.inputTokens}</span>
                </div>
                <Times />
                <div className='up-group up-group-fit'>
                  <Paren side='open' />
                  <div className='up-row up-inner'>
                    <ExampleChip
                      badge={1}
                      icon={TagIcon}
                      label='Base workflow rate'
                      tip={`The base translation rate is ${RATE_TEXT.base} per 1,000 input tokens.`}
                      value={EXAMPLE.baseRatePerToken}
                    />
                    <PlusSign />
                    <ExampleChip
                      badge={2}
                      icon={DocumentMagnifyingGlassIcon}
                      label='Context rate'
                      tip={`Platform Context costs ${RATE_TEXT.context} per 1,000 input tokens per 1,000 context tokens.`}
                      value={`${EXAMPLE.contextTokens} × ${EXAMPLE.contextRatePerToken}`}
                    />
                  </div>
                  <Paren side='close' />
                </div>
                {slides ? (
                  <>
                    <PlusSign />
                    <div className='up-group up-group-fit'>
                      <Paren side='open' />
                      <div className='up-row up-inner'>
                        <ExampleChip
                          icon={PhotoIcon}
                          label='Number of slides'
                          tip='Number of slides in this example.'
                          value={EXAMPLE.slides}
                        />
                        <Times />
                        <ExampleChip
                          badge={3}
                          icon={TagIcon}
                          label='Per-slide rate'
                          tip={`Adds ${RATE_TEXT.slide} for every slide, on top of token and context charges.`}
                          value={RATE_TEXT.slide}
                        />
                      </div>
                      <Paren side='close' />
                    </div>
                  </>
                ) : null}
                <span className='up-equals'>=</span>
                <span className='up-total'>{slides ? EXAMPLE.totalSlides : EXAMPLE.totalFiles}</span>
              </div>
              <div className='up-legend'>
                <span>
                  <span className='up-badge'>1</span>
                  {RATE_TEXT.base} per 1,000 input tokens
                </span>
                <span className='is-top'>
                  <span className='up-badge'>2</span>
                  <span>+{RATE_TEXT.context} per 1,000 input tokens per 1,000 context tokens</span>
                </span>
                {slides ? (
                  <span>
                    <span className='up-badge'>3</span>
                    <span>
                      <span className='up-num'>+{RATE_TEXT.slide}</span> per slide
                    </span>
                  </span>
                ) : null}
              </div>
            </div>
          </details>
          </div>

        </div>
      </section>

      <div className='up-separator' role='separator' />

      <section className='up-section'>
        <div className='up-head-row'>
          <h2 id='live-translation-rates'>Live translation rates</h2>
          <PerTokens />
        </div>
        <p className='up-lead'>
          Translations generated by on-demand APIs when dynamic content is requested. Charges only apply for new
          requests. Cached requests are free.
        </p>
        <RateTable
          head='Format'
          kind='formats'
          preview={PREVIEW.formats}
          rows={LIVE_RATES.map((rate) => ({ key: rate.label, label: rateLabel(rate), cost: rate.cost }))}
        />
      </section>

      <div className='up-separator' role='separator' />

      <section className='up-section'>
        <div className='up-section-head'>
          <h2>Agent workflows</h2>
          <p>
            Locadex is a localization cloud agent. It connects your GitHub, CMS, and other systems with General
            Translation APIs to automate localization from end-to-end.
          </p>
        </div>
        <RateTable
          head='Format'
          rows={[
            {
              key: 'lcu',
              label: (
                <span className='up-cell-row'>
                  <span aria-hidden className='up-locadex' />
                  <span>Locadex Compute Unit (LCU)</span>
                  <PricingHelp>Locadex Compute Units (LCUs) meter the resource costs for an agent to run end-to-end.</PricingHelp>
                </span>
              ),
              cost: `${RATE_TEXT.lcu} / LCU`,
            },
          ]}
        />
      </section>

      <div className='up-separator' role='separator' />

      <section className='up-section'>
        <h2>Data rates</h2>
        <RateTable
          head='Feature'
          rows={[
            { key: 'cdn', label: 'Translation CDN', cost: `${RATE_TEXT.cdn} / request` },
            {
              key: 'storage',
              label: (
                <span className='up-cell-row'>
                  <span>Data Storage</span>
                  <PricingHelp>
                    The first {RATE_TEXT.storageIncludedGb} GB is free. Covers your source and translated files, plus
                    the storage behind translation caching so unchanged content is never translated twice.
                  </PricingHelp>
                </span>
              ),
              cost: `${RATE_TEXT.storageIncludedGb} GB free, then ${RATE_TEXT.storage} / GB-month`,
            },
          ]}
        />
      </section>
    </div>
  );
}
