'use client';

import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The elevator rail: a functional section index, not a deco component (it
 * lives in sections/, not sections/deco/, and draws no ornament color). It
 * is fixed beside the column on wide viewports only (styles.css shows it
 * from 1400px, where it clears the outer rail pair) and drawn in GT's own
 * grammar: the doubled cable is the thread pair in the page hairline, each
 * stop is an ink-ruled square on paper, and the accent is spent once, on the
 * lit stop, as a controlled edge (C2). Each stop is a plain anchor to the
 * section it names, so the index works with no JS and native scroll; an
 * IntersectionObserver with a thin band at 40% of the viewport lights the
 * stop for the floor in view. Names are the sections' own. No floor
 * numerals, because the copy law allows no number that is not a product
 * fact. No motion is created here; the hover and lit states are CSS color
 * transitions, so there is nothing to gate behind reduced motion.
 */

const STOPS = [
  { id: 'top', name: 'Hero' },
  { id: 'frameworks', name: 'Frameworks' },
  { id: 'platform', name: 'Platform' },
  { id: 'locales', name: 'Locales' },
  { id: 'story', name: 'Story' },
  { id: 'review', name: 'Review' },
  { id: 'toolchain', name: 'Toolchain' },
  { id: 'pricing', name: 'Pricing' },
] as const;

type StopId = (typeof STOPS)[number]['id'];

export default function ElevatorRail() {
  const [active, setActive] = useState<StopId>('top');

  useMountEffect(() => {
    const targets = STOPS.map((stop) => document.getElementById(stop.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (targets.length === 0) return;

    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        /* Two floors can share the band at a seam; the one further down the
           page is the one the reader is entering. */
        let next: StopId | undefined;
        for (const stop of STOPS) {
          if (inBand.has(stop.id)) next = stop.id;
        }
        if (next) setActive(next);
      },
      { rootMargin: '-40% 0px -59% 0px', threshold: 0 }
    );
    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  });

  return (
    <nav className='ss-lift' aria-label='Sections'>
      <span className='ss-lift-cable' aria-hidden='true' />
      <ol>
        {STOPS.map((stop) => (
          <li key={stop.id}>
            <a
              className='ss-lift-stop'
              href={`#${stop.id}`}
              aria-label={stop.name}
              aria-current={active === stop.id ? 'true' : undefined}
            >
              <span className='ss-lift-name' aria-hidden='true'>
                {stop.name}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
