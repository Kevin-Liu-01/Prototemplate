'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Retires the floating nav pill once the closing plate is in frame.
 *
 * The closing section *is* the call to action, so leaving the pill floating
 * over it stacks two identical “Get a Demo” buttons — on a phone they land on
 * top of each other and the headline is pushed out of the frame entirely.
 * The story fades the inner `.bf-nav`; this fades the outer `.bf-nav-dock`, so
 * the two never write the same property on the same element.
 */
export default function NavGuard() {
  useGSAP(() => {
    const nav = document.querySelector<HTMLElement>('.bento-foundry-root .bf-nav-dock');
    const closing = document.querySelector<HTMLElement>('#bf-close');
    if (!nav || !closing) return;

    const trigger = ScrollTrigger.create({
      trigger: closing,
      start: 'top 78%',
      onEnter: () =>
        gsap.to(nav, { autoAlpha: 0, y: -26, duration: 0.4, ease: 'power2.in', overwrite: 'auto' }),
      onLeaveBack: () =>
        gsap.to(nav, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' }),
    });

    return () => trigger.kill();
  });

  return null;
}
