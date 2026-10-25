'use client';

import type gsap from 'gsap';

/** Plays a paused timeline while its trigger is on screen and pauses it otherwise; returns the disconnect. */
export function playWhileVisible(trigger: Element, timeline: gsap.core.Timeline): () => void {
  const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? timeline.play() : timeline.pause()));
  io.observe(trigger);
  return () => io.disconnect();
}
