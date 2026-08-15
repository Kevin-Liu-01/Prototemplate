'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import LocaleTag from '../../../toolchain/components/LocaleTag';
import {
  langClass,
  prefersReducedMotion,
} from './lang';
import './lang.css';

gsap.registerPlugin(useGSAP);

/**
 * The landing fork, customized for the enterprise argument: the same
 * English sentence forks into two German readings — ungoverned on the
 * left (struck), brand-core on the right — and the accent pulse only
 * ever travels the governed branch. Both branches stay drawn so the
 * fork reads at rest; under reduced motion the governed branch holds
 * its static accent thread instead.
 */

/** Same geometry as the landing fork: mirror-image curves off one stem. */
const FORKS = [
  'M220 0 V14 C220 38 110 28 110 56',
  'M220 0 V14 C220 38 330 28 330 56',
] as const;

const GOVERNED = 1;
const PULSE_SEG = 0.15;
const PULSE_TRAVERSE = 2;
const PULSE_REST = 1.4;

/* The window is carved from real geometry, not a dash pattern — under
   preserveAspectRatio='none' plus non-scaling-stroke, dash distances
   drift between engines. Twin of the helpers in the landing's
   ContextResolve. */

type PulseTrace = {
  length: number;
  step: number;
  points: readonly { x: number; y: number }[];
};

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

export default function EnterpriseContextFork() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;
      const live = rootEl.querySelector<SVGGElement>('[data-fork-live]');
      const pulse = rootEl.querySelector<SVGPathElement>('[data-fork-pulse]');
      if (!live || !pulse) return;

      /* the still IS the static accent thread on the governed branch */
      if (prefersReducedMotion()) {
        gsap.set(live, { autoAlpha: 1 });
        return;
      }

      gsap.set(live, { autoAlpha: 0 });
      const trace = tracePath(pulse);
      pulse.setAttribute('d', '');
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
        delay: 0.4,
        onUpdate: () => {
          pulse.setAttribute(
            'd',
            windowPath(trace, state.head - seg, state.head)
          );
        },
      });
    },
    { scope: root }
  );

  return (
    <div
      className={langClass('lang-cr', true, 'tcg-fork')}
      ref={root}
      role='img'
      aria-label={'The same English sentence translated into German with and without the brand-core rule: without it, Locadex is mistranslated as Standort-Index; with it, the product name is preserved'}
    >
      <p className='lang-cr-source'>
        <span className='lang-tag'>
          <LocaleTag code='en' />
        </span>
        <span className='lang-cr-word'>
          Locadex opens the PR for your review.
        </span>
      </p>

      {/* the brand's doubled line: each branch stroked twice — a
          full-gauge underline and a card-colored core — two parallel
          threads at constant gap. Source and translation, side by side. */}
      <svg
        className='lang-cr-fork'
        viewBox='0 0 440 56'
        preserveAspectRatio='none'
        aria-hidden='true'
      >
        {FORKS.map((d) => (
          <path className='lang-cr-thread' d={d} key={d} />
        ))}
        <path
          className='lang-cr-pulse'
          data-fork-pulse=''
          d={FORKS[GOVERNED]}
        />
        {FORKS.map((d) => (
          <path className='lang-cr-core' d={d} key={d} />
        ))}
        {/* the governed branch's static accent pair — the reduced-motion
            still */}
        <g data-fork-live=''>
          <path className='lang-cr-thread is-live' d={FORKS[GOVERNED]} />
          <path className='lang-cr-core' d={FORKS[GOVERNED]} />
        </g>
      </svg>

      <div className='lang-cr-branches'>
        <div className='lang-cr-branch is-off'>
          <p className='lang-cr-ctx'>
            <span className='lang-cr-attr'>
                <span>Without</span>
            </span>{' '}
            <LocaleTag code='de' />
          </p>
          <p className='lang-cr-result' lang='de'>
            <s>Standort-Index öffnet die PR, damit du sie prüfst.</s>
          </p>
        </div>
        <div className='lang-cr-branch is-on'>
          <p className='lang-cr-ctx'>
            <span className='lang-cr-attr'>
                <span>With brand-core</span>
            </span>{' '}
            <LocaleTag code='de' />
          </p>
          <p className='lang-cr-result' lang='de'>
            <b>Locadex öffnet den PR zu Ihrer Prüfung.</b>
          </p>
        </div>
      </div>
    </div>
  );
}
