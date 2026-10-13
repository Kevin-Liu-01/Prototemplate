'use client';

import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * A copy control's outcome state, ported from gt-cloud
 * apps/landing/src/components/landing/sections/agent/useCopyFace.ts.
 */
export type CopyOutcome = 'copied' | 'failed';

/** How long a copy control shows the outcome of a copy. */
export const COPIED_MS = 1600;

/**
 * One copy control's state: the outcome it is showing, and the write that
 * sets it. A control shows copied for COPIED_MS after a successful clipboard
 * write and failed for as long after a rejected one, then returns to idle.
 * A write that settles after a later copy or after the unmount is dropped,
 * so an outcome never shows for something no longer on screen.
 */
export function useCopyFace() {
  const [outcome, setOutcome] = useState<CopyOutcome | null>(null);
  const timer = useRef<number | null>(null);
  /* Bumped by every copy and by the unmount: a clipboard write that settles
     under a stale number belongs to a control that no longer shows. */
  const seq = useRef(0);

  useMountEffect(() => () => {
    seq.current += 1;
    if (timer.current !== null) window.clearTimeout(timer.current);
  });

  async function copy(text: string) {
    seq.current += 1;
    const mine = seq.current;
    let next: CopyOutcome;
    try {
      await navigator.clipboard.writeText(text);
      next = 'copied';
    } catch {
      next = 'failed';
    }
    if (mine !== seq.current) return;
    if (timer.current !== null) window.clearTimeout(timer.current);
    setOutcome(next);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setOutcome(null);
    }, COPIED_MS);
  }

  return { copy, outcome };
}
