'use client';

/* The stage the press directions play on. The layout mounts it once for
   the whole /press/directions segment, so moving from one direction to the
   next keeps the page running, and it shows the direction the address
   names: /press/directions opens on the first. The directions draw
   themselves into the host with the DOM; React only owns the host. */

import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { useRef } from 'react';

import { useLayoutWork, useMountEffect } from '../../_press/hooks';
import { createCore, type Core } from './core';
import type { Issue } from './data';
import { PRESS_DIRECTIONS, directionHref } from './registry';
import { atlas } from './studies/atlas';
import { light } from './studies/light';
import { measure } from './studies/measure';
import { proof } from './studies/proof';
import { riffle } from './studies/riffle';
import { route } from './studies/route';
import { signal } from './studies/signal';

const STUDIES = [riffle, atlas, signal, proof, light, route, measure];

export default function Stage({ issue }: { issue: Issue }) {
  const host = useRef<HTMLDivElement>(null);
  const core = useRef<Core | null>(null);
  const router = useRouter();
  const slug = useSelectedLayoutSegment() ?? PRESS_DIRECTIONS[0]!.slug;

  useMountEffect(() => {
    const el = host.current;
    if (!el) return;
    const c = createCore(el, { issue, navigate: (to) => router.push(directionHref(to), { scroll: false }) });
    for (const study of STUDIES) study(c);
    c.start(slug);
    core.current = c;
    return () => {
      c.dispose();
      core.current = null;
    };
  });

  // the back and forward buttons, and links from elsewhere
  useLayoutWork(
    () => {
      core.current?.show(slug);
    },
    { dependencies: [slug] }
  );

  return <div ref={host} className='pdx' />;
}
