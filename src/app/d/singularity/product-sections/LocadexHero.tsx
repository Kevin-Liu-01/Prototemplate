'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useState } from 'react';

import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

/* the .lct chip base and the terminal locale-pill convention, singularity-scoped */
import '../components/icons.css';

gsap.registerPlugin(useGSAP);

const LOCALES = ['es', 'fr', 'ja', 'de', 'zh'] as const;

/**
 * The Locadex hero in the finals' machined grammar: the promise on the left,
 * and on the right the run record itself — run #1184 printing as a fourteen-
 * line transcript on the page's one dark artifact surface. Push, scan, map,
 * edit, translate, PR: the canonical run the whole page narrates, ending at
 * PR #218 (locadex/generate-code → main, +38 −6). The print is a one-shot
 * GSAP sequence; with reduced motion the finished transcript simply stands.
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

      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>('[data-tline]', scope),
        { autoAlpha: 0, y: 5 },
        { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.12, ease: 'power1.out', delay: 0.25 }
      );

      gsap.to('.sgx-caret', {
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
    <section className='tc-sec' id='top' ref={root}>
      <div className='sgx-hero'>
        <div>
          <Image
            className='sgx-hero-mark'
            src='/brand/no-bg-locadex-logo-light.png'
            alt='Locadex'
            width={34}
            height={34}
            priority
          />
          <h1>
            <span>Connect a repo —</span>
            <span>
              your app is <em className='sgx-em'>translated</em>.
            </span>
          </h1>
          <p className='sgx-hero-sub'>
            Locadex connects to your codebase, internationalizes your code, and opens pull requests
            with translations. Auto-merge is off by default — every change waits for your review.
          </p>
          <div className='sgx-acts'>
            <a className='tc-btn tc-btn-solid' href='#connect'>
              Connect GitHub
            </a>
            <a className='tc-btn tc-btn-line' href='#run'>
              See one run
            </a>
            <button className='tc-copy' type='button' onClick={copy}>
              <span>$ npx locadex@latest start</span>
              <span>{copied ? 'copied' : 'copy'}</span>
            </button>
          </div>
        </div>

        <div className='sgx-panel'>
          <div className='sgx-panel-bar'>
            <span>locadex — agent · run #1184</span>
            <span>acme/web</span>
          </div>
          <div className='sgx-term-body'>
            <div className='sgx-t is-full' data-tline data-tone='prompt'>
              <span>
                $ git push origin main <span className='sgx-t-hash'>· e4f21c9</span>
              </span>
            </div>
            <div className='sgx-t is-full sgx-t-dim' data-tline>
              <span>locadex · run #1184 · trigger: push</span>
            </div>
            <div className='sgx-t-gap' aria-hidden='true' />
            <div className='sgx-t' data-tline>
              <span className='sgx-t-stage'>scan</span>
              <span>apps/web · 11 files changed · 412 ms</span>
            </div>
            <div className='sgx-t' data-tline>
              <span className='sgx-t-stage' aria-hidden='true' />
              <span className='sgx-t-dim'>5 files need i18n · 14 strings</span>
            </div>
            <div className='sgx-t' data-tline>
              <span className='sgx-t-stage'>map</span>
              <span>Tagline.tsx · tone: playful, upbeat</span>
            </div>
            <div className='sgx-t' data-tline>
              <span className='sgx-t-stage' aria-hidden='true' />
              <span className='sgx-t-dim'>
                glossary · 12 terms · <LocaleTag code='de' className='tc-termloc' /> formal “Sie”
              </span>
            </div>
            <div className='sgx-t' data-tline>
              <span className='sgx-t-stage'>edit</span>
              <span>app/page.tsx</span>
            </div>
            <div className='sgx-t' data-tline>
              <span className='sgx-t-stage' aria-hidden='true' />
              <span className='sgx-t-del'>{'<h1>Hello, world!</h1>'}</span>
            </div>
            <div className='sgx-t' data-tline>
              <span className='sgx-t-stage' aria-hidden='true' />
              <span className='sgx-t-add'>
                {'<'}
                <b>T</b>
                {'><h1>Hello, world!</h1></'}
                <b>T</b>
                {'>'}
              </span>
            </div>
            <div className='sgx-t' data-tline>
              <span className='sgx-t-stage'>translate</span>
              <span>
                {LOCALES.map((code) => (
                  <span key={code}>
                    <LocaleTag code={code} className='tc-termloc' />{' '}
                  </span>
                ))}
                <span className='sgx-t-dim'>· in context</span>
              </span>
            </div>
            <div className='sgx-t' data-tline data-tone='prompt'>
              <span className='sgx-t-stage'>pr</span>
              <span>#218 · locadex/generate-code → main</span>
            </div>
            <div className='sgx-t' data-tline>
              <span className='sgx-t-stage' aria-hidden='true' />
              <span className='sgx-t-dim'>
                +38 −6 · auto-merge off · awaiting review
                <i className='sgx-caret' aria-hidden='true' />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
