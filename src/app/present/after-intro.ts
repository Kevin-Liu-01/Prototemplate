import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useState } from 'react';
import { flushSync } from 'react-dom';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * Work the presenter can do later waits here until the intro's entrance has
 * played. Every slide's setup and every same-origin frame runs on this
 * page's main thread, and a long task during the entrance stalls the shader
 * field and the title. IntroSlide calls introSettled() when its entrance
 * ends, and queued work then runs one item per idle period, so each item is
 * its own task. Setups run in the order the components mounted, which is the
 * order their ScrollTriggers were created in when they all set up at mount.
 *
 * Slide setups must exist before the deck moves, so a scroll, wheel, touch,
 * pointer press or key while any setup is still queued runs every queued
 * setup at once, in that same order, before the input's own handlers.
 */
type Item = { run: () => void; setup: boolean };

/** When a component's turn came: at mount, with nothing to wait for, or later. */
export type AfterIntro = false | 'mount' | 'later';

const queue: Item[] = [];
const INPUTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
let settled = false;
let draining = false;

function onIdle(run: () => void) {
  // Safari has no requestIdleCallback.
  if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 400 });
  else window.setTimeout(run, 16);
}

function drain() {
  // Setups go first, in mount order; the frame waits for all of them.
  const at = queue.findIndex((item) => item.setup);
  const next = queue.splice(Math.max(at, 0), 1)[0];
  if (!next) {
    // A later visit to the deck waits for its own entrance again.
    draining = false;
    settled = false;
    return;
  }
  flushSync(next.run);
  if (!queue.some((item) => item.setup)) listen(false);
  onIdle(drain);
}

function startDrain() {
  if (draining || queue.length === 0) return;
  draining = true;
  onIdle(drain);
}

function listen(on: boolean) {
  for (const type of INPUTS) {
    if (on) window.addEventListener(type, flushSetups, { capture: true, passive: true });
    else window.removeEventListener(type, flushSetups, { capture: true });
  }
  // Without capture, only the page's own scroll reaches window.
  if (on) window.addEventListener('scroll', flushSetups, { passive: true });
  else window.removeEventListener('scroll', flushSetups);
}

function flushSetups() {
  const setups = queue.filter((item) => item.setup);
  for (const item of setups) queue.splice(queue.indexOf(item), 1);
  if (setups.length) {
    flushSync(() => setups.forEach((item) => item.run()));
    // New pins queue a full refresh for the next frame, which would cut off
    // a smooth scroll the input is about to start. Refresh now instead.
    ScrollTrigger.refresh();
  }
  listen(false);
  introSettled();
}

/** The intro's entrance has played: queued work may start. */
export function introSettled() {
  if (settled) return;
  settled = true;
  startDrain();
}

/**
 * False until this component's turn after the intro settles. `setup` work
 * (a slide's ScrollTriggers) also runs on the first input; other work (the
 * prototype frame) only runs in its idle turn.
 */
export function useAfterIntro(setup = true) {
  const [ready, setReady] = useState<AfterIntro>(false);
  useMountEffect(() => {
    const item = { run: () => setReady('later'), setup };
    // A deep link or a reload partway down the deck has no entrance to wait for.
    if (window.scrollY > 0 || new URLSearchParams(window.location.search).has('d')) {
      setReady('mount');
      return;
    }
    queue.push(item);
    if (settled) startDrain();
    else listen(true);
    return () => {
      const at = queue.indexOf(item);
      if (at >= 0) queue.splice(at, 1);
    };
  });
  return ready;
}
