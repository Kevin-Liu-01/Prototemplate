'use client';

import { useEffect } from 'react';

/**
 * The pinned group label's handoff: Chromium doesn't constrain sticky
 * cells to their row group, so as the next group's label glides into
 * the header band the pinned one would show beneath it. This eclipses
 * the pinned label the moment its successor enters the band slot —
 * mirrors the CSS pin math (59 nav + 151 band − 41 CTA inset − 61/2).
 */
export default function GroupLabelHandoff() {
  useEffect(() => {
    const labels = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.pricing-compare tr.pricing-compare-group th'
      )
    );
    if (labels.length === 0) return;
    const PIN = 59 + 151 - 41 - 61 / 2;
    let raf = 0;
    const settle = () => {
      raf = 0;
      let incoming: HTMLElement | null = null;
      for (const label of labels) {
        const top = label.getBoundingClientRect().top;
        if (top > PIN + 1 && top < PIN + 61) incoming = label;
      }
      for (const label of labels) {
        const pinned = Math.abs(label.getBoundingClientRect().top - PIN) <= 1;
        if (incoming && pinned && incoming !== label) {
          label.dataset.eclipsed = '';
        } else {
          delete label.dataset.eclipsed;
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(settle);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    settle();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
