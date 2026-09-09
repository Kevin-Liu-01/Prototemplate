'use client';

import { useState } from 'react';

import { usePtShell } from '@/components/viewer/shell-context';
import { useMountEffect } from '@/lib/use-mount-effect';

import './Progress.css';

/**
 * The 2px hairline under the stage. On paged routes it fills to
 * (index + 1) / total. On flow routes it follows the scroll position of the
 * scrolling box inside .pt-stagewrap, read from one passive listener on the
 * document in the capture phase (scroll events do not bubble), so the flow
 * sheet does not have to hand its element up to the shell. The listener is
 * always attached and checks the key table at event time, because a route
 * can change tables with its mode (the gallery pages in the slide and
 * scrolls in the book). A value prop overrides both for routes that measure
 * their own progress.
 */
export type ProgressProps = {
  /** 0 to 1; replaces the shell-derived fraction */
  value?: number;
};

function clamp(fraction: number): number {
  if (!Number.isFinite(fraction)) return 0;
  return Math.min(1, Math.max(0, fraction));
}

export function Progress({ value }: ProgressProps) {
  const shell = usePtShell();
  const [scrolled, setScrolled] = useState(0);

  useMountEffect(() => {
    const onScroll = (event: Event) => {
      const box = event.target;
      if (!(box instanceof HTMLElement)) return;
      if (!box.closest('.pt-stagewrap') || box.closest('.pt-panel')) return;
      const range = box.scrollHeight - box.clientHeight;
      setScrolled(range > 0 ? clamp(box.scrollTop / range) : 0);
    };
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => document.removeEventListener('scroll', onScroll, { capture: true });
  });

  const paged = shell.total > 0 && shell.index >= 0 ? (shell.index + 1) / shell.total : 0;
  const fraction = clamp(value ?? (shell.keys === 'paged' ? paged : scrolled));

  return (
    <div className='pt-progress' aria-hidden='true'>
      <i style={{ width: `${Math.round(fraction * 10000) / 100}%` }} />
    </div>
  );
}
