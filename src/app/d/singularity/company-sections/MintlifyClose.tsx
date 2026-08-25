'use client';

import { usePathname } from 'next/navigation';
import { useRef } from 'react';

import { SiGithub } from '@icons-pack/react-simple-icons';

import GlyphRain from '../sections/GlyphRain';
import { useQuietReveal } from '../sections/reveal';

/**
 * The live page's close, landed on this direction's one ink band: the same
 * heading, the same sentence, the same two actions. "Get a Demo" keeps its
 * destination — the enterprise contact bay — resolved against whichever
 * concept is mounting this section. "Connect GitHub" cannot start the real
 * OAuth handshake from a design study, so it points at the setup ledger the
 * handshake opens, and the band prints the real integration path in mono
 * underneath rather than pretending to be it.
 */
export default function MintlifyClose() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/singularity';

  return (
    <section className='tc-band cp-band cpm-close' id='connect' ref={root}>
      <GlyphRain className='cpk-rain' />
      <div className='cp-band-in cpm-close-in'>
        <div className='cpm-close-copy'>
          <h2 data-reveal>Translate with a click</h2>
          <p data-reveal>
            Get started immediately or have a dedicated engineer set up translation for you
          </p>

          <div className='cpm-acts' data-reveal>
            <a className='tc-btn tc-btn-solid' href='#setup'>
              <SiGithub aria-hidden color='currentColor' size={15} />
              Connect GitHub
            </a>
            <a className='tc-btn tc-btn-line' href={`${base}/enterprise/contact`}>
              Get a Demo
            </a>
          </div>
        </div>

        <div className='cpm-close-path' data-reveal>
          <span className='cpm-close-path-rule'>The real door</span>
          <code>dashboard/api/integrations/github/start</code>
          <p>
            The live page hands this button straight to the GitHub App handshake. Nothing
            connects from here &mdash; the flow itself lives at{' '}
            <a
              href='https://generaltranslation.com/mintlify'
              rel='noreferrer noopener'
              target='_blank'
            >
              generaltranslation.com/mintlify
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
