'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useRef } from 'react';

import Icon, { type IconName } from '../icons';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const REASONS: {
  n: string;
  icon: IconName;
  title: string;
  body: string;
  aura?: boolean;
}[] = [
  {
    n: '01',
    icon: 'rocket',
    title: 'Improve it for launch.',
    body: 'Launch is the most attention we will ever get at once. The site has to be ready to receive it.',
  },
  {
    n: '02',
    icon: 'palette',
    title: 'A brand beyond shadcn.',
    body: 'Today we look like the default theme. We need an identity that is unmistakably ours.',
  },
  {
    n: '03',
    icon: 'sparkles',
    title: 'Aura.',
    body: 'People should feel the quality before they read a single word.',
    aura: true,
  },
];

/** Pinned scrub — a giant “Why?” gives way to the three reasons. */
export default function WhySlide() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const big = SplitText.create('.pr-why-big', {
        type: 'chars',
        mask: 'chars',
      });
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.45,
          pin: pin.current,
        },
      });

      tl.from(big.chars, { yPercent: 120, stagger: 0.06, duration: 1 })
        .to(
          '.pr-why-big',
          { autoAlpha: 0, yPercent: -46, scale: 0.7, duration: 1, ease: 'power2.inOut' },
          '+=0.5'
        );

      gsap.utils.toArray<HTMLElement>('.pr-why-item').forEach((item, i) => {
        const at = 2.15 + i * 0.85;
        tl.from(item, { y: 96, autoAlpha: 0, duration: 0.7 }, at);
        const body = item.querySelector('.pr-why-item-body');
        if (body) tl.from(body, { autoAlpha: 0, y: 22, duration: 0.5 }, at + 0.28);
      });

      // The “Aura.” line gets a spectral sweep once it has landed.
      tl.fromTo(
        '.pr-aura',
        { backgroundPosition: '0% 50%' },
        { backgroundPosition: '100% 50%', duration: 1.4, ease: 'none' },
        '>-0.1'
      ).to({}, { duration: 0.6 });

      return () => big.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className='pr-slide pr-why' data-slide='why'>
      <div ref={pin} className='pr-pin'>
        <h2 className='pr-why-big' aria-hidden>
          Why?
        </h2>
        <div className='pr-phase pr-why-list'>
          <ol>
            {REASONS.map((reason) => (
              <li key={reason.n} className='pr-why-item'>
                <span className='pr-why-icon'>
                  <Icon name={reason.icon} />
                </span>
                <div>
                  <h3 className={reason.aura ? 'pr-aura' : undefined}>
                    {reason.title}
                  </h3>
                  <p className='pr-why-item-body'>{reason.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
