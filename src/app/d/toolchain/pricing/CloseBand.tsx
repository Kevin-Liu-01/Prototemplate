'use client';

import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import { useQuietReveal } from '../sections/reveal';

/** The four stages, verbatim from the current pricing page — stages of one
 *  platform, not four SKUs. */
const STAGES: readonly { name: string; line: string }[] = [
  {
    name: 'Code → Internationalization',
    line: 'Mark up UI copy, route locales, and ship static translations in your codebase.',
  },
  {
    name: 'Content → Translation APIs',
    line: 'Translate user-generated and backend content on demand across every runtime surface.',
  },
  {
    name: 'Dashboard → Context Platform',
    line: 'Curate glossaries, style rules, and project context, along with editing, versioning, and integrations.',
  },
  {
    name: 'Locadex → Agent Automations',
    line: 'Locadex scans repos, updates i18n code, generates translations, runs visual QA, and opens guarded PRs.',
  },
];

/**
 * The page's one dark break, and the close: one platform, two plans,
 * published rates. Same band grammar as the rest of the direction —
 * prismatic field at the edges, content in the dark center, four ruled
 * columns, two buttons.
 */
export default function CloseBand() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-band' ref={root}>
      <PrismaticField className='tc-band-field' preset='1' speed={0.4} params={{ exposureScale: 2400 }} />
      <div className='tc-band-in'>
        <h2 data-reveal>One platform. Two plans. Published rates.</h2>
        <p className='tc-band-sub' data-reveal>
          Start at $0 with unlimited users, projects, and languages — or talk to an engineer about
          volume, custom workflows, and your security review.
        </p>

        <div className='tc-band-grid'>
          {STAGES.map((stage) => (
            <div key={stage.name} data-reveal>
              <h3>{stage.name}</h3>
              <p>{stage.line}</p>
            </div>
          ))}
        </div>

        <div className='tc-band-acts' data-reveal>
          <a className='tc-btn tc-btn-solid' href='#top'>
            Get started — $0
          </a>
          <a className='tc-btn tc-btn-line' href='#top'>
            Contact us
          </a>
        </div>
      </div>
    </section>
  );
}
