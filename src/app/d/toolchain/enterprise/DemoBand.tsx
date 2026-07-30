'use client';

import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import { useQuietReveal } from '../sections/reveal';

/** The enterprise plan's own line items, from the published plan list. */
const TERMS: readonly { name: string; line: string }[] = [
  {
    name: 'Forward-deployed engineers',
    line: 'Support from the engineers who build the product — Slack and phone, not a ticket queue.',
  },
  {
    name: 'Custom workflows',
    line: 'Any format or framework, wired into your own pipeline.',
  },
  {
    name: 'Shared context',
    line: 'Glossaries and directives shared across every project in the organization.',
  },
  {
    name: 'Custom SLA',
    line: 'Delivery and support commitments, written into the contract.',
  },
];

/**
 * The page's one dark break, and the quiet ask: get a demo. Same band
 * grammar as the toolchain page — prismatic field at the edges, content in
 * the dark center, four ruled columns, two buttons.
 */
export default function DemoBand() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-band' id='demo' ref={root}>
      <PrismaticField className='tc-band-field' preset='1' speed={0.4} params={{ exposureScale: 2400 }} />
      <div className='tc-band-in'>
        <h2 data-reveal>Get a demo.</h2>
        <p className='tc-band-sub' data-reveal>
          Talk to an engineer about implementation, volume, and your security review — or start
          free and upgrade when you ship.
        </p>

        <div className='tc-band-grid'>
          {TERMS.map((term) => (
            <div key={term.name} data-reveal>
              <h3>{term.name}</h3>
              <p>{term.line}</p>
            </div>
          ))}
        </div>

        <div className='tc-band-acts' data-reveal>
          <a className='tc-btn tc-btn-solid' href='#top'>
            Get a demo
          </a>
          <a className='tc-btn tc-btn-line' href='#top'>
            Start free — $0
          </a>
        </div>
      </div>
    </section>
  );
}
