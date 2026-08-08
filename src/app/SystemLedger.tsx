import Link from 'next/link';
import type { ReactNode } from 'react';

import './system-ledger.css';

/**
 * Two landing blocks: the capabilities ledger and the laws learned.
 * Self-contained — consumes only the --pt-* tokens inherited from
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
    law: 'The headline dissolves to dust and reprints through a clip front — driven by the locale belt, one clock.',
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
    law: 'The drag seam that sweeps two page faces — at work on this page’s site cards.',
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
    law: 'The harness that shot every tile on this page — section-anchored element screenshots, both themes, both widths.',
    see: 'docs/harness/gallery-shoot.mjs',
  },
  {
    name: 'Pixel auditor',
    law: 'Walks every rendered line on every page; a single doubled rule fails the round.',
    see: 'every round',
  },
];

type Law = { n: string; head: ReactNode; rest: ReactNode };

const LAWS: Law[] = [
  {
    n: '01',
    head: (
      <>
        <code>svh</code> is layout, <code>dvh</code> is paint
      </>
    ),
    rest: (
      <>
        the URL bar collapse re-resolves <code>dvh</code> and reflows anything built on it; only
        paint-level overhang may ride <code>dvh</code>.
      </>
    ),
  },
  {
    n: '02',
    head: (
      <>
        <code>non-scaling-stroke</code> breaks <code>pathLength</code>
      </>
    ),
    rest: 'Chromium computes dashes in screen space the moment the attribute lands; dash choreography must pick one space.',
  },
  {
    n: '03',
    head: 'GSAP advances on the wall clock',
    rest: 'under 10x CPU throttle a timeline still lands on schedule; what degrades is frames, so design the cheap path, not a slower clock.',
  },
  {
    n: '04',
    head: 'The mobile type scale is a ladder, not a percentage',
    rest: (
      <>
        tokens (<code>--tcm-*</code>) with px fallbacks, defined once, consumed everywhere; boxes
        joined the ladder as <code>--tcm-box-*</code>.
      </>
    ),
  },
  {
    n: '05',
    head: 'A veil must be armed before the section streams',
    rest: 'a script stamped from the server boundary beats any effect; React never executes a script it renders.',
  },
  {
    n: '06',
    head: 'Measure at the read line',
    rest: 'the story’s copy locks where the reader’s eyes sit (55%), the spotlight follows a different line (80%); one anchor ladder per concern.',
  },
  {
    n: '07',
    head: 'Whitespace is content',
    rest: 'JSX strips newline-adjacent spaces; a heading that breaks on desktop and flows on mobile carries its space explicitly.',
  },
  {
    n: '08',
    head: 'Fonts preload by module, not by usage',
    rest: 'every face declared in a module ships to every page importing ANY export from it; split modules by loading scope.',
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
          Eight rules the build settled the hard way — each was a bug before it was a law.
        </p>
        <ol className='sl-laws'>
          {LAWS.map((law) => (
            <li className='sl-law' key={law.n}>
              <span className='sl-law-n'>{law.n}</span>
              <p>
                <b>{law.head}</b>
                {' — '}
                {law.rest}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
