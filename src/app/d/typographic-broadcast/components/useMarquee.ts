'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { RefObject } from 'react';

import { getScrollVelocity, startScrollVelocity } from './scroll-velocity';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type MarqueeOptions = {
  /** Pixels per second at rest. */
  speed: number;
  /** 1 = leftward, -1 = rightward. */
  dir?: 1 | -1;
  /** Max timeScale multiplier reached at high scroll velocity. */
  boost?: number;
};

/**
 * Velocity-bound marquee: the track loops on its own and speeds up with the
 * scroll. The track markup must contain the content twice so a -50% shift is
 * seamless.
 */
export function useMarquee(
  trackRef: RefObject<HTMLElement | null>,
  { speed, dir = 1, boost = 4.5 }: MarqueeOptions
) {
  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const span = track.scrollWidth / 2;
      if (span < 2) return;
      const duration = Math.max(6, span / speed);

      const loop =
        dir >= 0
          ? gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, ease: 'none', repeat: -1, duration })
          : gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, ease: 'none', repeat: -1, duration });

      startScrollVelocity();
      let scale = 1;
      const drive = () => {
        const target = gsap.utils.clamp(0.35, boost, 1 + Math.abs(getScrollVelocity()) / 950);
        scale += (target - scale) * 0.12;
        loop.timeScale(scale);
      };
      gsap.ticker.add(drive);

      return () => {
        gsap.ticker.remove(drive);
        loop.kill();
      };
    },
    { scope: trackRef, dependencies: [speed, dir, boost] }
  );
}
