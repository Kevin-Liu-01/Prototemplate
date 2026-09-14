'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { CLAIMS } from './content';

gsap.registerPlugin(useGSAP);

/**
 * The hero claim: one shaped text node in raised letters. The dithered
 * shadow the letters cast to the right is the element's own ::before,
 * printing the same text from data-text through a Bayer mask, so there is
 * exactly one text node and one lang/dir pair. The claim cycles through the
 * sixteen shipped locales as a chisel pass: the old line is cut away from
 * the left, the new line is revealed from the left. The timeline is created
 * paused, played only while on screen and the tab is visible, and never
 * built under reduced motion, where the English claim stands.
 * Home: the hero panel.
 */
export default function ReliefClaim() {
  const scope = useRef<HTMLSpanElement>(null);
  const first = CLAIMS[0]!;

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const face = scope.current;
      if (!face) return;

      let index = 0;
      const apply = (i: number) => {
        const claim = CLAIMS[i]!;
        face.textContent = claim.text;
        face.dataset.text = claim.text;
        face.setAttribute('lang', claim.lang);
        face.setAttribute('dir', claim.dir ?? 'ltr');
      };

      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 3.4 });
      tl.to(face, { '--rr-cut-l': 1, duration: 0.42, ease: 'power2.in' })
        .call(() => {
          index = (index + 1) % CLAIMS.length;
          apply(index);
        })
        .set(face, { '--rr-cut-l': 0, '--rr-cut-r': 1 })
        .to(face, { '--rr-cut-r': 0, duration: 0.52, ease: 'power2.out' });

      let visible = false;
      const sync = () => {
        if (visible && !document.hidden) tl.play();
        else tl.pause();
      };
      const io = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        sync();
      });
      io.observe(face);
      document.addEventListener('visibilitychange', sync);
      return () => {
        io.disconnect();
        document.removeEventListener('visibilitychange', sync);
      };
    },
    { scope }
  );

  return (
    <span className='rr-claim-face' ref={scope} data-text={first.text} lang={first.lang} dir='ltr'>
      {first.text}
    </span>
  );
}
