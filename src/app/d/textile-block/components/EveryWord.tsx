'use client';

import { useRef, useState } from 'react';

import { prefersReducedMotion } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

import { EVERY } from '../data';

/**
 * textile-block: the claim's one moving word.
 *
 * "language" recast across eight scripts. One shaped text node carrying its
 * own lang and dir; the swap is a short dip, not a per-character morph. The
 * resting markup is the English word, so the server render and the reduced
 * motion still are the same line. The loop follows the page's lifecycle
 * contract: it runs only while the word is on screen and the tab is
 * visible, and nothing runs under prefers-reduced-motion.
 */

const HOLD_MS = 2600;
const OUT_MS = 260;

const FIRST = EVERY[0] ?? { text: 'language', lang: 'en' };

export default function EveryWord() {
  const ref = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const [out, setOut] = useState(false);

  useMountEffect(() => {
    if (prefersReducedMotion()) return;
    const node = ref.current;
    if (!node) return;

    let hold = 0;
    let swap = 0;
    let onScreen = false;

    const stop = () => {
      window.clearInterval(hold);
      window.clearTimeout(swap);
      hold = 0;
      swap = 0;
      setOut(false);
    };

    const start = () => {
      if (hold || !onScreen || document.hidden) return;
      hold = window.setInterval(() => {
        setOut(true);
        swap = window.setTimeout(() => {
          setIndex((n) => (n + 1) % EVERY.length);
          setOut(false);
        }, OUT_MS);
      }, HOLD_MS);
    };

    const sync = () => {
      if (onScreen && !document.hidden) start();
      else stop();
    };

    const watcher = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { threshold: 0 }
    );
    watcher.observe(node);
    document.addEventListener('visibilitychange', sync);

    return () => {
      watcher.disconnect();
      document.removeEventListener('visibilitychange', sync);
      stop();
    };
  });

  const word = EVERY[index] ?? FIRST;

  return (
    <span
      className={out ? 'tb-every is-out' : 'tb-every'}
      dir={word.rtl ? 'rtl' : 'ltr'}
      lang={word.lang}
      ref={ref}
    >
      {word.text}
    </span>
  );
}
