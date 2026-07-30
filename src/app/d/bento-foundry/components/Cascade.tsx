'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type ReactNode } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The direction's signature entrance: cells rise in reading order while a
 * single sheen sweeps each one, once. Wrapping the static sections in this keeps
 * them server components.
 */
export default function Cascade({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cells = gsap.utils.toArray<HTMLElement>('.bf-cell', host);

      if (reduced) {
        gsap.set('[data-reveal]', { autoAlpha: 1 });
        gsap.set(cells, { autoAlpha: 1 });
        return;
      }

      gsap.utils.toArray<HTMLElement>('[data-reveal]', host).forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          }
        );
      });

      if (cells.length) {
        gsap.set(cells, { autoAlpha: 0, y: 42, scale: 0.97 });
        ScrollTrigger.create({
          trigger: host,
          start: 'top 92%',
          once: true,
          onEnter: () => {
            cells.forEach((cell, i) => {
              gsap.to(cell, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.55,
                ease: 'power3.out',
                delay: i * 0.045,
              });
              const sheen = cell.querySelector('.bf-sheen');
              if (sheen) {
                gsap.fromTo(
                  sheen,
                  { xPercent: -130 },
                  { xPercent: 130, duration: 0.85, ease: 'power2.inOut', delay: 0.1 + i * 0.045 }
                );
              }
            });
          },
        });
      }

      if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      cells.forEach((cell) => {
        let rect: DOMRect | null = null;
        cell.addEventListener('pointerenter', () => {
          rect = cell.getBoundingClientRect();
        });
        cell.addEventListener('pointermove', (event) => {
          if (!rect) return;
          cell.style.setProperty('--bf-mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
          cell.style.setProperty('--bf-my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
        });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className={className} id={id}>
      {children}
    </div>
  );
}
