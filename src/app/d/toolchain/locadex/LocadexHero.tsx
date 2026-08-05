'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import LocaleTag from '../components/LocaleTag';

gsap.registerPlugin(useGSAP);

const LOCALES = ['es', 'fr', 'ja', 'de', 'zh'] as const;

/**
 * The hero, side by side in the enterprise page's grammar (founder
 * directive): one mixed `is-lead` row — the promise, the sub and the
 * three actions in the text column on the mat ground, and the artifact
 * mounted in a framed card on the right. The artifact is the same live
 * agent terminal as before: one real run printing in fourteen lines —
 * push, scan, map, edit, translate, PR — the page's canonical run
 * (#1184) ending at PR #218 (locadex/generate-code → main, +38 −6).
 * The print is a one-shot GSAP sequence; with reduced motion the
 * finished transcript simply stands, and the still carries the argument.
 */
export default function LocadexHero() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = () => {
    void navigator.clipboard?.writeText('npx locadex@latest start');
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1600);
  };

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      /* the run prints once, top to bottom, like a real transcript */
      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>('[data-tline]', scope),
        { autoAlpha: 0, y: 5 },
        { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.13, ease: 'power1.out', delay: 0.25 }
      );

      /* the caret rests, blinking, at the gate */
      gsap.to('.ldx-caret', {
        opacity: 0,
        duration: 0.55,
        repeat: -1,
        yoyo: true,
        ease: 'steps(1)',
        delay: 2.2,
      });
    },
    { scope: root }
  );

  return (
    <section className='tc-sec ldx-hero-sec' id='top' ref={root}>
      <div className='tc-row is-lead'>
        <div className='tc-cell ldx2-hero'>
          <Image
            className='ldx2-mark'
            src='/brand/no-bg-locadex-logo-light.png'
            alt='Locadex'
            width={36}
            height={36}
            priority
          />
          <h1>
            <span>Connect a repo —</span>
            <span>
              your app is <em>translated</em>.
            </span>
          </h1>
          <p className='ldx2-sub'>
            Locadex connects to your codebase, internationalizes your code, and opens pull requests
            with translations. Auto-merge is off by default — every change waits for your review.
          </p>
          <div className='ldx2-acts'>
            <a
              className='tc-btn tc-btn-solid'
              href='/dashboard/api/integrations/github/start?returnTo=%2Fproject%2Flocadex'
            >
              Connect GitHub
            </a>
            <a className='tc-btn tc-btn-line' href='/docs/platform/locadex'>
              Read the docs
            </a>
            <button className='tc-copy' type='button' onClick={copy}>
              <span>$ npx locadex@latest start</span>
              <span>{copied ? 'copied' : 'copy'}</span>
            </button>
          </div>
        </div>

        <div className='tc-cell is-framed ldx2-cell'>
          <div className='tc-card ldx2-art'>
            <PrismaticField
              className='ldx2-field'
              preset='1'
              speed={0.5}
              params={{ exposureScale: 2500 }}
              effects={['lens', 'dither', 'chroma']}
              defaultEffect='lens'
              previewAt={[0.3, 0.5]}
            />
            <div className='tc-term'>
              <div className='tc-term-bar'>
                <span>locadex — agent</span>
                <span style={{ marginLeft: 'auto' }}>acme/web</span>
              </div>
              <div className='tc-term-body'>
                <div className='ldx-t is-full' data-tline data-tone='prompt'>
                  <span>
                    $ git push origin main <span className='ldx-t-hash'>· e4f21c9</span>
                  </span>
                </div>
                <div className='ldx-t is-full ldx-t-dim' data-tline>
                  <span>locadex · run #1184 · trigger: push</span>
                </div>
                <div className='tc-term-line' data-tone='gap' aria-hidden='true' />
                <div className='ldx-t' data-tline>
                  <span className='ldx-t-stage'>scan</span>
                  <span>apps/web · 11 files changed · 412 ms</span>
                </div>
                <div className='ldx-t' data-tline>
                  <span className='ldx-t-stage' aria-hidden='true' />
                  <span className='ldx-t-dim'>5 files need i18n · 14 strings</span>
                </div>
                <div className='ldx-t' data-tline>
                  <span className='ldx-t-stage'>map</span>
                  <span>Tagline.tsx · tone: playful, upbeat</span>
                </div>
                <div className='ldx-t' data-tline>
                  <span className='ldx-t-stage' aria-hidden='true' />
                  <span className='ldx-t-dim ldx-t-locs'>
                    glossary · 12 terms · <LocaleTag code='de' className='tc-termloc' /> formal “Sie”
                  </span>
                </div>
                <div className='ldx-t' data-tline>
                  <span className='ldx-t-stage'>edit</span>
                  <span>app/page.tsx</span>
                </div>
                <div className='ldx-t' data-tline>
                  <span className='ldx-t-stage' aria-hidden='true' />
                  <span className='ldx-t-del'>{'<h1>Hello, world!</h1>'}</span>
                </div>
                <div className='ldx-t' data-tline>
                  <span className='ldx-t-stage' aria-hidden='true' />
                  <span className='ldx-t-add'>
                    {'<'}
                    <b>T</b>
                    {'><h1>Hello, world!</h1></'}
                    <b>T</b>
                    {'>'}
                  </span>
                </div>
                <div className='ldx-t' data-tline>
                  <span className='ldx-t-stage'>translate</span>
                  <span className='ldx-t-locs'>
                    {LOCALES.map((code) => (
                      <LocaleTag code={code} className='tc-termloc' key={code} />
                    ))}
                    <span className='ldx-t-dim'>· in context</span>
                  </span>
                </div>
                <div className='ldx-t' data-tline data-tone='prompt'>
                  <span className='ldx-t-stage'>pr</span>
                  <span>#218 · locadex/generate-code → main</span>
                </div>
                <div className='ldx-t' data-tline>
                  <span className='ldx-t-stage' aria-hidden='true' />
                  <span className='ldx-t-dim'>
                    +38 −6 · auto-merge off · awaiting review
                    <i className='ldx-caret' aria-hidden='true' />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
