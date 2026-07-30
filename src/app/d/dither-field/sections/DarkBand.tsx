'use client';

import { useRef } from 'react';

import {
  TcMiniCode,
  TcMiniContent,
  TcMiniDashboard,
  TcMiniLocadex,
} from '@/app/d/toolchain/diagrams/tc-stack-minis';

import { floorDissolve, panelBloom, useDitherField } from '../fields';
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

/** What "buildtime, runtime, and review" concretely are — the lede's foot. */
const INDEX = [
  { stage: 'buildtime', tools: 'gt-next · gt-react · gt cli' },
  { stage: 'runtime', tools: 'translation api · edge cdn' },
  { stage: 'review', tools: 'dashboard · locadex prs' },
  { stage: 'context', tools: 'glossaries · directives · groups' },
];

/**
 * The transcript floating in the bloom's dark core: the whole toolchain as
 * one machine account — project health, not the service grid repeated.
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
 * The page's one full-bleed dark band. This fork's material moment happens
 * exactly once in it, as a committed panel: a paper-on-ink halftone bloom
 * filling the header's right column, the status terminal floating in its dark
 * core — the viteplus grammar, drawn by the Bayer engine instead of a shader.
 * Below it the four services each carry a real artifact plate (editor, API
 * exchange, dashboard card, PR diff), on clean ink with no texture anywhere
 * near the type; the dissolve strip along the band's floor is the only loose
 * dither, mounted in padding no content can enter.
 */
export default function DarkBand() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  // applyStyles is off for both canvases: the engine's default inline
  // `width/height: 100%` would override the fixed CSS boxes that confine
  // these fields to their zones — the whole point of the r2 band is that the
  // texture is architecturally fenced away from type.
  const bloomRef = useDitherField(panelBloom, {
    scale: 3,
    ink: '#f2f1ec',
    paper: 'transparent',
    fps: 24,
    reducedMotionTime: 8,
    applyStyles: false,
  });

  const floorRef = useDitherField(floorDissolve, {
    scale: 3,
    ink: '#f2f1ec',
    paper: 'transparent',
    fps: 24,
    reducedMotionTime: 2,
    applyStyles: false,
  });

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
              {INDEX.map((row) => (
                <div className='tc-band-index-row' key={row.stage}>
                  <span>{row.stage}</span>
                  <b>{row.tools}</b>
                </div>
              ))}
            </div>
          </div>

          <div className='tc-band-panel' data-reveal>
            <canvas className='df-panel-field' ref={bloomRef} aria-hidden />
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

      {/* The floor: the page's one loose dissolve, below every line of type. */}
      <canvas className='df-band-floor' ref={floorRef} aria-hidden />
    </section>
  );
}
