'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Calls `onChange(true)` while any part of `trigger` is on screen and
 * `onChange(false)` while all of it is off screen: once when the watch is
 * created, after every ScrollTrigger refresh, and on every crossing.
 * Created inside a `useGSAP` callback, the watch belongs to that context and
 * dies with it; created anywhere else, the caller kills the returned trigger.
 */
export function watchVisibility(trigger: Element, onChange: (visible: boolean) => void): ScrollTrigger {
  return ScrollTrigger.create({
    trigger,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => onChange(self.isActive),
    onRefresh: (self) => onChange(self.isActive),
  });
}

/**
 * Pauses every running animation in `animations` while `trigger` is off
 * screen and resumes, when it returns, the ones it paused. An animation that
 * has not started yet (created paused, waiting for its own trigger) is left
 * alone, so a loop costs nothing while the reader is elsewhere on the page
 * and still starts where it always did.
 */
export function pauseWhileHidden(trigger: Element, animations: readonly gsap.core.Animation[]): ScrollTrigger {
  const held = new Set<gsap.core.Animation>();
  return watchVisibility(trigger, (visible) => {
    if (visible) {
      for (const animation of held) animation.resume();
      held.clear();
      return;
    }
    for (const animation of animations) {
      if (animation.paused()) continue;
      animation.pause();
      held.add(animation);
    }
  });
}
