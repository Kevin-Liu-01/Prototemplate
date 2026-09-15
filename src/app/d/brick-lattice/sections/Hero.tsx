'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { GtMark } from '@/components/viewer/GtMark';

import BrickField from '../diagrams/BrickField';
import Rosette from '../diagrams/Rosette';
import { LINKS, SOURCE_WORD, WORDS } from '../data';
import CopyCommand from './CopyCommand';
import TrustCourse from './TrustCourse';

gsap.registerPlugin(useGSAP);

/**
 * brick-lattice · the hero.
 *
 * Home: the first section. The whole viewport is lattice, and the lattice
 * resolves into a rosette field: one twelve-petal rosette whose core sits
 * behind the claim panel and four eight-petal satellites at the corners.
 * The panel is a glazed plate with stepped parapet corners, cut out of the
 * wall. Its crown is the monogram between two gold-cored rosettes on a
 * register line (charter C1.4). The headline is one shaped text node that
 * swaps whole between the sixteen locales of the shipped roster, carrying
 * lang and dir with it (DESIGN.md section 8: never per-character spans).
 *
 * The swap never hides the claim (charter I). The text changes in one
 * call and settles from ten pixels below; the only thing that wipes is the
 * gold glaze course under it, an ornament, by clip-path. At rest the course
 * is whole and the English claim stands; under reduced motion nothing runs.
 */
const HOLD = 2.4;
const OUT = 0.28;
const IN = 0.46;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const claim = useRef<HTMLHeadingElement>(null);
  const course = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const h1 = claim.current;
      const bar = course.current;
      if (!h1 || !bar) return;

      const tl = gsap.timeline({ paused: true, repeat: -1, delay: 1.8 });
      for (let i = 0; i < WORDS.length; i++) {
        const next = WORDS[(i + 1) % WORDS.length]!;
        /* the glaze course wipes off toward the right */
        tl.to(bar, { clipPath: 'inset(0px 0% 0px 100%)', duration: OUT, ease: 'power1.in' }, `+=${HOLD}`);
        /* the claim swaps whole, with its tag, and settles from one course below */
        tl.call(() => {
          h1.textContent = next.text;
          h1.setAttribute('lang', next.lang);
          h1.setAttribute('dir', next.dir);
          h1.dataset.locale = next.code;
        });
        tl.set(h1, { y: 10 });
        tl.set(bar, { clipPath: 'inset(0px 100% 0px 0%)' });
        tl.to(h1, { y: 0, duration: IN, ease: 'power2.out' });
        tl.to(bar, { clipPath: 'inset(0px 0% 0px 0%)', duration: IN, ease: 'power1.out' }, '<');
      }

      const io = new IntersectionObserver((entries) => {
        const on = entries.some((e) => e.isIntersecting);
        if (on && !document.hidden) tl.play();
        else tl.pause();
      });
      io.observe(h1);
      const onVisibility = () => {
        if (document.hidden) tl.pause();
      };
      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        io.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
      };
    },
    { scope: root }
  );

  return (
    <section className='bl-sec bl-hero' id='top' ref={root}>
      <BrickField field='rosette' animate anchor='.bl-claim' fps={12} />
      <div className='bl-in bl-hero-in'>
        <div className='bl-claim bl-panel'>
          <div className='bl-crown' aria-hidden='true'>
            <Rosette size={22} brick={24} petals={8} core='gold' className='is-crown' />
            <i className='bl-crown-bar' />
            <GtMark width={28} height={18} />
            <i className='bl-crown-bar' />
            <Rosette size={22} brick={24} petals={8} core='gold' className='is-crown' />
          </div>
          <h1 className='bl-h1' ref={claim} lang={SOURCE_WORD.lang} dir={SOURCE_WORD.dir} data-locale={SOURCE_WORD.code}>
            {SOURCE_WORD.text}
          </h1>
          <span className='bl-h1-course' ref={course} aria-hidden='true' />
          <p className='bl-sub'>
            <span className='bl-wordmark'>
              <GtMark width={22} height={14} />
              <span>General Translation</span>
            </span>{' '}
            builds full-stack infrastructure for localizing apps, docs, and websites.
          </p>
          <div className='bl-acts'>
            <a className='bl-btn bl-btn-solid' href={LINKS.getStarted}>
              Get Started
            </a>
            <a className='bl-btn bl-btn-line' href={LINKS.docs}>
              Docs
            </a>
            <CopyCommand command='npx gt@latest' className='bl-hero-cmd' />
          </div>
        </div>
        <TrustCourse />
      </div>
    </section>
  );
}
