'use client';

import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import { useQuietReveal } from './reveal';

const PARTS = [
  {
    name: 'Code',
    body: 'Mark up UI copy, route locales, and ship static translations in your codebase.',
  },
  {
    name: 'Content',
    body: 'Translate user-generated and backend content on demand across every runtime surface.',
  },
  {
    name: 'Dashboard',
    body: 'Curate glossaries, style rules, and project context, with editing, versioning, and integrations.',
  },
  {
    name: 'Locadex',
    body: 'Scans repos, updates i18n code, generates translations, runs visual QA, and opens guarded PRs.',
  },
];

/** The transcript floating on the band: the whole toolchain as one status. */
const STATUS: readonly { tone: 'prompt' | 'plain' | 'dim'; key?: string; text: string }[] = [
  { tone: 'prompt', text: '$ gt status' },
  { tone: 'plain', key: '  project   ', text: 'acme/web' },
  { tone: 'plain', key: '  strings   ', text: '128 translated · 6 locales' },
  { tone: 'plain', key: '  edge      ', text: 'fra · 12 ms · v214 live' },
  { tone: 'plain', key: '  review    ', text: '2 approved · 0 waiting' },
  { tone: 'plain', key: '  locadex   ', text: 'PR #218 merged · +38 −6' },
];

/**
 * The page's one full-bleed dark band. The light is the band's material — a
 * committed field, not a wash: strong at the edges, held off the type by a
 * dark centre — and a real artifact floats on it: the one-project status
 * transcript, which is the four services below it stated as a single machine
 * account. (The hero terminal band carries the field's only other
 * appearance, masked the same way.)
 */
export default function DarkBand() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-band' id='toolchain' ref={root}>
      <PrismaticField
        className='tc-band-field'
        preset='1'
        speed={0.45}
        params={{ exposureScale: 2400 }}
      />

      <div className='tc-band-in'>
        <div className='tc-band-top'>
          <div>
            <h2 data-reveal>Everything you need, in one toolchain.</h2>
            <p className='tc-band-sub' data-reveal>
              Four services covering every stage of the workflow — buildtime, runtime, and review — under
              one project, one config, and one bill.
            </p>
          </div>

          <div className='tc-band-term' data-reveal>
            <div className='tc-band-term-bar'>gt — status</div>
            <div className='tc-band-term-body'>
              {STATUS.map((line, i) => (
                <div data-tone={line.tone} key={i}>
                  {line.key ? <span className='tc-band-term-key'>{line.key}</span> : null}
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='tc-band-grid'>
          {PARTS.map((part) => (
            <div data-reveal key={part.name}>
              <h3>{part.name}</h3>
              <p>{part.body}</p>
            </div>
          ))}
        </div>

        <div className='tc-band-acts' data-reveal>
          <a className='tc-btn tc-btn-solid' href='#pricing'>
            Get started
          </a>
          <a className='tc-btn tc-btn-line' href='#frameworks'>
            Talk to an engineer
          </a>
        </div>
      </div>
    </section>
  );
}
