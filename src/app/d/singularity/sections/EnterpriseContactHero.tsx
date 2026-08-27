'use client';

import { usePathname } from 'next/navigation';
import { useRef } from 'react';

import { useQuietReveal } from './reveal';

/**
 * The masthead the two enterprise contact desks share: the route's own
 * filed line back up the tree, the kicker, the page title the live site
 * publishes in its metadata, and the dek under it. Everything below the
 * fold is the desk; this is only the label on the folder.
 *
 * The back link resolves against the CURRENT final's base, so the section
 * mounts unchanged on every concept that carries these routes.
 */

type BackLink = {
  label: string;
  /** Appended to the concept base — never a hardcoded /d/<final> path. */
  path: string;
};

type Props = {
  kicker: string;
  title: string;
  dek: string;
  back: BackLink;
};

export default function EnterpriseContactHero({
  kicker,
  title,
  dek,
  back,
}: Props) {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/singularity';

  return (
    <section className='tc-sec' ref={root}>
      <div className='sgec-mast'>
        <a className='sgec-back' data-reveal href={`${base}${back.path}`}>
          <span aria-hidden>&larr;</span> {back.label}
        </a>
        <span className='sgec-kicker' data-reveal>
          {kicker}
        </span>
        <h1 data-reveal>{title}</h1>
        <p data-reveal>{dek}</p>
      </div>
    </section>
  );
}
