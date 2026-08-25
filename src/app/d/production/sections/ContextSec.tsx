'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Ban, BookOpen, CalendarDays, PenLine, Pin, Speech, Users } from 'lucide-react';
import { useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';
import ContextResolve from '@/app/d/toolchain/diagrams/lang/ContextResolve';
import { prefersReducedMotion, target } from '@/app/d/toolchain/diagrams/lang/lang';

import GtLogoText from './GtLogoText';

import ReviewWorkspace from './ReviewWorkspace';

import './context.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * "One source of context" — a toolchain dark-band (tc-band tcb → tcb-in →
 * tcb-head cell → tcb-grid of framed tcb-cells): four title-only bentos
 * (the ContextResolve fork, the glossary ledger, the directives ledger,
 * the gender fork cut in ContextResolve's drawing) closed by a full-width
 * review row mounting ReviewWorkspace.
 *
 * PRODUCTION reproduction: the shipped section's own copy, structure and
 * counts, with gt-next's <T>/gt() resolved to their en-US strings.
 */

/* ---------- the gender fork, in ContextResolve's own drawing ----------
   Same DOM, same classes, same fork paths and same announcement as the
   mounted ContextResolve: once per dwell an accent transfer window runs
   button → card down the live branch's thread, the branches trading on
   the beat the cards swap, masculine first, then feminine, forever. The
   blue lives in the threads and the chip it arrives at, never as a border
   on the branch boxes. */

const GENDER_FORKS = [
  'M220 0 V14 C220 38 110 28 110 56',
  'M220 0 V14 C220 38 330 28 330 56',
] as const;

type GenderBranch = { value: string; word: string; gloss: string };

/** value and word are the fork's specimens (the gender attribute, the
    Spanish renderings) and stay verbatim; the gloss is the English
    explainer. */
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
   live in. Twin of the helpers in ContextResolve.tsx. */

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

      /* Window clocks and the card loop fold onto ONE paused master so the
         whole loop can gate on the bento's viewport dwell. The period is
         branches × dwell, each branch's window makes its VISIBLE run once
         per period, and every gate flips while both windows rest
         off-path. */
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
  text: string;
  /** every directive shows its evidence — a real before→after pair */
  pair?: { before: string; after: string };
};

/* Labels and directive texts are the panel's English display copy; the
   before→after pairs are the German evidence specimens and stay
   verbatim. */
const DIRECTIVES: readonly Directive[] = [
  {
    label: 'Audience',
    icon: Users,
    text: 'Avoid jargon',
    pair: { before: 'Persistieren…', after: 'Speichern…' },
  },
  {
    label: 'Formality',
    icon: Speech,
    text: 'Use the formal “Sie”',
    pair: { before: 'Du kannst…', after: 'Sie können…' },
  },
  {
    label: 'Conventions',
    icon: PenLine,
    text: 'Use active voice',
    pair: { before: 'Wird geladen…', after: 'Lädt…' },
  },
  {
    label: 'Formatting',
    icon: CalendarDays,
    text: 'Use German date order',
    pair: { before: '07/30/2026', after: DE_DATE },
  },
];

export default function V0Context() {
  return (
    <section className='tc-band tcb v0-ctx' id='context'>
      <div className='tcb-in'>
        <div>
          {/* the head is the Developer head VERBATIM, wording and icon
            switched — same tc-head grammar, same watermark seat, the
            BookOpen mark where Code2 stands there */}
          <div className='tc-head'>
            <BookOpen className='tc-head-icon v0-ctx-head-icon' strokeWidth={1} aria-hidden />
            <h2 data-reveal>
              One source of context, <br className='v0-ctx-title-break' />
              shared everywhere
            </h2>
            <p data-reveal>
              <GtLogoText /> understands your codebase and your product, so every translation
              carries context
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
                    <b>Custom Prompts</b>
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

            {/* The grid's full-width closing row: ReviewWorkspace mounted
              whole — only the left card's copy changes, never the
              workspace — with the cell remapping the light-page tokens to
              the band's dark family so the mounted section reads native
              to the plate. */}
            <div className='tcb-cell v0-ctx-review' data-cell data-reveal>
              <ReviewWorkspace
                chrome='product'
                heading='Review and approve with your team, over web, API, or CLI'
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
