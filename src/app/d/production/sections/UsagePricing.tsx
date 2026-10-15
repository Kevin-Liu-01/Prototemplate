'use client';

import {
  CircleStackIcon as CircleStackMicroIcon,
  DocumentMagnifyingGlassIcon as DocumentMagnifyingGlassMicroIcon,
  PresentationChartBarIcon as PresentationChartBarMicroIcon,
} from '@heroicons/react/16/solid';
import {
  CircleStackIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  TagIcon,
} from '@heroicons/react/24/solid';
import { HelpCircle, Plus, X } from 'lucide-react';
import { useState, type ComponentType, type ReactNode, type SVGProps } from 'react';

import {
  BASE_RATES,
  EXAMPLE,
  LIVE_RATES,
  RATE_TEXT,
  TOKENS_HELP_HREF,
} from './usage-rates-data';

/**
 * The shipped usage rates body: gt-cloud packages/ui/src/components/
 * pricing/UsagePricing.tsx, which /pricing/usage mounts. The DOM keeps its
 * order and grouping (Base, Live and Additional rates first through
 * `order-first`, then the Formula card, then the Agent workflows and Data
 * rates sections between two rail-wide separators), and usage-pricing.css
 * restates its Tailwind and shadcn classes under .usage-pricing-root.
 *
 * Two departures. The rates are the values the live page renders, held in
 * usage-rates-data.ts instead of computed from @generaltranslation/settings.
 * The help bubbles are the mirror's CSS bubble (PricingHelp): hover and
 * focus open them, and a click keeps one open while its trigger holds
 * focus, where live pins a Radix tooltip in a portal.
 */

/** One help bubble: the HelpCircle trigger by default, or the chip given as `trigger`. */
function UsageTip({ children, trigger }: { children: ReactNode; trigger?: ReactNode }) {
  return (
    <span className='pricing-help'>
      {trigger ?? (
        <button aria-label='More information' type='button'>
          <HelpCircle aria-hidden='true' strokeWidth={1.8} />
        </button>
      )}
      <span className='pricing-help-bubble' role='tooltip'>
        {children}
      </span>
    </span>
  );
}

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
    <UsageTip
      trigger={
        <button className={badge ? 'up-chip has-badge' : 'up-chip'} type='button'>
          <Icon aria-hidden className='up-emph' />
          <span className='up-sr'>{label}</span>
          <span className='up-chip-value'>{value}</span>
          {badge ? <span className='up-badge up-chip-badge'>{badge}</span> : null}
        </button>
      }
    >
      <span>{tip}</span>
    </UsageTip>
  );
}

/** The two-column rate table every section uses: a label column at 34% and a centred cost column. */
function RateTable({ head, rows }: { head: string; rows: readonly { key: string; label: ReactNode; cost: ReactNode }[] }) {
  return (
    <div className='up-table-wrap'>
      <table className='up-table'>
        <thead>
          <tr>
            <th className='up-label-col'>{head}</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td>{row.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
        <div className='up-formula-head'>
          <h2>Formula</h2>
        </div>

        <div className='up-formula'>
          <div className='up-formula-bar'>
            <span className='up-strong'>Translation workflows for...</span>
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
                <PresentationChartBarIcon aria-hidden />
                Google Slides
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
                      <FormulaTerm icon={PresentationChartBarIcon}>Number of slides</FormulaTerm>
                      <Times />
                      <FormulaTerm icon={TagIcon}>Per-slide rate</FormulaTerm>
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
                  {slides ? 'slide input tokens' : 'Markdown input tokens'}
                </span>
                <span>
                  <DocumentMagnifyingGlassMicroIcon aria-hidden className='up-emph' />
                  <span className='up-fact'>{EXAMPLE.contextTokens}</span>
                  context tokens
                </span>
                {slides ? (
                  <span>
                    <PresentationChartBarMicroIcon aria-hidden className='up-emph' />
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
                          icon={PresentationChartBarIcon}
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
                  $1 per 1,000 input tokens
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

        <div className='up-rates'>
          <div className='up-head-row'>
            <h2 id='base-translation-rates'>Base translation rates</h2>
            <PerTokens />
          </div>
          <RateTable
            head='Format'
            rows={BASE_RATES.map((rate) => ({
              key: rate.label,
              label: (
                <span className='up-cell-row'>
                  <span>{rate.label}</span>
                  {rate.help ? <UsageTip>{rate.help}</UsageTip> : null}
                </span>
              ),
              cost: rate.cost,
            }))}
          />

          <div className='up-subsection'>
            <div className='up-head-row'>
              <h2 id='live-translation-rates'>Live translation rates</h2>
              <PerTokens />
            </div>
            <RateTable
              head='Format'
              rows={LIVE_RATES.map((rate) => ({
                key: rate.label,
                label: (
                  <span className='up-cell-row is-inline'>
                    {rate.label}
                    <UsageTip>{rate.help}</UsageTip>
                  </span>
                ),
                cost: rate.cost,
              }))}
            />
          </div>

          <div className='up-subsection'>
            <h2 id='additional-rates'>Additional rates</h2>
            <RateTable
              head='Feature'
              rows={[
                {
                  key: 'context',
                  label: (
                    <span className='up-cell-row'>
                      <span>GT Platform Context</span>
                      <UsageTip>
                        Platform Context includes the glossary terms and directives applied to your project to guide
                        terminology, tone, and style.
                      </UsageTip>
                    </span>
                  ),
                  cost: `+ ${RATE_TEXT.context} per 1,000 input tokens per 1,000 context tokens`,
                },
                { key: 'slides', label: 'Google Slides', cost: `+ ${RATE_TEXT.slide} / slide` },
              ]}
            />
          </div>
        </div>
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
                  <UsageTip>Locadex Compute Units (LCUs) meter the resource costs for an agent to run end-to-end.</UsageTip>
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
            { key: 'storage', label: 'Data Storage', cost: `${RATE_TEXT.storage} / GB-month` },
          ]}
        />
      </section>
    </div>
  );
}
