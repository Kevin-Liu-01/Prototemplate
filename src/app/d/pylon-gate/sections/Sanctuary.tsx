'use client';

import Image from 'next/image';
import { useRef } from 'react';

import DoubledLine from '@/components/shared/diagrams/DoubledLine';

import Chip from './Chip';
import CourtHead from './CourtHead';
import DitherPlate from './deco/DitherPlate';
import { FRAMEWORKS, HREF } from './data';
import { useCourtReveal } from './reveal';
import { steppedFloor } from '../fields';

/**
 * The sanctuary: the page's one dark court, lapis in both themes. Four
 * cells of the naos hold the product surfaces as objects: the libraries,
 * the CLI run, the dashboard's context cascade on a doubled thread, and the
 * Locadex agent with its real mark. The floor is a stepped mastaba drawn in
 * alabaster dither.
 */
const CLI_LOCALES: readonly string[] = ['es', 'fr', 'ja', 'de', 'zh'];

export default function Sanctuary() {
  const root = useRef<HTMLElement>(null);
  useCourtReveal(root);

  return (
    <section className='pg-band' id='platform' ref={root}>
      <div className='pg-band-in'>
        <CourtHead
          n={4}
          title='The platform'
          sub='Everything localization needs. The libraries, the CLI, the dashboard, and the Locadex agent work from one project and one set of translations.'
        />

        <div className='pg-naos'>
          <div className='pg-naos-cell' data-reveal>
            <h3>Libraries</h3>
            <p>
              Six first-party SDKs for Next.js, React, React Native, TanStack Start, Node.js, and Python.
              Each one wraps the same component model.
            </p>
            <div className='pg-sdk'>
              {FRAMEWORKS.map((framework) => (
                <span key={framework.pkg}>
                  <b>{framework.pkg}</b>
                  <i>{framework.file}</i>
                </span>
              ))}
            </div>
          </div>

          <div className='pg-naos-cell' data-reveal>
            <h3>CLI</h3>
            <p>The CLI extracts every string, translates what changed, and writes each locale into the build.</p>
            <div className='pg-term'>
              <div className='pg-term-bar'>
                <span>gt cli · terminal</span>
                <span>zsh</span>
              </div>
              <div className='pg-term-body'>
                <div className='pg-term-line'>
                  <span className='pg-pr'>$</span>
                  <span>npx gt translate</span>
                </div>
                <div className='pg-term-line'>128 strings · 3 new · 2 changed</div>
                <div className='pg-term-line'>
                  {CLI_LOCALES.map((code) => (
                    <Chip code={code} key={code} />
                  ))}
                </div>
                <div className='pg-term-line'>640 translations · served from the edge</div>
              </div>
            </div>
          </div>

          <div className='pg-naos-cell' data-reveal>
            <h3>Dashboard</h3>
            <p>
              Glossaries, tone, and audience are set once on the organization and inherited by every
              project and component.
            </p>
            <div className='pg-cascade'>
              <svg className='pg-thread-v' viewBox='0 0 24 100' preserveAspectRatio='none' aria-hidden='true'>
                <DoubledLine d='M12 0V100' core='currentColor' ink='currentColor' />
                <DoubledLine d='M12 16.7H24' core='currentColor' ink='currentColor' />
                <DoubledLine d='M12 50H24' core='currentColor' ink='currentColor' />
                <DoubledLine d='M12 83.3H24' core='currentColor' ink='currentColor' />
              </svg>
              <div className='pg-plates'>
                <span>Organization</span>
                <span>Project</span>
                <span>Component</span>
              </div>
            </div>
          </div>

          <div className='pg-naos-cell' data-reveal>
            <h3 className='pg-locadex-h'>
              <Image
                alt=''
                aria-hidden
                className='pg-locadex-mark'
                height={22}
                src='/brand/no-bg-locadex-logo-light.png'
                width={22}
              />
              Locadex
            </h3>
            <p>Locadex reads the file that changed, wraps the tree in {'<T>'}, and opens the pull request.</p>
            <ul className='pg-trace'>
              <li>
                <b>scan</b> app/page.tsx
              </li>
              <li>
                <b>edit</b> + {'<T>'} · + {'<DateTime>'}
              </li>
              <li>
                <b>open pr</b> PR #218 · 6 locales
              </li>
            </ul>
          </div>
        </div>

        <div className='pg-band-acts'>
          <a className='pg-btn pg-btn-solid' href={HREF.signIn}>
            Get Started
          </a>
          <a className='pg-btn pg-btn-line' href={HREF.demo}>
            Talk to an Engineer
          </a>
        </div>

        <div className='pg-floor'>
          <DitherPlate className='pg-floor-plate' field={steppedFloor()} scale={4} fps={16} reducedMotionTime={3} />
        </div>
      </div>
    </section>
  );
}
