'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import LocaleTag from '../components/LocaleTag';

import './flow.css';

gsap.registerPlugin(useGSAP);

/**
 * Translation — the real file, forked into the real outputs.
 *
 * The left panel is the component the hero terminal already translated, line
 * for line; the three files on the right are the exact `output` path that
 * `gt.config.json` declares one cell away, each holding the three strings the
 * pipeline actually produces for it. Nothing stands in for anything: the
 * squiggle-slab illustration this replaces showed grey bars where the entire
 * argument — the strings themselves — should have been.
 *
 * The fan-out is drawn with the brand's doubled line: one trunk leaves the
 * panel (two threads, exactly), splits at a drawn junction, and each branch
 * is one path stroked twice (full-gauge ink under a surface-colored core),
 * leaving two parallel threads at constant gauge — source and translation,
 * side by side.
 *
 * The transfer is drawn on those same threads: a short accent window slides
 * source → file along each connector (trunk first, handed off to the branch
 * at the junction), staggered per branch. The window is a dashed stroke at
 * full sandwich gauge layered UNDER the core, so mid-pulse the motif is still
 * two clean hairlines — both strands blue for the length of the window, never
 * a filled slab. Reduced motion never starts the loop; the still fork carries
 * the cell.
 *
 * Accent: the middle output, the locale currently resolving — and the pulse.
 */

type Tone = 'plain' | 'kw' | 'gt' | 'str';

type Chunk = readonly [Tone, string];

const SRC: readonly (readonly Chunk[])[] = [
  [
    ['kw', 'import'],
    ['plain', ' { '],
    ['gt', 'T'],
    ['plain', ' } '],
    ['kw', 'from'],
    ['str', " 'gt-next'"],
    ['plain', ';'],
  ],
  [['plain', '']],
  [
    ['kw', 'export default function'],
    ['plain', ' Home() {'],
  ],
  [
    ['kw', '  return'],
    ['plain', ' ('],
  ],
  [
    ['plain', '    <'],
    ['gt', 'T'],
    ['plain', '>'],
  ],
  [['plain', '      <h1>Hello, world!</h1>']],
  [['plain', '      <p>Get started</p>']],
  [['plain', '      <p>Payment received</p>']],
  [
    ['plain', '    </'],
    ['gt', 'T'],
    ['plain', '>'],
  ],
  [['plain', '  );']],
  [['plain', '}']],
];

/** Each output holds the three strings the source declares — the same pairs
    the hero terminal prints, because they are the same project. */
const OUTS: readonly {
  file: string;
  lang: string;
  pairs: readonly (readonly [string, string])[];
  lit?: boolean;
}[] = [
  {
    file: 'public/_gt/es.json',
    lang: 'es',
    pairs: [
      ['Hello, world!', '"¡Hola, mundo!"'],
      ['Get started', '"Comenzar ahora"'],
      ['Payment received', '"Pago recibido"'],
    ],
  },
  {
    file: 'public/_gt/ja.json',
    lang: 'ja',
    lit: true,
    pairs: [
      ['Hello, world!', '"こんにちは世界！"'],
      ['Get started', '"始める"'],
      ['Payment received', '"支払いを受領しました"'],
    ],
  },
  {
    file: 'public/_gt/de.json',
    lang: 'de',
    pairs: [
      ['Hello, world!', '"Hallo, Welt!"'],
      ['Get started', '"Jetzt starten"'],
      ['Payment received', '"Zahlung erhalten"'],
    ],
  },
];

/** Fork geometry, in viewBox units: one doubled trunk leaves the panel, and
    the three branches split at a drawn junction. At the panel edge the motif
    is exactly two threads — the trunk — never three overlapped strokes. */
const TRUNK = 'M0 130 L18 130';
const FORK = ['M18 130 C40 104 46 34 72 34', 'M18 130 L72 130', 'M18 130 C40 156 46 226 72 226'];

/** Pulse pacing, in viewBox user units per second. The branches differ in
    length (54–120 units), so a shared speed — not a shared duration — is what
    keeps every journey moving alike and continuous through the junction.
    ~40u/s lands the traversals around the 2–4s band. */
const PULSE_SPEED = 40;
/** One journey leaves the panel every stagger; three make the full cycle. */
const PULSE_STAGGER = 2.4;

/* The window is carved from real geometry, not from a dash pattern: under
   this SVG's anisotropic stretch (preserveAspectRatio='none') plus
   non-scaling-stroke, browsers disagree about which space dash distances
   live in, so a dashed window drifts, doubles, or parks. Sampling the path
   once in user space and rewriting the pulse's `d` to the exact sub-polyline
   each tick is deterministic everywhere. Twin of the helpers in
   ./lang/ContextResolve.tsx — duplicated because each diagram family owns
   its own file set. */

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

/** The [from, to] slice of a trace as a path string — empty when the window
    has not entered (or has fully left) this path, which is what lets one
    window hand off cleanly from the trunk to a branch. */
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

export type TranslationFlowProps = {
  className?: string;
  title?: string;
};

export default function TranslationFlow({ className, title }: TranslationFlowProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;
      /* The pulse ships hidden in CSS; a reader who asked for less movement
         simply never sees it, and the fork holds its canonical still. */
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const branchPulses = gsap.utils.toArray<SVGPathElement>('[data-tf-branch-pulse]', rootEl);
      const trunkPulses = gsap.utils.toArray<SVGPathElement>('[data-tf-trunk-pulse]', rootEl);
      const firstTrunk = trunkPulses[0];
      if (!firstTrunk || branchPulses.length !== FORK.length || trunkPulses.length !== FORK.length) return;

      const trunk = tracePath(firstTrunk);
      const cycle = PULSE_STAGGER * FORK.length;

      branchPulses.forEach((branchPulse, k) => {
        const trunkPulse = trunkPulses[k];
        if (!trunkPulse) return;

        const branch = tracePath(branchPulse);
        /* ~20% of the branch, hard-clamped: the fork column renders narrow
           (~56px), so anything shorter reads as a tick rather than a
           transfer, and anything longer stops reading as a segment. */
        const seg = gsap.utils.clamp(14, 24, branch.length * 0.2);
        /* One head runs the whole journey — trunk, junction, branch — and the
           two path slices are computed from the same coordinate, so the
           window crosses the junction as one object. `journey` overshoots by
           `seg` so the tail fully clears into the file panel. */
        const journey = trunk.length + branch.length + seg;
        const state = { head: 0 };

        branchPulse.setAttribute('d', '');
        trunkPulse.setAttribute('d', '');
        gsap.set([trunkPulse, branchPulse], { opacity: 1 });

        gsap.to(state, {
          head: journey,
          duration: journey / PULSE_SPEED,
          ease: 'none',
          repeat: -1,
          repeatDelay: cycle - journey / PULSE_SPEED,
          delay: k * PULSE_STAGGER,
          onUpdate: () => {
            trunkPulse.setAttribute('d', windowPath(trunk, state.head - seg, state.head));
            branchPulse.setAttribute('d', windowPath(branch, state.head - seg - trunk.length, state.head - trunk.length));
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <div
      className={['tflow', className].filter(Boolean).join(' ')}
      ref={root}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <div className='tf-src'>
        <div className='tf-src-bar'>app/page.tsx</div>
        <pre>
          {SRC.map((line, i) => (
            <div className='tf-src-line' key={i}>
              <span className='tf-src-n'>{i + 1}</span>
              <code>
                {line.map(([tone, text], j) =>
                  tone === 'plain' ? text : (
                    <span className={`tf-t-${tone}`} key={j}>
                      {text}
                    </span>
                  ),
                )}
                {line.length === 1 && line[0]?.[1] === '' ? ' ' : null}
              </code>
            </div>
          ))}
        </pre>
      </div>

      <svg className='tf-fork' viewBox='0 0 72 260' preserveAspectRatio='none' aria-hidden='true'>
        {/* Each pulse sits between its thread and its core, so the one core
            carves ink and window alike into the same two hairlines. */}
        {FORK.map((d) => (
          <g key={d}>
            <path className='tf-thread' d={d} />
            <path className='tf-pulse' data-tf-branch-pulse='' d={d} />
            <path className='tf-core' d={d} />
          </g>
        ))}
        {/* Trunk last, so its core carves one clean pair through the junction.
            It carries one pulse path per branch journey, so three staggered
            transfers can each cross the trunk on their own clock. */}
        <g>
          <path className='tf-thread' d={TRUNK} />
          {FORK.map((d) => (
            <path className='tf-pulse' data-tf-trunk-pulse='' d={TRUNK} key={d} />
          ))}
          <path className='tf-core' d={TRUNK} />
        </g>
      </svg>

      <div className='tf-outs'>
        {OUTS.map((out) => (
          <div className={`tf-out${out.lit ? ' is-lit' : ''}`} key={out.file}>
            <div className='tf-out-bar'>
              <span className='tf-out-file'>{out.file}</span>
              <span className='tf-out-tag'>
                <LocaleTag code={out.lang} />
              </span>
            </div>
            <div className='tf-out-body'>
              {out.pairs.map(([src, val]) => (
                <div className='tf-pair' key={src}>
                  <span className='tf-pair-key'>{src}</span>
                  <b className='tf-pair-val' lang={out.lang}>
                    {val}
                  </b>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
