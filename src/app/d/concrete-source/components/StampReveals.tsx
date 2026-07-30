'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import { STEP, thud } from './motion';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin);

/**
 * THE STAMP — the tail sections' scroll reveals. Renders nothing; it owns the
 * document-wide pass the original script ran once after boot, so the hero's
 * own intro stamp (which fires on load, not on scroll) stays in Hero.
 */
export default function StampReveals() {
  const anchor = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    // metrics shift once the display face lands, and every pin depends on them
    document.fonts.ready.then(() => ScrollTrigger.refresh());

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const root = anchor.current?.closest('.concrete-source-root');
    if (!root) return;

    root.querySelectorAll<HTMLElement>('section [data-stamp], footer [data-stamp]').forEach((el) => {
      gsap.set(el, { visibility: 'visible' });
      gsap.from(el, {
        scale: 1.35,
        autoAlpha: 0,
        duration: 0.2,
        ease: STEP(2),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onStart: () => thud(el),
      });
    });

    // scramble the section kickers once — fast, so no sampled frame catches noise
    root.querySelectorAll<HTMLElement>('.sec-idx').forEach((el) => {
      const txt = el.textContent ?? '';
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () =>
          gsap.to(el, {
            duration: 0.45,
            scrambleText: { text: txt, chars: '01<>_/\\', speed: 0.9 },
            ease: 'none',
          }),
      });
    });
  });

  return <span ref={anchor} hidden aria-hidden='true' />;
}
