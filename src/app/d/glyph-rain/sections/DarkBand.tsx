'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { MiniCode, MiniContent, MiniDashboard, MiniLocadex } from './band/BandMinis';
import { createInkField } from './band/inkField';
import { useQuietReveal } from './reveal';

gsap.registerPlugin(useGSAP);

const PARTS = [
  {
    name: 'Code',
    body: 'Mark up UI copy, route locales, and ship static translations in your codebase.',
    Mini: MiniCode,
  },
  {
    name: 'Content',
    body: 'Translate user-generated and backend content on demand across every runtime surface.',
    Mini: MiniContent,
  },
  {
    name: 'Dashboard',
    body: 'Curate glossaries, style rules, and project context, with editing, versioning, and integrations.',
    Mini: MiniDashboard,
  },
  {
    name: 'Locadex',
    body: 'Scans repos, updates i18n code, generates translations, runs visual QA, and opens guarded PRs.',
    Mini: MiniLocadex,
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
 * The page's one full-bleed dark band, closed with the fork's own material:
 * the hero's glyph field inverted — paper glyphs rising off the ink (the
 * hero condenses, the closer disperses), held out of the content column by
 * a dithered clearing measured off the real DOM box. On the dark centre the
 * band carries real artifacts: the one-project status transcript, and under
 * each of the four services the object that service produces — an editor,
 * a runtime exchange, a locale ledger, a merged diff.
 */
export default function DarkBand() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLCanvasElement>(null);
  const core = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  useGSAP(
    () => {
      const rootEl = root.current;
      const canvas = stage.current;
      if (!rootEl || !canvas) return;
      const h2 = rootEl.querySelector('h2');
      const field = createInkField({
        canvas,
        clearEl: core.current,
        displayFamily: h2 ? getComputedStyle(h2).fontFamily : undefined,
      });
      return () => field?.destroy();
    },
    { scope: root }
  );

  return (
    <section className='tc-band' id='toolchain' ref={root}>
      <canvas className='tc-band-field' ref={stage} aria-hidden='true' />

      <div className='tc-band-in'>
        <div className='gr-band-core' ref={core}>
          <div className='tc-band-top'>
            <div>
              <h2 data-reveal>Everything you need, in one toolchain.</h2>
              <p className='tc-band-sub' data-reveal>
                Four services covering every stage of the workflow — buildtime, runtime, and review —
                under one project, one config, and one bill.
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
                <part.Mini />
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
      </div>
    </section>
  );
}
