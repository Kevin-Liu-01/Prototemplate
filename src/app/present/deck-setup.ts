import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useState } from 'react';
import { flushSync } from 'react-dom';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The order of the presenter's load work. Hydration is one task. Once the
 * intro's field has drawn its first frame (it draws in a worker, which
 * needs a moment of this thread to start), every slide's setup (its
 * ScrollTriggers and pins) runs together in the next idle period, one
 * commit and one refresh, while the field fades in. The intro's title
 * rises once the deck is set up and the window has loaded (whenDeckReady),
 * so neither a setup nor the refresh ScrollTrigger runs on load lands
 * during the entrance. Work that can wait longer (the prototype frame, whose
 * document hydrates on this page's main thread) runs after the entrance
 * has played (entrancePlayed).
 *
 * A scroll, wheel, touch, pointer press or key before the setups have run
 * runs them first, before the input's own handlers.
 */
type Item = { run: () => void; setup: boolean };

/** When a component's turn came: at mount, with nothing to wait for, or later. */
export type Turn = false | 'mount' | 'later';

const queue: Item[] = [];
const deckReady: (() => void)[] = [];
const INPUTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
let played = false;
let pending = false;
let holds = 0;
let loadWait = 0;

function onIdle(run: () => void) {
  // Safari has no requestIdleCallback.
  if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 200 });
  else window.setTimeout(run, 16);
}

/** Runs every queued setup in one commit, in mount order, then one refresh. */
function setUp() {
  listen(false);
  const setups = queue.filter((item) => item.setup);
  if (setups.length === 0) return;
  for (const item of setups) queue.splice(queue.indexOf(item), 1);
  flushSync(() => setups.forEach((item) => item.run()));
  // New pins queue a full refresh for the next frame, where it would cut
  // into the entrance or a smooth scroll the input is starting. Refresh now.
  ScrollTrigger.refresh();
}

function turn() {
  pending = false;
  if (holds > 0) return;
  setUp();
  // A slow picture must not hold the title for long: wait a second at most.
  if (deckReady.length && document.readyState !== 'complete' && !loadWait) {
    const go = () => {
      window.clearTimeout(loadWait);
      window.removeEventListener('load', go);
      schedule();
    };
    window.addEventListener('load', go);
    loadWait = window.setTimeout(go, 1000);
    return;
  }
  loadWait = 0;
  deckReady.splice(0).forEach((play) => play());
  if (!played) return;
  queue.splice(0).forEach((item) => flushSync(item.run));
  // A later visit to the deck waits for its own entrance again.
  played = false;
}

function schedule() {
  if (pending) return;
  pending = true;
  onIdle(turn);
}

function listen(on: boolean) {
  for (const type of INPUTS) {
    if (on) window.addEventListener(type, setUp, { capture: true, passive: true });
    else window.removeEventListener(type, setUp, { capture: true });
  }
  // Without capture, only the page's own scroll reaches window.
  if (on) window.addEventListener('scroll', setUp, { passive: true });
  else window.removeEventListener('scroll', setUp);
}

/** Keeps the setups waiting until the returned release is called. */
export function holdSetup() {
  holds++;
  let held = true;
  return () => {
    if (!held) return;
    held = false;
    holds--;
    schedule();
  };
}

/** Calls play once every slide is set up. */
export function whenDeckReady(play: () => void) {
  deckReady.push(play);
  schedule();
  return () => {
    const at = deckReady.indexOf(play);
    if (at >= 0) deckReady.splice(at, 1);
  };
}

/** The intro's entrance has played: the work waiting for it may run. */
export function entrancePlayed() {
  played = true;
  schedule();
}

function useTurn(setup: boolean) {
  const [turnCame, setTurn] = useState<Turn>(false);
  useMountEffect(() => {
    // A deep link or a reload partway down the deck has no entrance to wait for.
    if (window.scrollY > 0 || new URLSearchParams(window.location.search).has('d')) {
      setTurn('mount');
      return;
    }
    const item = { run: () => setTurn('later'), setup };
    queue.push(item);
    if (setup) listen(true);
    schedule();
    return () => {
      const at = queue.indexOf(item);
      if (at >= 0) queue.splice(at, 1);
    };
  });
  return turnCame;
}

/** False until the deck's setup turn: the first idle period once the intro's field draws. */
export function useDeckSetup() {
  return useTurn(true);
}

/** False until the intro's entrance has played. */
export function useAfterEntrance() {
  return useTurn(false) !== false;
}
