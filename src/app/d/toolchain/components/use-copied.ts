'use client';

import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/** How long a copy control reads "Copied" after a successful write. */
const COPIED_MS = 1600;

/**
 * A copy control's state for one string. `copy()` writes `text` to the
 * clipboard and sets `copied` for 1.6 s once the write succeeds; a missing
 * or refused clipboard leaves the control as it was, so it never claims a
 * copy that did not happen. A write that settles after a later copy or after
 * the unmount is dropped.
 */
export function useCopied(text: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  /* bumped by every copy and by the unmount: a write that settles under a
     stale number belongs to a control that no longer shows it */
  const seq = useRef(0);

  useMountEffect(() => () => {
    seq.current += 1;
    if (timer.current !== null) window.clearTimeout(timer.current);
  });

  const write = async () => {
    seq.current += 1;
    const mine = seq.current;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    if (mine !== seq.current) return;
    if (timer.current !== null) window.clearTimeout(timer.current);
    setCopied(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setCopied(false);
    }, COPIED_MS);
  };

  const copy = () => {
    void write();
  };

  return { copied, copy };
}
