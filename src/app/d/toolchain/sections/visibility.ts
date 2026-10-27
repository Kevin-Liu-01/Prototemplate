'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { scrollRoot } from '@/lib/scroll-root';

gsap.registerPlugin(ScrollTrigger);

/*
 * ScrollTrigger runs a frame loop and a 250 ms poll for as long as it is
 * enabled, with or without a trigger. Once this module has loaded, and
 * again whenever a watch made here dies, it is disabled when no trigger of
 * any kind is left for IDLE_MS, so a page whose plates have unmounted, or
 * never built a watch, runs no frames. A trigger built while it is
 * disabled would be inert, so every trigger, from this module or any other,
 * enables it first: each one is built through the prototype's init, which
 * wakes it. Each enable adds GSAP's own matchMedia listeners again, which
 * only repeat idempotent work when the orientation changes.
 */
const IDLE_MS = 1000;
let asleep = false;
let sleepTimer: ReturnType<typeof setTimeout> | undefined;

function wake(): void {
  clearTimeout(sleepTimer);
  if (!asleep) return;
  asleep = false;
  ScrollTrigger.enable();
}

function sleepWhenIdle(): void {
  clearTimeout(sleepTimer);
  sleepTimer = setTimeout(() => {
    if (asleep || ScrollTrigger.getAll().length > 0) return;
    asleep = true;
    ScrollTrigger.disable();
  }, IDLE_MS);
}

type TriggerInit = (this: ScrollTrigger, ...args: unknown[]) => void;
const proto = ScrollTrigger.prototype as unknown as { init: TriggerInit & { wakes?: true } };
if (!proto.init.wakes) {
  const init = proto.init;
  const wakeThenInit: TriggerInit & { wakes?: true } = function (this: ScrollTrigger, ...args: unknown[]) {
    wake();
    init.apply(this, args);
  };
  wakeThenInit.wakes = true;
  proto.init = wakeThenInit;
}

/* registering enabled it: a page that builds no watch (reduced motion, or no plate that moves) lets it sleep */
if (typeof window !== 'undefined') sleepWhenIdle();

/**
 * Calls `onChange(true)` while any part of `trigger` is on screen and
 * `onChange(false)` while all of it is off screen: once when the watch is
 * created, after every ScrollTrigger refresh, and on every crossing. The
 * watch follows the trigger's own scroller: the page, or the scrolling
 * ancestor it sits in (scrollRoot).
 * Created inside a `useGSAP` callback, the watch belongs to that context and
 * dies with it; created anywhere else, the caller kills the returned trigger.
 */
export function watchVisibility(trigger: Element, onChange: (visible: boolean) => void): ScrollTrigger {
  const watch = ScrollTrigger.create({
    trigger,
    scroller: scrollRoot(trigger) ?? undefined,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => onChange(self.isActive),
    onRefresh: (self) => onChange(self.isActive),
  });
  /* a context's revert reaches kill too (revert calls self.kill) */
  const kill = watch.kill.bind(watch);
  watch.kill = (reset, allowAnimation) => {
    kill(reset, allowAnimation);
    sleepWhenIdle();
  };
  return watch;
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
