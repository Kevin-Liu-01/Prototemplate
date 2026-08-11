import Link from 'next/link';
import type { ReactNode } from 'react';

import './system-ledger.css';

/**
 * Two landing blocks: the capabilities ledger and the laws learned.
 * Self-contained. It consumes only the --pt-* tokens inherited from
 * .pt-root, never prototemplate.css classes, so mount position and
 * stylesheet order cannot change how it paints.
 */

type Capability = {
  name: string;
  law: string;
  /** Route to a live instance; rows without one wear a flat mono tag. */
  href?: string;
  see: string;
};

const CAPABILITIES: Capability[] = [
  {
    name: 'Glyph field',
    law: 'Text rasterized to a brick lattice; every mote lands on real ink. Live on the dossier hero.',
    href: '/docs/libraries',
    see: '/docs/libraries',
  },
  {
    name: 'Hero morph',
    law: 'The headline dissolves to dust and reprints through a clip front, driven by the locale belt, one clock.',
    href: '/d/singularity-dossier',
    see: '/d/singularity-dossier',
  },
  {
    name: 'Locale belt',
    law: 'A gsap-ticker marquee whose crossings drive the whole hero; the remeasure preserves continuity.',
    href: '/d/singularity-dossier',
    see: '/d/singularity-dossier',
  },
  {
    name: 'Scroll story stage',
    law: 'A damped dial scrubs a piecewise time map; copy locks in at a fixed read line. Below the dossier fold.',
    href: '/d/singularity-dossier',
    see: '/d/singularity-dossier',
  },
  {
    name: 'Iso kit',
    law: 'Isometric tower and plate primitives with shape and image APIs, and a dithered-logo layer.',
    href: '/docs/libraries',
    see: '/docs/libraries',
  },
  {
    name: 'Bayer dither',
    law: 'Eight authentic ordered-dither presets, switchable.',
    href: '/docs/libraries',
    see: '/docs/libraries',
  },
  {
    name: 'Seam compare',
    law: 'The drag seam that sweeps two page faces, at work on this page’s site cards.',
    see: 'this page',
  },
  {
    name: 'Sentence reassembler',
    law: 'Words fly to their seats in reading order.',
    href: '/docs/libraries',
    see: '/docs/libraries',
  },
  {
    name: 'Prismatic field',
    law: 'The shader field behind the deck feature. By @sabosugi.',
    see: 'this page',
  },
  {
    name: 'Ink rain',
    law: 'Margin glyph rain with a quiet zone that follows the copy.',
    href: '/d/glyph-rain',
    see: '/d/glyph-rain',
  },
  {
    name: 'Gallery shooter',
    law: 'The harness that shot every tile on this page: section-anchored element screenshots, both themes, both widths.',
    see: 'docs/harness/gallery-shoot.mjs',
  },
  {
    name: 'Pixel auditor',
    law: 'Walks every rendered line on every page; a single doubled rule fails the round.',
    see: 'every round',
  },
];

/* ------------------------------------------------------------------
   The law figures. House diagram voice: 240x140 viewBox, 1px hairline
   strokes, the diagonal hatch for whatever is inert or discarded,
   Space Grotesk micro-labels, one accent element per drawing. Every
   figure is aria-hidden; the law text carries the meaning. Pattern
   ids are unique per figure so defs never collide when all eight
   mount on one page.
   ------------------------------------------------------------------ */

type HatchDefsProps = { id: string };

function HatchDefs({ id }: HatchDefsProps) {
  return (
    <defs>
      <pattern
        height='7'
        id={id}
        patternTransform='rotate(-45)'
        patternUnits='userSpaceOnUse'
        width='7'
      >
        <line className='sl-fig-hatchline' x1='0.5' x2='0.5' y1='0' y2='7' />
      </pattern>
    </defs>
  );
}

/* 01: two phones, one svh line; dvh reaches lower once the bar goes */
function FigViewportUnits() {
  return (
    <svg aria-hidden='true' className='sl-fig' viewBox='0 0 240 140'>
      <HatchDefs id='sl-hatch-01' />
      {/* left phone: URL bar present, hatched */}
      <rect className='sl-fig-stroke' height='112' width='64' x='26' y='14' />
      <rect className='sl-fig-hatch' fill='url(#sl-hatch-01)' height='14' width='64' x='26' y='14' />
      <line className='sl-fig-stroke' x1='26' x2='90' y1='28' y2='28' />
      {/* right phone: the bar collapsed to a sliver */}
      <rect className='sl-fig-stroke' height='112' width='64' x='132' y='14' />
      <rect className='sl-fig-hatch' fill='url(#sl-hatch-01)' height='4' width='64' x='132' y='14' />
      <line className='sl-fig-stroke' x1='132' x2='196' y1='18' y2='18' />
      {/* svh: one height, crossing both phones */}
      <line className='sl-fig-accent' x1='20' x2='196' y1='104' y2='104' />
      {/* dvh brackets: the left stops at the svh line, the right reaches
          lower, and the delta it gains is hatched */}
      <polyline className='sl-fig-stroke' points='94,28 98,28 98,104 94,104' />
      <polyline className='sl-fig-stroke' points='202,18 206,18 206,126 202,126' />
      <rect className='sl-fig-hatch' fill='url(#sl-hatch-01)' height='22' width='64' x='132' y='104' />
      <text className='sl-fig-label is-accent' textAnchor='end' x='16' y='107'>
        svh
      </text>
      <text className='sl-fig-label' x='212' y='75'>
        dvh
      </text>
      <text className='sl-fig-label' textAnchor='end' x='22' y='25'>
        bar
      </text>
    </svg>
  );
}

/* 02: the same S-curve twice; even dashes above, bunched dashes below */
function FigDashSpace() {
  return (
    <svg aria-hidden='true' className='sl-fig' viewBox='0 0 240 140'>
      <path
        className='sl-fig-dash-even'
        d='M16,38 C56,4 96,72 136,38 C160,18 186,20 210,34'
      />
      <path
        className='sl-fig-dash-broken'
        d='M16,38 C56,4 96,72 136,38 C160,18 186,20 210,34'
        transform='translate(0 60)'
      />
      {/* the x sits on the screen-space curve */}
      <line className='sl-fig-mark' x1='112' x2='124' y1='88' y2='100' />
      <line className='sl-fig-mark' x1='124' x2='112' y1='88' y2='100' />
      <text className='sl-fig-label is-accent' x='150' y='12'>
        object space
      </text>
      <text className='sl-fig-label' x='150' y='72'>
        screen space
      </text>
      <text className='sl-fig-mono' x='108' y='130'>
        non-scaling-stroke
      </text>
    </svg>
  );
}

/* 03: a frame row that thins out over a timeline that lands on time */
function FigWallClock() {
  const denseTicks = Array.from({ length: 17 }, (_, i) => 16 + i * 4);
  const sparseTicks = [97, 122, 150, 181, 212];
  const gaps: Array<[number, number]> = [
    [82, 13],
    [99, 21],
    [124, 24],
    [152, 27],
    [183, 27],
  ];
  return (
    <svg aria-hidden='true' className='sl-fig' viewBox='0 0 240 140'>
      <HatchDefs id='sl-hatch-03' />
      <text className='sl-fig-label' x='16' y='38'>
        frames
      </text>
      <line className='sl-fig-stroke' x1='16' x2='212' y1='54' y2='54' />
      {denseTicks.map((x) => (
        <line className='sl-fig-stroke' key={`d-${x}`} x1={x} x2={x} y1='49' y2='59' />
      ))}
      {sparseTicks.map((x) => (
        <line className='sl-fig-stroke' key={`s-${x}`} x1={x} x2={x} y1='49' y2='59' />
      ))}
      {/* dropped frames: the gaps wear the hatch */}
      {gaps.map(([x, w]) => (
        <rect
          className='sl-fig-hatch'
          fill='url(#sl-hatch-03)'
          height='12'
          key={`g-${x}`}
          width={w}
          x={x}
          y='48'
        />
      ))}
      {/* the wall clock rail: both rows end at the same x */}
      <line className='sl-fig-stroke' x1='16' x2='212' y1='106' y2='106' />
      <line className='sl-fig-stroke' x1='16' x2='16' y1='100' y2='112' />
      <line className='sl-fig-stroke' x1='212' x2='212' y1='100' y2='112' />
      <circle className='sl-fig-accent' cx='212' cy='106' r='9' />
      <line className='sl-fig-accent' x1='212' x2='216.5' y1='106' y2='101.5' />
      <circle className='sl-fig-accent-fill' cx='212' cy='106' r='1.3' />
      <text className='sl-fig-label' x='224' y='110'>
        t
      </text>
    </svg>
  );
}

/* 04: the literal ladder; rungs shrink down the scale, h2 is accent */
function FigTypeLadder() {
  const rungs: Array<{ y: number; x1: number; x2: number; tag: string; accent: boolean }> = [
    { y: 30, x1: 56, x2: 168, tag: '--tcm-h2', accent: true },
    { y: 52, x1: 63, x2: 161, tag: '--tcm-h3', accent: false },
    { y: 74, x1: 70, x2: 154, tag: '--tcm-lead', accent: false },
    { y: 96, x1: 78, x2: 146, tag: '--tcm-body', accent: false },
    { y: 118, x1: 86, x2: 138, tag: '--tcm-box', accent: false },
  ];
  return (
    <svg aria-hidden='true' className='sl-fig' viewBox='0 0 240 140'>
      <line className='sl-fig-stroke' x1='78' x2='78' y1='14' y2='128' />
      <line className='sl-fig-stroke' x1='146' x2='146' y1='14' y2='128' />
      {rungs.map((r) => (
        <g key={r.tag}>
          <line
            className={r.accent ? 'sl-fig-accent' : 'sl-fig-stroke'}
            x1={r.x1}
            x2={r.x2}
            y1={r.y}
            y2={r.y}
          />
          <text
            className={r.accent ? 'sl-fig-mono is-accent' : 'sl-fig-mono'}
            x='176'
            y={r.y + 3}
          >
            {r.tag}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* 05: the stream flows down; the script sits above the veiled section */
function FigVeil() {
  return (
    <svg aria-hidden='true' className='sl-fig' viewBox='0 0 240 140'>
      <HatchDefs id='sl-hatch-05' />
      <line className='sl-fig-stroke' x1='34' x2='34' y1='16' y2='122' />
      <polyline className='sl-fig-stroke' points='29,116 34,122 39,116' />
      {/* the script, small and armed, first in flow order */}
      <rect className='sl-fig-accent' height='16' width='56' x='56' y='14' />
      <text className='sl-fig-mono is-accent' x='62' y='25'>
        script
      </text>
      {/* the section it guards, under the veil */}
      <rect className='sl-fig-stroke' height='54' width='148' x='56' y='40' />
      <rect className='sl-fig-hatch-box' fill='url(#sl-hatch-05)' height='62' width='160' x='50' y='36' />
      <text className='sl-fig-label' x='62' y='57'>
        section
      </text>
      <rect className='sl-fig-stroke' height='22' width='148' x='56' y='104' />
      <text className='sl-fig-label' x='62' y='118'>
        section
      </text>
    </svg>
  );
}

/* 06: one line to read at, a different line to act at */
function FigReadLines() {
  return (
    <svg aria-hidden='true' className='sl-fig' viewBox='0 0 240 140'>
      <rect className='sl-fig-stroke' height='116' width='144' x='16' y='12' />
      {/* the copy block, centered exactly on the 55 line */}
      <line className='sl-fig-copybar' x1='28' x2='116' y1='68' y2='68' />
      <line className='sl-fig-copybar' x1='28' x2='100' y1='76' y2='76' />
      <line className='sl-fig-copybar' x1='28' x2='108' y1='84' y2='84' />
      <line className='sl-fig-accent' x1='8' x2='162' y1='76' y2='76' />
      <line className='sl-fig-rule-dashed' x1='8' x2='162' y1='105' y2='105' />
      <circle className='sl-fig-dot' cx='134' cy='105' r='2.5' />
      <text className='sl-fig-label is-accent' x='168' y='79'>
        55 read
      </text>
      <text className='sl-fig-label' x='168' y='108'>
        80 spotlight
      </text>
    </svg>
  );
}

/* 07: the pair fused, then the pair with its space made visible */
function FigWhitespace() {
  return (
    <svg aria-hidden='true' className='sl-fig' viewBox='0 0 240 140'>
      <text className='sl-fig-word' x='30' y='50'>
        localizeyour
      </text>
      <line className='sl-fig-mark' x1='138' x2='148' y1='41' y2='51' />
      <line className='sl-fig-mark' x1='148' x2='138' y1='41' y2='51' />
      <text className='sl-fig-mono' x='30' y='78'>
        {'<br/>'}
      </text>
      <text className='sl-fig-word' x='30' y='106'>
        localize
      </text>
      {/* the open-box glyph: the space, carried explicitly */}
      <path className='sl-fig-accent' d='M100,99 v8 h9 v-8' />
      <text className='sl-fig-word' x='116' y='106'>
        your
      </text>
      <polyline className='sl-fig-accent' points='152,100 157,106 166,94' />
    </svg>
  );
}

/* 08: one hatched module fanning everywhere, then the split */
function FigFontModules() {
  return (
    <svg aria-hidden='true' className='sl-fig' viewBox='0 0 240 140'>
      <HatchDefs id='sl-hatch-08' />
      {/* one module ships to every page */}
      <rect className='sl-fig-hatch-box' fill='url(#sl-hatch-08)' height='26' width='34' x='14' y='56' />
      <line className='sl-fig-heavy' x1='48' x2='84' y1='69' y2='22' />
      <line className='sl-fig-heavy' x1='48' x2='84' y1='69' y2='52' />
      <line className='sl-fig-heavy' x1='48' x2='84' y1='69' y2='86' />
      <line className='sl-fig-heavy' x1='48' x2='84' y1='69' y2='116' />
      <rect className='sl-fig-stroke' height='16' width='22' x='84' y='14' />
      <rect className='sl-fig-stroke' height='16' width='22' x='84' y='44' />
      <rect className='sl-fig-stroke' height='16' width='22' x='84' y='78' />
      <rect className='sl-fig-stroke' height='16' width='22' x='84' y='108' />
      <text className='sl-fig-label' x='10' y='137'>
        one module
      </text>
      {/* split by loading scope: each module owns its own pages */}
      <line className='sl-fig-accent' x1='132' x2='226' y1='70' y2='70' />
      <text className='sl-fig-label is-accent' x='132' y='64'>
        split
      </text>
      <rect className='sl-fig-stroke' height='20' width='28' x='140' y='20' />
      <line className='sl-fig-stroke' x1='168' x2='198' y1='30' y2='17' />
      <line className='sl-fig-stroke' x1='168' x2='198' y1='30' y2='45' />
      <rect className='sl-fig-stroke' height='14' width='22' x='198' y='10' />
      <rect className='sl-fig-stroke' height='14' width='22' x='198' y='38' />
      <rect className='sl-fig-stroke' height='20' width='28' x='140' y='96' />
      <line className='sl-fig-stroke' x1='168' x2='198' y1='106' y2='95' />
      <line className='sl-fig-stroke' x1='168' x2='198' y1='106' y2='123' />
      <rect className='sl-fig-stroke' height='14' width='22' x='198' y='88' />
      <rect className='sl-fig-stroke' height='14' width='22' x='198' y='116' />
    </svg>
  );
}

type Law = { n: string; head: ReactNode; body: ReactNode; fig: ReactNode };

const LAWS: Law[] = [
  {
    n: '01',
    head: (
      <>
        <code>svh</code> is layout, <code>dvh</code> is paint.
      </>
    ),
    body: (
      <>
        The URL bar collapse re-resolves <code>dvh</code> and reflows anything built on it; only
        paint-level overhang may ride <code>dvh</code>.
      </>
    ),
    fig: <FigViewportUnits />,
  },
  {
    n: '02',
    head: (
      <>
        <code>non-scaling-stroke</code> breaks <code>pathLength</code>.
      </>
    ),
    body: 'Chromium computes dashes in screen space the moment the attribute lands; dash choreography must pick one space.',
    fig: <FigDashSpace />,
  },
  {
    n: '03',
    head: 'GSAP advances on the wall clock.',
    body: 'Under 10x CPU throttle a timeline still lands on schedule; what degrades is frames, so design the cheap path, not a slower clock.',
    fig: <FigWallClock />,
  },
  {
    n: '04',
    head: 'The mobile type scale is a ladder, not a percentage.',
    body: (
      <>
        Tokens (<code>--tcm-*</code>) with px fallbacks, defined once, consumed everywhere; boxes
        joined the ladder as <code>--tcm-box-*</code>.
      </>
    ),
    fig: <FigTypeLadder />,
  },
  {
    n: '05',
    head: 'A veil must be armed before the section streams.',
    body: 'A script stamped from the server boundary beats any effect; React never executes a script it renders.',
    fig: <FigVeil />,
  },
  {
    n: '06',
    head: 'Measure at the read line.',
    body: 'The story’s copy locks where the reader’s eyes sit (55%), the spotlight follows a different line (80%); one anchor ladder per concern.',
    fig: <FigReadLines />,
  },
  {
    n: '07',
    head: 'Whitespace is content.',
    body: 'JSX strips newline-adjacent spaces; a heading that breaks on desktop and flows on mobile carries its space explicitly.',
    fig: <FigWhitespace />,
  },
  {
    n: '08',
    head: 'Fonts preload by module, not by usage.',
    body: 'Every face declared in a module ships to every page importing ANY export from it; split modules by loading scope.',
    fig: <FigFontModules />,
  },
];

export default function SystemLedger() {
  return (
    <>
      <section className='sl-sec'>
        <h2 className='sl-h2'>What the system can do</h2>
        <p className='sl-intro'>
          Twelve engines, built once, reused across the directions. Each row names one, states the
          law it runs on, and points at a place it runs live.
        </p>
        <div className='sl-caps'>
          {CAPABILITIES.map((cap) => (
            <div className='sl-cap' key={cap.name}>
              <span className='sl-cap-top'>
                <span className='sl-cap-name'>{cap.name}</span>
                {cap.href ? (
                  <Link className='sl-cap-see' href={cap.href}>
                    {cap.see} →
                  </Link>
                ) : (
                  <span className='sl-cap-see'>{cap.see}</span>
                )}
              </span>
              <p className='sl-cap-law'>{cap.law}</p>
            </div>
          ))}
        </div>
      </section>

      <div aria-hidden='true' className='sl-hatch' />

      <section className='sl-sec'>
        <h2 className='sl-h2'>What building it taught</h2>
        <p className='sl-intro'>
          Eight rules the build settled the hard way. Each was a bug before it was a law.
        </p>
        <ol className='sl-laws'>
          {LAWS.map((law) => (
            <li className='sl-law' key={law.n}>
              <span className='sl-law-n'>{law.n}</span>
              <p className='sl-law-text'>
                <b>{law.head}</b> {law.body}
              </p>
              <div aria-hidden='true' className='sl-law-fig'>
                {law.fig}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
