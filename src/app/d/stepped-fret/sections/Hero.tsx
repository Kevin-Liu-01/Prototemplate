'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';

import { GtMark } from '@/components/viewer/GtMark';

import { CLAIMS, DOCS_HREF, HERO_SUB, INSTALL_COMMAND, SIGN_IN_HREF } from '../data';
import { reducedMotion } from '../reveal';
import BarDot from './deco/BarDot';
import HeroFret from './HeroFret';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Seconds a claim stands before the next one replaces it. */
const HOLD = 3.4;

/**
 * The hero is one monumental fret. The stair climbs from the bottom left,
 * the bar runs the width of the rail, and the spiral coils at the right;
 * the claim is set in the open step the fret leaves between the stair and
 * the coil. The claim is one shaped text node that cycles through sixteen
 * locales with its `lang` and `dir` retagged on every swap (a fade of a
 * quarter second out and a third of a second in, on one paused timeline
 * that a ScrollTrigger plays while the hero is on screen). Under reduced
 * motion the English claim stands. Above the claim, the crown: 118 in
 * bar-and-dot geometry beside the same figure in the display face.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const claim = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useGSAP(
    () => {
      const el = claim.current;
      const hero = root.current;
      if (!el || !hero || reducedMotion()) return;

      let index = 0;
      const apply = (i: number) => {
        const next = CLAIMS[i] ?? CLAIMS[0]!;
        el.textContent = next.text;
        el.setAttribute('lang', next.lang);
        el.setAttribute('dir', next.rtl ? 'rtl' : 'ltr');
      };

      // the first hold lives inside the timeline, so it survives a late play()
      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: HOLD });
      tl.to({}, { duration: HOLD })
        .to(el, { autoAlpha: 0, y: -6, duration: 0.25, ease: 'power1.in' })
        .call(() => {
          index = (index + 1) % CLAIMS.length;
          apply(index);
        })
        .set(el, { y: 8 })
        .to(el, { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power2.out' });

      ScrollTrigger.create({
        trigger: hero,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) tl.play();
          else tl.pause();
        },
      });
    },
    { scope: root }
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // the clipboard is unavailable: the command stays selectable as text
    }
  };

  const first = CLAIMS[0]!;

  return (
    <section className='sf-hero' id='top' ref={root}>
      <div className='sf-hero-grid'>
        <div className='sf-hero-plate'>
          <HeroFret />
        </div>

        <div className='sf-hero-copy'>
          <div className='sf-crown' role='group' aria-label='118 locales ready today'>
            <BarDot value={118} unit={8} className='sf-crown-bardot' />
            <span className='sf-crown-figure' aria-hidden='true'>
              118
            </span>
            <span className='sf-crown-cap'>locales ready today</span>
          </div>

          <h1 className='sf-h1'>
            <span ref={claim} lang={first.lang} dir='ltr'>
              {first.text}
            </span>
          </h1>

          <p className='sf-hero-sub'>
            <span className='sf-wordmark'>
              <GtMark width={22} height={14} />
              <span>General Translation</span>
            </span>{' '}
            {HERO_SUB}
          </p>

          <div className='sf-hero-acts'>
            <a className='sf-btn sf-btn-solid' href={SIGN_IN_HREF}>
              Get Started
            </a>
            <a className='sf-btn sf-btn-line' href={DOCS_HREF}>
              Docs
            </a>
            <span className='sf-cmd'>
              <code>{INSTALL_COMMAND}</code>
              <button
                type='button'
                className='sf-cmd-copy'
                onClick={copy}
                aria-label={copied ? 'Copied' : 'Copy the install command'}
              >
                {copied ? <Check size={13} strokeWidth={1.75} aria-hidden /> : <Copy size={13} strokeWidth={1.75} aria-hidden />}
              </button>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
