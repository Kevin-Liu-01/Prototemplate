'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import type { ReactNode } from 'react';

import { prefersReducedMotion } from '@/lib/reduced-motion';

gsap.registerPlugin(useGSAP);

/**
 * The codex's one entrance, and the only client code a leaf needs: a plain
 * div around the server-rendered leaf whose `[data-reveal]` descendants
 * rise 16px to rest over 0.62s with a short stagger, once, when the leaf's
 * top reaches 84% of the viewport or the reader is past it. The motion is
 * transform only: content is fully visible at rest, before the script runs
 * and without scrolling, so a full-page capture, a no-JS render, and a
 * thumbnail all show the finished page. Under reduced motion nothing is set
 * up and the markup pose is the still.
 */
export default function QuietReveal({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const root = scope.current;
      if (root === null) return;
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
      if (items.length === 0) return;
      gsap.set(items, { y: 16 });
      const rise = gsap.to(items, { y: 0, duration: 0.62, ease: 'power2.out', stagger: 0.055, paused: true });
      /* the root reaches far above the viewport, so a leaf the reader jumped past still counts as reached */
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          io.disconnect();
          rise.play();
        },
        { root: document, rootMargin: '100000px 0px -16% 0px' }
      );
      io.observe(root);
      return () => io.disconnect();
    },
    { scope }
  );

  return <div ref={scope}>{children}</div>;
}
