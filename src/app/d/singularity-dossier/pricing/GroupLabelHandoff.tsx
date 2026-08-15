'use client';

import { useEffect } from 'react';

/**
 * The pinned group label's handoff: Chromium doesn't constrain sticky
 * cells to their row group, so the pinned label would sit still while
 * the next group's label glides over it. This emulates contained
 * sticky — the incoming label pushes the pinned one up (they stack),
 * and the outgoing one clips away at the band's top edge. Mirrors the
 * CSS pin math (59 nav + 151 band − 41 CTA inset − 61/2).
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
    const BAND_TOP = 59;
    const H = 61;
    let raf = 0;
    const settle = () => {
      raf = 0;
      for (const label of labels) {
        const tbody = label.closest('tbody');
        if (!tbody) continue;
        const box = tbody.getBoundingClientRect();
        const base = box.top > PIN ? box.top : PIN;
        const desired = Math.min(base, box.bottom - H);
        const dy = desired - base;
        label.style.transform = dy < 0 ? `translateY(${dy}px)` : '';
        const clipTop = Math.max(0, BAND_TOP - desired);
        label.style.clipPath =
          clipTop > 0 ? `inset(${clipTop}px 0 0 0)` : '';
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
