'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

import KineticText from './KineticText';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type SectionHeadProps = {
  title: string;
  body?: string;
  center?: boolean;
};

/** A kinetic display heading and, at most, one supporting line beneath it. */
export default function SectionHead({ title, body, center }: SectionHeadProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      const lede = host.querySelector('[data-head-body]');
      if (lede) {
        gsap.fromTo(
          lede,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: lede, start: 'top 92%', once: true },
          }
        );
      }
    },
    { scope: root }
  );

  return (
    <div className={`kv-head${center ? ' kv-head-center' : ''}`} ref={root}>
      <h2 className='kv-display'>
        <KineticText text={title} intro='scroll' baseWeight={700} flex={0.8} />
      </h2>
      {body ? (
        <p className='kv-lede' data-head-body>
          {body}
        </p>
      ) : null}
    </div>
  );
}
