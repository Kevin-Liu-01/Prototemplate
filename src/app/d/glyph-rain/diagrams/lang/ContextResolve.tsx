'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import { langA11y, langClass, prefersReducedMotion, target, type LangProps } from './lang';
import './lang.css';

gsap.registerPlugin(useGSAP);

/**
 * Why a translation memory is not enough: "Save" is two different German
 * verbs, and only the surrounding intent decides which.
 *
 * `speichern` writes a file; `sparen` keeps money. A model handed the bare
 * string has to guess; a model handed `context` does not. Both branches stay
 * drawn at all times so the fork is readable at rest — the loop only decides
 * which one is currently live.
 *
 * The live branch is announced by transfer, not by tint: a short accent
 * window runs button → card down that branch only, back to back, and swaps
 * sides on the same beat the cards swap. The resting branch stays quiet ink.
 * Under reduced motion nothing travels — the live branch holds its static
 * accent thread instead, which is also the diagram's canonical still.
 *
 * Accent: the live branch's pulse.
 */

type Branch = {
  context: string;
  result: string;
  gloss: string;
};

const SOURCE = 'Save';

const BRANCHES: readonly Branch[] = [
  { context: 'file', result: 'speichern', gloss: 'write it to disk' },
  { context: 'discount', result: 'sparen', gloss: 'spend less money' },
];

const DWELL = 3;
/** Reduced motion freezes on the first branch; both stay legible either way. */
const FROZEN = 0;

/** One fork path per branch, in BRANCHES order: `context="file"` peels left,
    `context="discount"` peels right. Shared by the quiet pair, the pulse and
    the live (reduced-motion) pair, so the three layers can never drift. */
const FORKS = ['M220 0 V14 C220 38 110 28 110 56', 'M220 0 V14 C220 38 330 28 330 56'] as const;

/** The traveling window, as a fraction of its branch's length. */
const PULSE_SEG = 0.15;
/** Seconds per traversal, plus the beat before the window re-enters. Just
    under the dwell, so every active phase carries at least one full run. */
const PULSE_TRAVERSE = 2.4;
const PULSE_REST = 0.2;

/* The window is carved from real geometry, not from a dash pattern: under
   this SVG's anisotropic stretch (preserveAspectRatio='none') plus
   non-scaling-stroke, browsers disagree about which space dash distances
   live in, so a dashed window drifts, doubles, or parks. Sampling the path
   once in user space and rewriting the pulse's `d` to the exact sub-polyline
   each tick is deterministic everywhere. Twin of the helpers in
   ../TranslationFlow.tsx — duplicated because each diagram family owns its
   own file set. */

type PulseTrace = {
  length: number;
  step: number;
  points: readonly { x: number; y: number }[];
};

/** Dense user-space samples (1u apart) of a path, taken once per mount. */
function tracePath(el: SVGPathElement): PulseTrace {
  const length = el.getTotalLength();
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

export default function ContextResolve({ className, accent = true, title }: LangProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const paths = gsap.utils.toArray<SVGGElement>('[data-cr-live]', rootEl);
      const pulses = gsap.utils.toArray<SVGPathElement>('[data-cr-pulse]', rootEl);
      const cards = gsap.utils.toArray<HTMLElement>('[data-cr-card]', rootEl);
      if (paths.length !== BRANCHES.length || pulses.length !== BRANCHES.length || cards.length !== BRANCHES.length)
        return;

      /* 0.7, not lower: the resting branch holds an ink-filled button now, and
         a deeper fade turned it into a grey slab rather than a quieter card. */
      const settle = (i: number) => {
        gsap.set(paths, { autoAlpha: 0 });
        gsap.set(cards, { autoAlpha: 0.7, y: 0 });
        gsap.set(target(paths, i), { autoAlpha: 1 });
        gsap.set(target(cards, i), { autoAlpha: 1, y: 0 });
      };

      /* The still frame IS the static accent thread; the pulse never runs and
         stays hidden from its stylesheet default. */
      if (prefersReducedMotion()) {
        settle(FROZEN);
        return;
      }

      /* In motion the static accent thread stands down — announcing the live
         branch is the pulse's job, and blue-on-blue would erase it. */
      settle(0);
      gsap.set(paths, { autoAlpha: 0 });
      /* Traced before the `d` is blanked — an emptied path has no length. */
      const traces = pulses.map(tracePath);
      pulses.forEach((pulse) => pulse.setAttribute('d', ''));
      gsap.set(pulses, { autoAlpha: 0 });
      gsap.set(target(pulses, 0), { autoAlpha: 1 });

      /* Each branch's window travels forever on its own clock, button → card
         with an overshoot of one window so it fully clears into the card;
         which one is VISIBLE is decided by the timeline below — so the swap
         lands exactly on the beat the cards swap, and mid-travel handoffs
         stay smooth fades. */
      pulses.forEach((pulse, k) => {
        const trace = traces[k];
        if (!trace) return;
        const seg = trace.length * PULSE_SEG;
        const journey = trace.length + seg;
        const state = { head: 0 };
        gsap.to(state, {
          head: journey,
          duration: PULSE_TRAVERSE,
          ease: 'none',
          repeat: -1,
          repeatDelay: PULSE_REST,
          delay: (k * PULSE_TRAVERSE) / 2,
          onUpdate: () => {
            pulse.setAttribute('d', windowPath(trace, state.head - seg, state.head));
          },
        });
      });

      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });

      BRANCHES.forEach((_, k) => {
        const i = (k + 1) % BRANCHES.length;
        const prev = k % BRANCHES.length;
        const at = (k + 1) * DWELL - 0.7;
        tl.to(target(pulses, prev), { autoAlpha: 0, duration: 0.55 }, at)
          .to(target(cards, prev), { autoAlpha: 0.7, y: 0, duration: 0.55 }, at)
          .to(target(pulses, i), { autoAlpha: 1, duration: 0.55 }, at + 0.2)
          /* `immediateRender: false` or the fromTo would apply its own start
             state the moment the timeline is built, overriding the settled
             frame the diagram opens on. */
          .fromTo(
            target(cards, i),
            { autoAlpha: 0.7, y: 4 },
            { autoAlpha: 1, y: 0, duration: 0.6, immediateRender: false },
            at + 0.2,
          );
      });

      tl.duration(BRANCHES.length * DWELL);
    },
    { scope: root },
  );

  return (
    <div className={langClass('lang-cr', accent, className)} ref={root} {...langA11y(title)}>
      <p className='lang-cr-source'>
        <span className='lang-tag'>
          <LocaleTag code='en' />
        </span>
        <span className='lang-cr-word'>{SOURCE}</span>
      </p>

      {/* The fork is drawn with the brand's doubled line: each branch is one
          path stroked twice — a full-gauge underline and a card-colored core —
          which leaves two parallel 1.5px threads at a constant 3px gap along
          the whole curve. Source and translation, running side by side. */}
      <svg className='lang-cr-fork' viewBox='0 0 440 56' preserveAspectRatio='none' aria-hidden='true'>
        {/* Quiet layer: both inks first, both pulses next, both cores last —
            the pulse rides between its thread and the carve, so mid-travel the
            window is two blue hairlines (both strands share the stem, so the
            pulse must outlive its own branch's core repaint). */}
        {FORKS.map((d) => (
          <path className='lang-cr-thread' d={d} key={d} />
        ))}
        {FORKS.map((d) => (
          <path className='lang-cr-pulse' data-cr-pulse='' d={d} key={d} />
        ))}
        {FORKS.map((d) => (
          <path className='lang-cr-core' d={d} key={d} />
        ))}
        {/* The static accent pair — the reduced-motion still. In motion these
            stay down and the pulse above carries the live branch instead. */}
        {FORKS.map((d) => (
          <g data-cr-live='' key={d}>
            <path className='lang-cr-thread is-live' d={d} />
            <path className='lang-cr-core' d={d} />
          </g>
        ))}
      </svg>

      <div className='lang-cr-branches'>
        {BRANCHES.map((branch) => (
          <div className='lang-cr-branch' data-cr-card='' key={branch.context}>
            <p className='lang-cr-ctx'>
              <span className='lang-cr-attr'>context=</span>
              <span className='lang-cr-val'>&ldquo;{branch.context}&rdquo;</span>
            </p>
            <p className='lang-cr-result' lang='de'>
              {branch.result}
            </p>
            <p className='lang-cr-gloss'>
              <span className='lang-tag'>
                <LocaleTag code='de' />
              </span>
              {branch.gloss}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
