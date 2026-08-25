'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { ArrowRight, Check, FileCode2, GitPullRequest } from 'lucide-react';

import { localeFlag } from '@/app/d/toolchain/components/LocaleTag';

import { useQuietReveal } from '../sections/reveal';

import 'flag-icons/css/flag-icons.min.css';

/**
 * The Mintlify partner page's masthead, sworn in. Headline, subhead and
 * both actions are verbatim from MintlifyPage.tsx on the landing app; the
 * lockup is the same GT × Mintlify pair the live hero prints. Beside it,
 * MintlifyHeroDiagram.tsx redrawn on this direction's one dark artifact
 * surface: the repo on the left, the GT processor in the middle, the pull
 * request it opens on the right — same three locales, same file count,
 * same status line.
 *
 * The live primary action starts a GitHub OAuth handshake on the dashboard
 * (/dashboard/api/integrations/github/start). A design study cannot begin
 * one, so it points at the setup ledger further down the same page, which
 * is the flow that handshake enters.
 */

/** MintlifyHeroDiagram.tsx — OUTPUT_LOCALES, unchanged. */
const OUTPUT_LOCALES = ['es', 'fr', 'ja'] as const;

const GUIDE_HREF =
  'https://generaltranslation.com/docs/integrations/mintlify/quickstart';

export default function MintlifyHero() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='cpm-hero'>
        <div className='cpm-hero-copy'>
          <span className='cpp-lockup' data-reveal>
            <b>GT</b>
            <i aria-hidden='true'>&times;</i>
            <Image
              alt='Mintlify'
              height={26}
              src='/logos/mintlify-simple.svg'
              width={26}
            />
          </span>

          <h1 data-reveal>Translate your docs in one click</h1>
          <p className='cpm-hero-sub' data-reveal>
            Make your documentation accessible to developers everywhere.{' '}
            <b>General Translation</b> automates localization for <b>Mintlify</b>.
          </p>

          <div className='cpm-acts' data-reveal>
            <a className='tc-btn tc-btn-solid' href='#setup'>
              Get Started
            </a>
            <a
              className='tc-btn tc-btn-line'
              href={GUIDE_HREF}
              rel='noreferrer noopener'
              target='_blank'
            >
              Guide
            </a>
          </div>

        </div>

        <div
          aria-label='Locadex reads Mintlify documentation and opens a pull request with localized files'
          className='cpm-diagram'
          data-reveal
          role='img'
        >
          <div aria-hidden='true' className='cpm-diagram-bar'>
            <span>
              <Image
                alt=''
                height={14}
                src='/logos/mintlify-simple.svg'
                width={14}
              />
              docs
            </span>
            <code>main</code>
          </div>

          <div aria-hidden='true' className='cpm-diagram-stage'>
            <div className='cpm-tree'>
              <code>docs/</code>
              <span>
                <FileCode2 /> index.mdx
              </span>
              <span>
                <FileCode2 /> api.mdx
              </span>
              <span>
                <FileCode2 /> guides.mdx
              </span>
              <small>mint.json</small>
            </div>

            <div className='cpm-proc'>
              <div className='cpm-proc-core'>GT</div>
              <span>translate</span>
              <ArrowRight />
            </div>

            <div className='cpm-out'>
              <div className='cpm-out-head'>
                <GitPullRequest />
                <span>Localized docs</span>
              </div>
              {OUTPUT_LOCALES.map((locale) => (
                <span className='cpm-out-row' key={locale}>
                  <span className={`cpm-out-flag fi fi-${localeFlag(locale)}`} />
                  <code>{locale}/</code>
                  <Check />
                </span>
              ))}
              <small>+ 18 files</small>
            </div>
          </div>

          <div aria-hidden='true' className='cpm-diagram-status'>
            <span className='cpm-status-dot' />
            <span>formatting preserved</span>
            <code>ready to merge</code>
          </div>
        </div>
      </div>
    </section>
  );
}
