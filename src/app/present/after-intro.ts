import { useState } from 'react';
import { flushSync } from 'react-dom';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * Work the presenter can do later waits here until the intro's entrance has
 * played. Every same-origin frame and every slide's setup runs on this page's
 * main thread, and a long task during the entrance stalls the shader field
 * and the title. IntroSlide calls introSettled() when its entrance ends; the
 * first scroll settles the queue too, since the intro is then on its way
 * out. Queued work then runs one item per idle period, so each item is its
 * own task.
 */
const queue: (() => void)[] = [];
let settled = false;
let draining = false;

function onIdle(run: () => void) {
  // Safari has no requestIdleCallback.
  if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 400 });
  else window.setTimeout(run, 16);
}

function drain() {
  const next = queue.shift();
  if (!next) {
    // A later visit to the deck waits for its own entrance again.
    draining = false;
    settled = false;
    return;
  }
  flushSync(next);
  onIdle(drain);
}

function startDrain() {
  if (draining || queue.length === 0) return;
  draining = true;
  onIdle(drain);
}

/** The intro's entrance has played: queued work may start. */
export function introSettled() {
  if (settled) return;
  settled = true;
  window.removeEventListener('scroll', introSettled);
  startDrain();
}

/** False until this component's turn in the queue after the intro settles. */
export function useAfterIntro() {
  const [ready, setReady] = useState(false);
  useMountEffect(() => {
    const run = () => setReady(true);
    queue.push(run);
    if (settled) startDrain();
    else window.addEventListener('scroll', introSettled, { passive: true });
    return () => {
      const at = queue.indexOf(run);
      if (at >= 0) queue.splice(at, 1);
    };
  });
  return ready;
}
