'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Ban, BookOpenText, CalendarDays, PenLine, Pin, Speech, Users } from 'lucide-react';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { createInkField } from '@/app/d/glyph-rain/sections/band/inkField';
import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import ContextResolve from '@/app/d/toolchain/diagrams/lang/ContextResolve';
import { prefersReducedMotion, target } from '@/app/d/toolchain/diagrams/lang/lang';
import ReviewWorkspace from '@/app/d/toolchain/sections/ReviewWorkspace';

import GtLogoText from '../GtLogoText';

import './context.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * V0 CONTEXT — "One source of context." The section is
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
 * animation included: the accent transfer window runs the live branch's
 * thread on ContextResolve's own clocks (founder note: the blue lives in
 * the threads, never around the box). The review beat is the grid's
 * full-width closing row: its head in the cell, the ORIGINAL ReviewWorkspace
 * mounted beneath on a cell-carried dark ground.
 */

/* ---------- the gender fork, in ContextResolve's own drawing ----------
   Same DOM, same classes, same fork paths as the mounted original — and the
   same announcement (founder note: the blue goes from the threads to
   masculine and feminine, same animations as the application-logic fork):
   once per dwell an accent transfer window runs button → card down the live
   branch's thread, the branches trading on the beat the cards swap,
   masculine first, then feminine, forever. The blue lives in the threads
   and the chip it arrives at, never as a border on the branch boxes. */

const GENDER_FORKS = [
  'M220 0 V14 C220 38 110 28 110 56',
  'M220 0 V14 C220 38 330 28 330 56',
] as const;

type GenderBranch = { value: string; word: string; gloss: string };

const GENDER_BRANCHES: readonly GenderBranch[] = [
  { value: 'masculine', word: 'Bienvenido', gloss: 'greeting a man' },
  { value: 'feminine', word: 'Bienvenida', gloss: 'greeting a woman' },
];

/* ContextResolve's clocks, verbatim — one dwell per branch, the window's
   traverse + rest filling it exactly, the swap landing flush on the dwell
   boundary — so the two forks in the grid breathe on the same beats. */
const GF_DWELL = 3;
const GF_SWAP = 0.5;
const GF_LIFT = -2;
const GF_PULSE_SEG = 0.15;
const GF_PULSE_TRAVERSE = 2;
const GF_PULSE_LEAD = 0.3;
/** Reduced motion parks the fork on this branch: masculine. */
const GF_FROZEN = 0;

/* The window is carved from real geometry, not from a dash pattern: under
   the fork's anisotropic stretch (preserveAspectRatio='none') plus
   non-scaling-stroke, browsers disagree about which space dash distances
   live in. Twin of the helpers in ContextResolve.tsx — duplicated because
   each diagram family owns its own file set, and the original stays
   untouched. */

type PulseTrace = {
  length: number;
  step: number;
  points: readonly { x: number; y: number }[];
};

/** Dense user-space samples (1u apart) of a path. The source `d` is cached
    on the element the first time through: the animation blanks `d` every
    tick, so a re-run of the effect would otherwise trace an emptied path. */
function tracePath(el: SVGPathElement): PulseTrace | null {
  const source = el.dataset.traceD ?? el.getAttribute('d') ?? '';
  if (!source) return null;
  el.dataset.traceD = source;
  if (el.getAttribute('d') !== source) el.setAttribute('d', source);
  const length = el.getTotalLength();
  if (!Number.isFinite(length) || length <= 0) return null;
  const step = 1;
  const count = Math.max(2, Math.ceil(length / step) + 1);
  const points = Array.from({ length: count }, (_, i) => {
    const p = el.getPointAtLength(Math.min(length, i * step));
    return { x: p.x, y: p.y };
  });
  return { length, step, points };
}

/** The point `at` user units along a trace, interpolated between samples. */
function pointOn(trace: PulseTrace, at: number): { x: number; y: number } {
  const t = Math.min(Math.max(at, 0), trace.length) / trace.step;
  const lo = Math.min(trace.points.length - 1, Math.floor(t));
  const hi = Math.min(trace.points.length - 1, lo + 1);
  const a = trace.points[lo];
  const b = trace.points[hi];
  if (!a || !b) return { x: 0, y: 0 };
  const f = t - lo;
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

/** The [from, to] slice of a trace as a path string — empty while the window
    is off either end, so each traversal enters and exits cleanly. */
function windowPath(trace: PulseTrace, from: number, to: number): string {
  const a = Math.max(0, from);
  const b = Math.min(trace.length, to);
  if (b - a < 0.5) return '';
  const start = pointOn(trace, a);
  const parts = [`M${start.x.toFixed(2)} ${start.y.toFixed(2)}`];
  for (let i = Math.ceil(a / trace.step); i * trace.step < b; i++) {
    const p = trace.points[i];
    if (p) parts.push(`L${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
  }
  const end = pointOn(trace, b);
  parts.push(`L${end.x.toFixed(2)} ${end.y.toFixed(2)}`);
  return parts.join(' ');
}

function GenderFork() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const lives = gsap.utils.toArray<SVGGElement>('[data-gf-live]', rootEl);
      const pulses = gsap.utils.toArray<SVGPathElement>('[data-gf-pulse]', rootEl);
      const cards = gsap.utils.toArray<HTMLElement>('[data-gf-card]', rootEl);
      if (
        lives.length !== GENDER_BRANCHES.length ||
        pulses.length !== GENDER_BRANCHES.length ||
        cards.length !== GENDER_BRANCHES.length
      )
        return;

      /* ContextResolve's settle, verbatim: 0.7 keeps the resting card a
         quieter card rather than a grey slab; `lift` holds the live card
         proud so every swap starts from the state the last one ended on. */
      const settle = (i: number, lift = 0) => {
        gsap.set(lives, { autoAlpha: 0 });
        gsap.set(cards, { autoAlpha: 0.7, y: 0 });
        gsap.set(target(lives, i), { autoAlpha: 1 });
        gsap.set(target(cards, i), { autoAlpha: 1, y: lift });
      };

      /* The still frame IS the static accent thread, parked on masculine;
         the pulse never runs and stays hidden from its stylesheet default. */
      if (prefersReducedMotion()) {
        settle(GF_FROZEN);
        return;
      }

      /* In motion the static accent thread stands down — announcing the
         live branch is the pulse's job. Traced before the `d` is blanked. */
      settle(0, GF_LIFT);
      gsap.set(lives, { autoAlpha: 0 });
      const traces = pulses.map(tracePath);
      pulses.forEach((pulse) => pulse.setAttribute('d', ''));
      gsap.set(pulses, { autoAlpha: 0 });
      gsap.set(target(pulses, 0), { autoAlpha: 1 });

      /* The original runs its window clocks and card loop as siblings; here
         they fold onto ONE paused master so the whole loop can gate on the
         bento's viewport dwell. Same arithmetic: the period is branches ×
         dwell, each branch's window makes its VISIBLE run once per period
         (the original's hidden second run is skipped — it never showed),
         and every gate flips while both windows rest off-path. */
      const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'power2.inOut' } });

      pulses.forEach((pulse, k) => {
        const trace = traces[k];
        if (!trace) return;
        const seg = trace.length * GF_PULSE_SEG;
        const journey = trace.length + seg;
        const state = { head: 0 };
        tl.fromTo(
          state,
          { head: 0 },
          {
            head: journey,
            duration: GF_PULSE_TRAVERSE,
            ease: 'none',
            immediateRender: false,
            onUpdate: () => {
              pulse.setAttribute('d', windowPath(trace, state.head - seg, state.head));
            },
          },
          k * GF_DWELL + GF_PULSE_LEAD
        );
      });

      GENDER_BRANCHES.forEach((_, k) => {
        const i = (k + 1) % GENDER_BRANCHES.length;
        const at = (k + 1) * GF_DWELL - GF_SWAP;
        tl.to(target(pulses, k), { autoAlpha: 0, duration: GF_SWAP }, at)
          .to(target(pulses, i), { autoAlpha: 1, duration: GF_SWAP }, at)
          .fromTo(
            target(cards, k),
            { autoAlpha: 1, y: GF_LIFT },
            { autoAlpha: 0.7, y: 0, duration: GF_SWAP, immediateRender: false },
            at
          )
          .fromTo(
            target(cards, i),
            { autoAlpha: 0.7, y: 0 },
            { autoAlpha: 1, y: GF_LIFT, duration: GF_SWAP, immediateRender: false },
            at
          );
      });

      tl.duration(GENDER_BRANCHES.length * GF_DWELL);

      ScrollTrigger.create({
        trigger: rootEl.closest('.v0-ctx-dyn') ?? rootEl,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause();
        },
      });
    },
    { scope: root }
  );

  return (
    <div
      className='lang lang-cr lang-accent-on'
      ref={root}
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

      {/* ContextResolve's layer order, verbatim: both inks first, both
          pulses next, both cores last — the pulse rides between its thread
          and the carve, so mid-travel the window is two blue hairlines. The
          static accent pair closes the stack as the reduced-motion still. */}
      <svg className='lang-cr-fork' viewBox='0 0 440 56' preserveAspectRatio='none' aria-hidden='true'>
        {GENDER_FORKS.map((d) => (
          <path className='lang-cr-thread' d={d} key={`thread-${d}`} />
        ))}
        {GENDER_FORKS.map((d) => (
          <path className='lang-cr-pulse' data-gf-pulse='' d={d} key={`pulse-${d}`} />
        ))}
        {GENDER_FORKS.map((d) => (
          <path className='lang-cr-core' d={d} key={`core-${d}`} />
        ))}
        {GENDER_FORKS.map((d) => (
          <g data-gf-live='' key={`live-${d}`}>
            <path className='lang-cr-thread is-live' d={d} />
            <path className='lang-cr-core' d={d} />
          </g>
        ))}
      </svg>

      <div className='lang-cr-branches'>
        {GENDER_BRANCHES.map((branch) => (
          <div className='lang-cr-branch' data-gf-card='' key={branch.value}>
            <p className='lang-cr-ctx'>
              <span className='lang-cr-attr'>gender=</span>
              <span className='lang-cr-val'>&ldquo;{branch.value}&rdquo;</span>
            </p>
            <p className='lang-cr-result' lang='es'>
              {branch.word}
            </p>
            {/* the gloss is the explainer (founder round: easier to
                understand) — WHY the word changes, beside the locale */}
            <p className='lang-cr-gloss'>
              <span className='lang-tag'>
                <LocaleTag code='es' />
              </span>
              {branch.gloss}
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
  icon: LucideIcon;
  text: ReactNode;
  /** every directive shows its evidence — a real before→after pair
      (founder round: the Sie row had one; now they all do) */
  pair?: { before: string; after: string };
};

const DIRECTIVES: readonly Directive[] = [
  {
    label: 'Audience',
    icon: Users,
    text: 'Avoid jargon.',
    pair: { before: 'Persistieren…', after: 'Speichern…' },
  },
  {
    label: 'Formality',
    icon: Speech,
    text: 'Use the formal “Sie.”',
    pair: { before: 'Du kannst…', after: 'Sie können…' },
  },
  {
    label: 'Conventions',
    icon: PenLine,
    text: 'Use active voice.',
    pair: { before: 'Wird geladen…', after: 'Lädt…' },
  },
  {
    label: 'Formatting',
    icon: CalendarDays,
    text: 'Use German date order.',
    pair: { before: '07/30/2026', after: DE_DATE },
  },
];

export default function V0Context() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLCanvasElement>(null);
  const core = useRef<HTMLDivElement>(null);

  /* The band's material. The ink field's rAF, resize, clearing re-measure
     and reduced-motion still are internal to the engine — destroy() on
     unmount is ours. */
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
          {/* the standardized context glyph — same watermark grammar as
              every other section head */}
          <BookOpenText className='tc-head-icon' strokeWidth={1} aria-hidden />
          <h2>One source of context, shared globally</h2>
          <p>
            <GtLogoText /> understands your codebase and product.
          </p>
        </div>

        <div className='tcb-grid'>
          <div className='tcb-cell v0-ctx-cell' data-cell data-reveal>
            <div className='tcb-cap'>
              <h3>Meaningful translations of your logical flow</h3>
            </div>
            <div className='v0-ctx-art'>
              <ContextResolve title='The English string Save resolves by context: speichern when it saves a file, sparen when it means a discount' />
            </div>
          </div>

          <div className='tcb-cell v0-ctx-cell' data-cell data-reveal>
            <div className='tcb-cap'>
              <h3>Consistent wording for your brand and audience</h3>
            </div>
            <div className='v0-ctx-art'>
              <div className='v0-ctx-glossary'>
                <div className='v0-ctx-glossary-head'>
                  <b>Vault</b>
                  <span className='v0-ctx-rule'>
                    <Pin aria-hidden strokeWidth={1.75} />
                    pinned
                  </span>
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
                  <b className='v0-ctx-gterm'>
                    {/* the mark, not the letter — the house never writes
                        the wordmark plain */}
                    <img alt='' className='v0-ctx-gmark' src='/brand/locadex-mark.svg' />
                    Locadex
                  </b>
                  <span className='v0-ctx-rule'>
                    <Ban aria-hidden strokeWidth={1.75} />
                    never translate
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='tcb-cell v0-ctx-cell' data-cell data-reveal>
            <div className='tcb-cap'>
              <h3>Tone and style to preserve your voice</h3>
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
                {DIRECTIVES.map((directive) => {
                  const Icon = directive.icon;
                  return (
                    <div className='v0-ctx-dir' key={directive.label}>
                      <b>
                        <Icon aria-hidden strokeWidth={1.75} />
                        {directive.label}
                      </b>
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
                  );
                })}
              </div>
            </div>
          </div>

          <div className='tcb-cell v0-ctx-cell v0-ctx-dyn' data-cell data-reveal>
            <div className='tcb-cap'>
              <h3>Built-in handling for dynamic context</h3>
            </div>
            <div className='v0-ctx-art'>
              <GenderFork />
            </div>
          </div>

          {/* The review beat: the grid's full-width closing row — the
              ORIGINAL ReviewWorkspace mounted whole, its own left card
              carrying the beat's copy (the Figma note replaces the card's
              words, never the workspace), and the cell remapping the
              light-page tokens to the band's dark family so the mounted
              section reads native to the plate. */}
          <div className='tcb-cell v0-ctx-review' data-cell data-reveal>
            <ReviewWorkspace
              chrome='product'
              heading='Review and approve with your team, over web, API, or CLI.'
              sub={null}
              notes={null}
              surfaces
            />
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
