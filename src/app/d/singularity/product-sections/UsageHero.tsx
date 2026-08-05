'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/**
 * The thesis, then the instrument: four meters on one dark panel, each with
 * its published rate and the command or key that spins it. The rates are the
 * published ones ($10/$20 build, $1 runtime, $1/$4 development per 10k input
 * tokens, $5 per LCU); nothing here is invented, which is the entire pitch —
 * the price is knowable before you run anything.
 */

type Meter = {
  name: string;
  rate: string;
  unit: string;
  chip: string;
  note: string;
};

const METERS: readonly Meter[] = [
  {
    name: 'build time',
    rate: '$10',
    unit: '/ 10k input tokens',
    chip: 'npx gt translate',
    note: 'MD, MDX, JSON, YAML, HTML, TS/JS. GT-library content — <T>, JSX trees — meters at $20.',
  },
  {
    name: 'runtime',
    rate: '$1',
    unit: '/ 10k input tokens',
    chip: 'tx()',
    note: 'User and backend content translated on demand — the exception path for what a build can’t know.',
  },
  {
    name: 'development',
    rate: '$1',
    unit: '/ 10k input tokens',
    chip: 'gtx-dev-…',
    note: 'Previews regenerate while you type; $4 for GT-library content. Production is pre-generated, never on demand.',
  },
  {
    name: 'locadex',
    rate: '$5',
    unit: '/ LCU',
    chip: 'npx locadex@latest start',
    note: 'One agent run end to end — lines changed, files touched, codebase size — in Locadex Compute Units.',
  },
];

export default function UsageHero() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='sgx-head'>
        <span className='sgx-kicker' data-reveal>
          Usage pricing
        </span>
        <h1 data-reveal>
          Priced by the <em className='sgx-em'>meter</em>.
        </h1>
        <p data-reveal>
          Translation is metered in input tokens and agent runs in compute units, at rates
          published before you run anything. Start at $0 &mdash; users, projects, and languages are
          unlimited on Starter &mdash; and a Usage Limit hard-caps spend where you say. The meter
          is what you run, never who ran it.
        </p>
      </div>

      <div className='sgx-body'>
        <div className='sgx-panel' data-reveal>
          <div className='sgx-panel-bar'>
            <span>what gets metered</span>
            <span>published rates</span>
          </div>
          <div className='sgx-meters-grid'>
            {METERS.map((meter) => (
              <div className='sgx-meter' key={meter.name}>
                <span className='sgx-meter-k'>{meter.name}</span>
                <b className='sgx-meter-rate'>
                  {meter.rate}
                  <small>{meter.unit}</small>
                </b>
                <code className='sgx-meter-chip'>{meter.chip}</code>
                <span className='sgx-meter-note'>{meter.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
