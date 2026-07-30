'use client';

import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import TcCtxLayers from '../diagrams/tc-ctx-layers';
import TcStackIso from '../diagrams/tc-stack-iso';
import { TcMiniCode, TcMiniContent, TcMiniDashboard, TcMiniLocadex } from '../diagrams/tc-stack-minis';
import TcStackTrace from '../diagrams/tc-stack-trace';
import { useQuietReveal } from './reveal';

const PARTS = [
  {
    name: 'Code',
    body: 'Mark up UI copy, route locales, and ship static translations in your codebase.',
    Mini: TcMiniCode,
  },
  {
    name: 'Content',
    body: 'Translate user-generated and backend content on demand across every runtime surface.',
    Mini: TcMiniContent,
  },
  {
    name: 'Dashboard',
    body: 'Curate glossaries, style rules, and project context, with editing, versioning, and integrations.',
    Mini: TcMiniDashboard,
  },
  {
    name: 'Locadex',
    body: 'Scans repos, updates i18n code, generates translations, runs visual QA, and opens guarded PRs.',
    Mini: TcMiniLocadex,
  },
];

/**
 * The transcript on the light panel: the whole toolchain as one machine
 * account. Every value is one the band does not state anywhere else — project
 * health, not the stack diagram's per-layer ledger repeated.
 */
const STATUS: readonly { key: string; text: string }[] = [
  { key: '  project   ', text: 'acme/web · production' },
  { key: '  coverage  ', text: '6 locales · 100% translated' },
  { key: '  context   ', text: '3 groups · 30 rules' },
  { key: '  review    ', text: 'queue empty · edited 2 h ago' },
  { key: '  locadex   ', text: 'watching 3 repos · runs nightly' },
  { key: '  edge      ', text: '2.1M requests / day' },
];

/**
 * The page's one full-bleed dark band. The prismatic light appears exactly
 * once in it, as a committed material: the header's full-height texture panel,
 * run bright, with the status terminal floating in its dark centre — the
 * viteplus grammar, not a wash under the whole band. Everything below sits on
 * clean ink: the stack assembly beside its timestamped trace, four services
 * with four different artifacts, then the context-layers cascade.
 */
export default function DarkBand() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-band' id='toolchain' ref={root}>
      <div className='tc-band-in'>
        <div className='tc-band-top'>
          <div className='tc-band-lede'>
            <h2 data-reveal>Everything you need, in one toolchain.</h2>
            <p className='tc-band-sub' data-reveal>
              Four services covering every stage of the workflow — buildtime, runtime, and review — under
              one project, one config, and one bill.
            </p>

            <div className='tc-band-index' data-reveal>
              <div className='tc-band-index-row'>
                <span>buildtime</span>
                <b>gt-next · gt-react · gt cli</b>
              </div>
              <div className='tc-band-index-row'>
                <span>runtime</span>
                <b>translation api · edge cdn</b>
              </div>
              <div className='tc-band-index-row'>
                <span>review</span>
                <b>dashboard · locadex prs</b>
              </div>
              <div className='tc-band-index-row'>
                <span>context</span>
                <b>glossaries · directives · groups</b>
              </div>
            </div>
          </div>

          <div className='tc-band-panel' data-reveal>
            <PrismaticField
              className='tc-band-panel-field'
              preset='1'
              speed={0.4}
              params={{ exposureScale: 1600 }}
            />
            <div className='tc-band-term'>
              <div className='tc-band-term-bar'>gt — status</div>
              <div className='tc-band-term-body'>
                <div data-tone='prompt'>$ gt status</div>
                {STATUS.map((line) => (
                  <div data-tone='plain' key={line.key}>
                    <span className='tc-band-term-key'>{line.key}</span>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* The centerpiece: the whole toolchain as one axonometric assembly,
            the doubled thread climbing its flank from source to screen — and
            beside it, the same journey on the clock. */}
        <div className='tc-band-flow'>
          <div className='tc-band-flow-copy'>
            <h3 data-reveal>One string, source to screen.</h3>
            <p data-reveal>
              A commit lands at 09:41. The CLI extracts it, Locadex opens the PR, context and review
              shape the translation, the edge serves it — a user in Berlin reads it before 09:46.
            </p>
            <TcStackTrace />
          </div>

          <div className='tc-band-stack' data-reveal>
            <TcStackIso
              className='tcstack'
              title='The GT stack, end to end: app code, gt cli, Locadex, context, review, edge CDN, and runtime delivery, connected by one thread from source code to the translated string on a user’s screen'
            />
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

        {/* The context-layers model — the part of the stack no other vendor
            has, so it gets stated as its own three-layer inheritance. */}
        <div className='tc-band-ctx'>
          <div className='tc-band-ctx-head' data-reveal>
            <h3>Context, defined once — inherited all the way down.</h3>
            <p>
              Context Groups pair a glossary for terminology with directives for style. Define them
              for the organization, apply and prioritize them per project, then guide a single
              instance inline in the component.
            </p>
          </div>
          <TcCtxLayers />
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
