'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import type { ReactNode } from 'react';

import { createInkField } from '@/app/d/glyph-rain/sections/band/inkField';
import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import ContextResolve from '@/app/d/toolchain/diagrams/lang/ContextResolve';
import ReviewWorkspace from '@/app/d/toolchain/sections/ReviewWorkspace';
import { useQuietReveal } from '@/app/d/toolchain/sections/reveal';

import './context.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * V0 CONTEXT — "Full context on your codebase and product." The section is
 * the toolchain dark-band:
 * tc-band tcb → tcb-in → tcb-head cell → tcb-grid of framed tcb-cells, with
 * the glyph-rain closer's RISING ink field behind the sheet (founder note:
 * where glyph rain fell, the glyphs rise now) — paper glyphs off the ink
 * band, 1-bit dithered depth, held out of the ruled content column by a
 * dithered clearing measured off the real DOM box, so the type and bento
 * cells stay exactly as readable as the old mask kept them.
 * The four bentos run title-only
 * (founder cut: the subheadings retired); the application-logic cell mounts
 * the ORIGINAL ContextResolve fork, and the dynamic cell re-cuts the gender
 * fork in that same lang-cr drawing so the two forks speak one grammar —
 * plus an ambient border beam: one accent segment forever circling the
 * cell's own border line. The review beat is the grid's full-width closing
 * row: its head in the cell, the ORIGINAL ReviewWorkspace mounted beneath
 * on a cell-carried dark ground.
 */

/* ---------- the gender fork, in ContextResolve's own drawing ----------
   Same DOM, same classes, same fork paths as the mounted original — a
   static composition (the fork is the statement, both branches are live),
   so it never competes with the animated Save fork for attention. */

const GENDER_FORKS = [
  'M220 0 V14 C220 38 110 28 110 56',
  'M220 0 V14 C220 38 330 28 330 56',
] as const;

type GenderBranch = { value: string; word: string };

const GENDER_BRANCHES: readonly GenderBranch[] = [
  { value: 'masculine', word: 'Bienvenido' },
  { value: 'feminine', word: 'Bienvenida' },
];

function GenderFork() {
  return (
    <div
      className='lang lang-cr lang-accent-off'
      role='img'
      aria-label='Welcome, name derives Spanish gender variants: Bienvenido and Bienvenida'
    >
      <p className='lang-cr-source'>
        <span className='lang-tag'>
          <LocaleTag code='en' />
        </span>
        <span className='lang-cr-word'>
          {'Welcome, '}
          <code>{'{name}'}</code>
        </span>
      </p>

      <svg className='lang-cr-fork' viewBox='0 0 440 56' preserveAspectRatio='none' aria-hidden='true'>
        {GENDER_FORKS.map((d) => (
          <path className='lang-cr-thread' d={d} key={`thread-${d}`} />
        ))}
        {GENDER_FORKS.map((d) => (
          <path className='lang-cr-core' d={d} key={`core-${d}`} />
        ))}
      </svg>

      <div className='lang-cr-branches'>
        {GENDER_BRANCHES.map((branch) => (
          <div className='lang-cr-branch' key={branch.value}>
            <p className='lang-cr-ctx'>
              <span className='lang-cr-attr'>gender=</span>
              <span className='lang-cr-val'>&ldquo;{branch.value}&rdquo;</span>
            </p>
            <p className='lang-cr-result' lang='es'>
              {branch.word}
            </p>
            <p className='lang-cr-gloss'>
              <span className='lang-tag'>
                <LocaleTag code='es' />
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- the glossary rows ---------- */

type VaultRow = {
  code: string;
  /** the translated line around the verbatim term — that IS the point */
  before: string;
  after: string;
};

const VAULT_ROWS: readonly VaultRow[] = [
  { code: 'de', before: 'Im ', after: ' speichern' },
  { code: 'es', before: 'Guardar en ', after: '' },
  { code: 'fr', before: 'Enregistrer dans ', after: '' },
  { code: 'ja', before: '', after: 'に保存' },
  { code: 'zh', before: '保存到 ', after: '' },
];

/* ---------- the directives rows (German) ---------- */

/** The formatting directive's date is real Intl output, never typed in. */
const DE_DATE = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(new Date(2026, 6, 30));

type Directive = {
  label: string;
  text: ReactNode;
  /** the tiny before→after pair under the Sie directive */
  pair?: { before: string; after: string };
};

const DIRECTIVES: readonly Directive[] = [
  { label: 'Audience', text: 'Avoid jargon.' },
  {
    label: 'Formality',
    text: 'Use the formal “Sie.”',
    pair: { before: 'Du kannst…', after: 'Sie können…' },
  },
  { label: 'Conventions', text: 'Use active voice.' },
  {
    label: 'Formatting',
    text: (
      <>
        Write dates as <code>{DE_DATE}</code>.
      </>
    ),
  },
];

export default function V0Context() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLCanvasElement>(null);
  const core = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  /* The band's material and its one ambient accent. The ink field's rAF,
     resize, clearing re-measure and reduced-motion still are internal to
     the engine — destroy() on unmount is ours. The dynamic cell's beam:
     one blue segment forever circling the cell's border. The rect is
     100%-based (it re-traces the box at any size) and pathLength-
     normalized to 100, so a dash of 18/82 is 18% of the perimeter at
     every width; one lap ≈ 5s, linear, gated to the section's viewport
     dwell. Reduced motion parks the segment where the path starts. */
  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const canvas = stage.current;
      const h2 = scope.querySelector('h2');
      const field = canvas
        ? createInkField({
            canvas,
            clearEl: core.current,
            displayFamily: h2 ? getComputedStyle(h2).fontFamily : undefined,
          })
        : null;

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const beam = scope.querySelector('.v0-ctx-beam rect');
        if (beam) {
          gsap.to(beam, {
            strokeDashoffset: -100,
            duration: 5,
            ease: 'none',
            repeat: -1,
            scrollTrigger: {
              trigger: scope,
              start: 'top bottom',
              end: 'bottom top',
              toggleActions: 'play pause resume pause',
            },
          });
        }
      }

      return () => field?.destroy();
    },
    { scope: root }
  );

  return (
    <section className='tc-band tcb v0-ctx' id='context' ref={root}>
      {/* the rising material: paper glyphs off the ink, band edges only */}
      <canvas className='v0-ctx-rain' ref={stage} aria-hidden='true' />

      <div className='tcb-in'>
        {/* the measuring box for the field's dithered clearing: glyphs own
            the band's margins and padding strips, never the content */}
        <div className='v0-ctx-core' ref={core}>
        <div className='tcb-head' data-cell data-reveal>
          <h2>Full context on your codebase and product.</h2>
          <p>GT connects your code, content, and translations.</p>
        </div>

        <div className='tcb-grid'>
          <div className='tcb-cell v0-ctx-cell' data-cell data-reveal>
            <div className='tcb-cap'>
              <h3>Translations know your application logic.</h3>
            </div>
            <div className='v0-ctx-art'>
              <ContextResolve title='The English string Save resolves by context: speichern when it saves a file, sparen when it means a discount' />
            </div>
          </div>

          <div className='tcb-cell v0-ctx-cell' data-cell data-reveal>
            <div className='tcb-cap'>
              <h3>Translations know your key terminology.</h3>
            </div>
            <div className='v0-ctx-art'>
              <div className='v0-ctx-glossary'>
                <div className='v0-ctx-glossary-head'>
                  <b>Vault</b>
                  <span className='v0-ctx-rule'>pinned</span>
                </div>
                {VAULT_ROWS.map((row) => (
                  <div className='v0-ctx-glossary-row' key={row.code}>
                    <LocaleTag code={row.code} />
                    <span className='v0-ctx-glossary-line' lang={row.code}>
                      {row.before}
                      <b>Vault</b>
                      {row.after}
                    </span>
                  </div>
                ))}
                <div className='v0-ctx-glossary-head'>
                  <b>Locadex</b>
                  <span className='v0-ctx-rule'>never translate</span>
                </div>
              </div>
            </div>
          </div>

          <div className='tcb-cell v0-ctx-cell' data-cell data-reveal>
            <div className='tcb-cap'>
              <h3>Translations know your voice and style.</h3>
            </div>
            <div className='v0-ctx-art'>
              <div className='v0-ctx-dirs'>
                <div className='v0-ctx-glossary-head'>
                  <b>Directives</b>
                  <span className='v0-ctx-dirs-loc'>
                    <LocaleTag code='de' />
                    German
                  </span>
                </div>
                {DIRECTIVES.map((directive) => (
                  <div className='v0-ctx-dir' key={directive.label}>
                    <b>{directive.label}</b>
                    <span className='v0-ctx-dir-body'>
                      <p>{directive.text}</p>
                      {directive.pair ? (
                        <span className='v0-ctx-dir-pair' lang='de'>
                          <span className='is-before'>{directive.pair.before}</span>
                          <span className='is-arrow' aria-hidden='true'>
                            {'→'}
                          </span>
                          <span>{directive.pair.after}</span>
                        </span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='tcb-cell v0-ctx-cell v0-ctx-dyn' data-cell data-reveal>
            <div className='tcb-cap'>
              <h3>Translations that work dynamically.</h3>
            </div>
            <div className='v0-ctx-art'>
              <GenderFork />
            </div>
            {/* The border beam: a 100%-based rect riding the cell's own 1px
                seam line (the SVG bleeds 1px so the stroke centers ON it). */}
            <svg className='v0-ctx-beam' aria-hidden='true'>
              <rect pathLength={100} vectorEffect='non-scaling-stroke' />
            </svg>
          </div>

          {/* The review beat: the grid's full-width closing row — the
              ORIGINAL ReviewWorkspace mounted whole, its own left card
              carrying the beat's copy (the Figma note replaces the card's
              words, never the workspace), and the cell remapping the
              light-page tokens to the band's dark family so the mounted
              section reads native to the plate. */}
          <div className='tcb-cell v0-ctx-review' data-cell data-reveal>
            <ReviewWorkspace
              heading='Review and approve from one surface.'
              sub='Edit and approve translations with your team in a side-by-side view with diffs and version history.'
              notes={null}
            />
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
