import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useState } from 'react';
import { flushSync } from 'react-dom';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The order of the presenter's load work. Hydration is one task. The intro's
 * title rises as soon as its field has drawn a first frame (IntroSlide.tsx),
 * with no slide set up yet: the rise is a CSS animation on the compositor.
 * Once the entrance has played, the slides set up one per idle period, in
 * mount order (top to bottom, the presenter's own triggers last), each one
 * commit and one ScrollTrigger refresh. A slide's pins only push the slides
 * below it, which are not set up yet, so each refresh leaves the next
 * slide's triggers correct. When the last setup has run, the deck is set up.
 *
 * A scroll, wheel, touch, pointer press or key before the setups have run
 * runs all that are left first, before the input's own handlers.
 */

/** When a component's turn came: at mount, with nothing to wait for, or later. */
export type Turn = false | 'mount' | 'later';

const queue: (() => void)[] = [];
const settled: (() => void)[] = [];
const INPUTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
let played = false;
let pending = false;

function onIdle(run: () => void) {
  // Safari has no requestIdleCallback.
  if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 200 });
  else window.setTimeout(run, 16);
}

/** Runs the next `count` setups in one commit, then one refresh. */
function runSetups(count: number) {
  const runs = queue.splice(0, count);
  if (runs.length === 0) return;
  flushSync(() => runs.forEach((run) => run()));
  // New pins queue a full refresh for the next frame, where it would cut
  // into a smooth scroll the input is starting. Refresh now.
  ScrollTrigger.refresh();
}

function finish() {
  listen(false);
  // A later visit to the deck waits for its own entrance again.
  played = false;
  settled.splice(0).forEach((done) => done());
}

/** An input before the setups have run: all that are left run now. */
function setUpAll() {
  runSetups(queue.length);
  listen(false);
  if (played) finish();
}

function turn() {
  pending = false;
  if (!played) return;
  if (queue.length === 0) {
    finish();
    return;
  }
  runSetups(1);
  schedule();
}

function schedule() {
  if (pending) return;
  pending = true;
  onIdle(turn);
}

function listen(on: boolean) {
  for (const type of INPUTS) {
    if (on) window.addEventListener(type, setUpAll, { capture: true, passive: true });
    else window.removeEventListener(type, setUpAll, { capture: true });
  }
  // Without capture, only the page's own scroll reaches window.
  if (on) window.addEventListener('scroll', setUpAll, { passive: true });
  else window.removeEventListener('scroll', setUpAll);
}

/**
 * The intro's entrance has played: the setups may run. Calls done once the
 * last one has (at once when none is waiting).
 */
export function entrancePlayed(done: () => void) {
  settled.push(done);
  played = true;
  schedule();
  return () => {
    const at = settled.indexOf(done);
    if (at >= 0) settled.splice(at, 1);
  };
}

/** False until this component's setup turn, which comes after the intro's entrance. */
export function useDeckSetup() {
  const [turnCame, setTurn] = useState<Turn>(false);
  useMountEffect(() => {
    // A deep link or a reload partway down the deck has no entrance to wait for.
    if (window.scrollY > 0 || new URLSearchParams(window.location.search).has('d')) {
      setTurn('mount');
      return;
    }
    const run = () => setTurn('later');
    queue.push(run);
    listen(true);
    if (played) schedule();
    return () => {
      const at = queue.indexOf(run);
      if (at >= 0) queue.splice(at, 1);
    };
  });
  return turnCame;
}
