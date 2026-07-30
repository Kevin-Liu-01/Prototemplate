'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type ReactNode } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Fades a block up the first time it is scrolled into view. */
export default function Reveal({
  children,
  className,
  stagger,
}: {
  children: ReactNode;
  className?: string;
  /** Selector for children that should cascade instead of moving as one block. */
  stagger?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      const targets = stagger ? gsap.utils.toArray<HTMLElement>(stagger, host) : [host];
      if (!targets.length) return;
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: stagger ? 0.07 : 0,
          scrollTrigger: { trigger: host, start: 'top 90%', once: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <div className={className} ref={root}>
      {children}
    </div>
  );
}
