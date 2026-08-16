'use client';

import {
  Coins,
  FileText,
  Gauge,
  Hammer,
  Plus,
  Presentation,
  ScanText,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

import HelpTip from './HelpTip';

/**
 * Local mirror of packages/ui UsagePricing: the base-rates table under the
 * scroll-shadow wrapper, the additional-rates table, the worked examples
 * with numbered help chips, and the Locadex LCU card. Every rate is a
 * static string pre-rendered exactly as the live page's Intl formatting
 * prints it ($10/10k build → '$1' per 1,000 tokens, '$0.1' runtime, and
 * so on); no settings package, no gt-next.
 */

const TOKENS_HELP_HREF =
  'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them';
const LOCADEX_LOGO_SRC = '/brand/no-bg-locadex-logo-light.png';

type Workflow = {
  name: string;
  description: string;
  icon: typeof Hammer;
};

const WORKFLOWS: readonly Workflow[] = [
  {
    name: 'Buildtime',
    description:
      'Translations generated before deployment as part of your production build.',
    icon: Hammer,
  },
  {
    name: 'Runtime',
    description:
      'Translations generated on demand when dynamic content is requested.',
    icon: Zap,
  },
  {
    name: 'Devtime',
    description:
      'Translations generated during local development for immediate feedback.',
    icon: Terminal,
  },
];

type FormatRow = {
  label: string;
  tip?: string;
  /* [buildtime, runtime, devtime] — null renders the em-dash cell */
  rates: readonly [string | null, string | null, string | null];
};

const FORMAT_ROWS: readonly FormatRow[] = [
  {
    label: 'GT Content Files',
    tip: 'Structured GT files include additional metadata.',
    rates: ['$2', '$0.1', '$0.4'],
  },
  { label: 'MDX / Markdown', rates: ['$1', null, null] },
  { label: 'JSON', rates: ['$1', null, null] },
  { label: 'YAML', rates: ['$1', null, null] },
  { label: 'TypeScript / JavaScript', rates: ['$1', null, null] },
  { label: 'HTML', rates: ['$1', null, null] },
  { label: 'Plain Text', rates: ['$1', null, null] },
  { label: 'PO / POT', rates: ['$1', null, null] },
  { label: 'Google Slides', rates: ['$1', null, null] },
];

function OpeningParen() {
  return (
    <svg
      className='sgu-paren'
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

function ClosingParen() {
  return (
    <svg
      className='sgu-paren'
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

function Term({
  icon: Icon,
  children,
}: {
  icon: typeof Hammer;
  children: ReactNode;
}) {
  return (
    <div className='sgu-term'>
      <Icon aria-hidden />
      <span>{children}</span>
    </div>
  );
}

function RateCell({ rate }: { rate: string | null }) {
  return rate === null ? <span className='sgu-dim'>&mdash;</span> : rate;
}

export default function UsagePricing() {
  const [isSlides, setIsSlides] = useState(false);

  return (
    <div className='sgu-wrap'>
      <section className='sgu-sec'>
        <div className='sgu-rates-head'>
          <h2>Translation base rates</h2>
          <span className='sgu-per'>
            Per 1,000 input{' '}
            <a href={TOKENS_HELP_HREF} target='_blank' rel='noopener noreferrer'>
              tokens
            </a>
          </span>
        </div>

        {/* The table scrolls sideways below 640px, where overlay scrollbars
            leave no hint that rate columns are cut off. The layered
            background paints an edge shadow pinned to the frame and a
            page-colored cover that scrolls with the content (attachment:
            local), so each shadow shows only while more columns hide past
            that edge and the whole affordance vanishes when the table
            fits. */}
        <div className='sgu-scroll'>
          <table className='sgu-table'>
            <thead>
              <tr>
                <th className='sgu-col-format' scope='col'>
                  Format
                </th>
                {WORKFLOWS.map((workflow) => {
                  const Icon = workflow.icon;
                  return (
                    <th key={workflow.name} scope='col'>
                      <span className='sgu-th-in'>
                        <Icon aria-hidden />
                        <span>{workflow.name}</span>
                        <HelpTip tip={workflow.description} />
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {FORMAT_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className='sgu-td-format'>
                    <span className='sgu-fmt'>
                      <span>{row.label}</span>
                      {row.tip ? <HelpTip tip={row.tip} /> : null}
                    </span>
                  </td>
                  {row.rates.map((rate, index) => (
                    <td className='sgu-td-rate' key={WORKFLOWS[index].name}>
                      <RateCell rate={rate} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='sgu-add'>
          <h2>Additional rates</h2>
          <div className='sgu-add-frame'>
            <table className='sgu-add-table'>
              <tbody>
                <tr>
                  <td className='sgu-td-format'>
                    <span className='sgu-fmt'>
                      <span>GT Platform Context</span>
                      <HelpTip tip='Platform Context includes the glossary terms and directives applied to your project to guide terminology, tone, and style.' />
                    </span>
                  </td>
                  <td className='sgu-td-add'>
                    + $0.10 / 10,000 input tokens / 500 context tokens
                  </td>
                </tr>
                <tr>
                  <td className='sgu-td-format'>Google Slides</td>
                  <td className='sgu-td-add'>+ $0.50 / slide</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className='sgu-examples'>
          <h2>Examples</h2>
          <div className='sgu-card'>
            <div className='sgu-card-bar'>
              <span className='sgu-card-label'>
                Translation workflows for...
              </span>
              <div className='sgu-togs' role='group' aria-label='Translation type'>
                <button
                  type='button'
                  className={`sgu-tog${isSlides ? '' : ' is-on'}`}
                  aria-pressed={!isSlides}
                  onClick={() => setIsSlides(false)}
                >
                  <FileText aria-hidden />
                  Files
                </button>
                <button
                  type='button'
                  className={`sgu-tog${isSlides ? ' is-on' : ''}`}
                  aria-pressed={isSlides}
                  onClick={() => setIsSlides(true)}
                >
                  <Presentation aria-hidden />
                  Google Slides
                </button>
              </div>
            </div>

            <div className='sgu-formula'>
              <Term icon={Coins}>Input tokens</Term>
              <X className='sgu-op' strokeWidth={2.5} aria-hidden />
              <div className='sgu-group'>
                <OpeningParen />
                <div className='sgu-group-terms'>
                  <Term icon={Gauge}>Base workflow rate</Term>
                  <Plus className='sgu-op' strokeWidth={2.5} aria-hidden />
                  <Term icon={ScanText}>Context rate</Term>
                </div>
                <ClosingParen />
              </div>
              {isSlides ? (
                <>
                  <Plus className='sgu-op' strokeWidth={2.5} aria-hidden />
                  <div className='sgu-group'>
                    <OpeningParen />
                    <div className='sgu-group-terms'>
                      <Term icon={Presentation}>Number of slides</Term>
                      <X className='sgu-op' strokeWidth={2.5} aria-hidden />
                      <Term icon={Gauge}>Per-slide rate</Term>
                    </div>
                    <ClosingParen />
                  </div>
                </>
              ) : null}
            </div>

            <div className='sgu-ex-lower'>
              <div className='sgu-ex-meta'>
                <div className='sgu-ex-name'>
                  <span className='sgu-ex-title'>
                    {isSlides ? 'Google Slides example' : 'Markdown example'}
                  </span>
                  <span className='sgu-ex-desc'>
                    {isSlides
                      ? 'One Google Slides deck translated with Platform Context'
                      : 'One Markdown file translated with Platform Context'}
                  </span>
                </div>
                <div className='sgu-ex-counts'>
                  <span className='sgu-count'>
                    <Coins aria-hidden />
                    <b>1,000</b>
                    {isSlides ? 'slide input tokens' : 'Markdown input tokens'}
                  </span>
                  <span className='sgu-count'>
                    <ScanText aria-hidden />
                    <b>3,000</b>
                    context tokens
                  </span>
                  {isSlides ? (
                    <span className='sgu-count'>
                      <Presentation aria-hidden />
                      <b>4</b>
                      slides
                    </span>
                  ) : null}
                </div>
              </div>

              <div className='sgu-work-wrap'>
                <div className='sgu-work'>
                  <span className='sgu-chip is-plain'>
                    <Coins aria-hidden />
                    <span className='sgu-sr'>Input tokens</span>
                    <span className='sgu-chip-v is-solid'>1,000</span>
                  </span>
                  <X className='sgu-op' strokeWidth={2.5} aria-hidden />
                  <div className='sgu-group'>
                    <OpeningParen />
                    <div className='sgu-group-terms'>
                      <HelpTip
                        tip='The base rate is $0.001 per input token, equivalent to $1.00 per 1,000 tokens.'
                        trigger={
                          <button type='button' className='sgu-chip is-badged'>
                            <Gauge aria-hidden />
                            <span className='sgu-sr'>Base workflow rate</span>
                            <span className='sgu-chip-v'>$0.001</span>
                            <span className='sgu-chip-n' aria-hidden>
                              1
                            </span>
                          </button>
                        }
                      />
                      <Plus className='sgu-op' strokeWidth={2.5} aria-hidden />
                      <HelpTip
                        tip='3,000 context tokens create 6 steps of 500 tokens. Each step adds $0.00001 per input token.'
                        trigger={
                          <button type='button' className='sgu-chip is-badged'>
                            <ScanText aria-hidden />
                            <span className='sgu-sr'>Context rate</span>
                            <span className='sgu-chip-v'>
                              3,000 &divide; 500 &times; $0.00001
                            </span>
                            <span className='sgu-chip-n' aria-hidden>
                              2
                            </span>
                          </button>
                        }
                      />
                    </div>
                    <ClosingParen />
                  </div>
                  {isSlides ? (
                    <>
                      <Plus className='sgu-op' strokeWidth={2.5} aria-hidden />
                      <div className='sgu-group'>
                        <OpeningParen />
                        <div className='sgu-group-terms'>
                          <HelpTip
                            tip='Number of slides in this example.'
                            trigger={
                              <button type='button' className='sgu-chip'>
                                <Presentation aria-hidden />
                                <span className='sgu-sr'>Number of slides</span>
                                <span className='sgu-chip-v'>4</span>
                              </button>
                            }
                          />
                          <X className='sgu-op' strokeWidth={2.5} aria-hidden />
                          <HelpTip
                            tip='Adds $0.50 for every slide, on top of token and context charges.'
                            trigger={
                              <button type='button' className='sgu-chip is-badged'>
                                <Gauge aria-hidden />
                                <span className='sgu-sr'>Per-slide rate</span>
                                <span className='sgu-chip-v'>$0.50</span>
                                <span className='sgu-chip-n' aria-hidden>
                                  3
                                </span>
                              </button>
                            }
                          />
                        </div>
                        <ClosingParen />
                      </div>
                    </>
                  ) : null}
                  <span className='sgu-eq'>=</span>
                  <span className='sgu-total'>
                    {isSlides ? '$3.06' : '$1.06'}
                  </span>
                </div>

                <div className='sgu-notes'>
                  <span className='sgu-note'>
                    <span className='sgu-note-n'>1</span>
                    $1 per 1,000 input tokens
                  </span>
                  <span className='sgu-note'>
                    <span className='sgu-note-n'>2</span>
                    <span>
                      +$0.10 per 10,000 input tokens per 500 context tokens
                    </span>
                  </span>
                  {isSlides ? (
                    <span className='sgu-note'>
                      <span className='sgu-note-n'>3</span>
                      <span>+$0.50 per slide</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className='sgu-sep' role='separator' />

      <section className='sgu-sec sgu-agent'>
        <div className='sgu-agent-head'>
          <h2>Agent workflows</h2>
          <p>
            Locadex is a localization cloud agent. It connects your GitHub,
            CMS, and other systems with General Translation APIs to automate
            localization from end-to-end.
          </p>
        </div>
        <div className='sgu-agent-grid'>
          <div className='sgu-agent-stage'>
            <div className='sgu-agent-tile'>
              <span
                aria-hidden
                className='sgu-agent-mark'
                style={{
                  WebkitMaskImage: `url(${LOCADEX_LOGO_SRC})`,
                  maskImage: `url(${LOCADEX_LOGO_SRC})`,
                }}
              />
              <span className='sgu-agent-price'>$5 / LCU</span>
            </div>
          </div>
          <div className='sgu-agent-copy'>
            <h3>Locadex Compute Unit</h3>
            <p>
              Locadex Compute Units (LCUs) meter the resource costs for an
              agent to run end-to-end.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
