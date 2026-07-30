'use client';

import gsap from 'gsap';

/**
 * One shared scroll-velocity source for every marquee in this direction.
 *
 * Lenis scrolls the window natively, so sampling window.scrollY per frame is
 * both accurate and free of any mount-order dependency on <SmoothScroll>
 * (parent effects run after child effects, so window.lenis is not yet
 * available when a section's useGSAP first runs).
 */
const state = { velocity: 0 };
let started = false;
let last = 0;

function sample() {
  const y = window.scrollY;
  // 60fps-normalised px/second; smoothed so a single dropped frame cannot spike it.
  const raw = (y - last) * 60;
  state.velocity += (raw - state.velocity) * 0.35;
  last = y;
}

export function startScrollVelocity(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (!started) {
    started = true;
    last = window.scrollY;
    gsap.ticker.add(sample);
  }
  return () => {};
}

export function getScrollVelocity(): number {
  return state.velocity;
}
