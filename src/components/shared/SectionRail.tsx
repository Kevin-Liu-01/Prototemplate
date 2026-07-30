'use client';

import { useRef, useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import './SectionRail.css';

/**
 * Scroll-spy section rail — the presenter HUD rail's visual grammar (thin line
 * markers on the left edge, active line grows, uppercase micro-labels on
 * hover, difference blend) ported to the direction pages as shared chrome.
 *
 * Sections are discovered from the live DOM rather than declared, because the
 * 23 direction pages are heterogeneous: anything matching `section` or
 * `[data-rail-label]` that is at least half a viewport tall (or explicitly
 * labeled) becomes a marker. Pages that yield fewer than three render no rail.
 */

type RailSection = {
  el: HTMLElement;
  label: string;
};

/** Collapses whitespace and clips to ~2–3 words so labels stay micro. */
function truncateWords(text: string): string {
  const words = text.trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
  if (words.length === 0) return '';
  const three = words.slice(0, 3).join(' ');
  return three.length > 18 && words.length > 2 ? words.slice(0, 2).join(' ') : three;
}

/** Label priority: explicit data-rail-label → aria-label → first h1/h2/h3. */
function labelFor(el: HTMLElement): string {
  const explicit = el.getAttribute('data-rail-label');
  if (explicit && explicit.trim()) return explicit.trim();
  const aria = el.getAttribute('aria-label');
  if (aria && aria.trim()) return truncateWords(aria);
  const heading = el.querySelector<HTMLElement>('h1, h2, h3');
  if (!heading) return '';
  // innerText, not textContent: headings here often split lines into block
  // spans, and textContent would weld the fragments together ("in\nevery" →
  // "inevery"). innerText breaks at block boundaries; hidden headings fall
  // back to textContent.
  return truncateWords(heading.innerText || heading.textContent || '');
}

function collectSections(): RailSection[] {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>('section, [data-rail-label]')
  ).filter((el) => !el.closest('[data-dock], .srail'));

  // Top-level only: a section nested inside another candidate is a sub-beat
  // of its parent, not its own stop on the rail.
  const topLevel = candidates.filter(
    (el) => !candidates.some((other) => other !== el && other.contains(el))
  );

  const minHeight = window.innerHeight * 0.5;
  const sections: RailSection[] = [];
  for (const el of topLevel) {
    const rect = el.getBoundingClientRect();
    if (rect.height < 1) continue; // hidden or collapsed
    if (rect.height < minHeight && !el.hasAttribute('data-rail-label')) continue;
    const label = labelFor(el);
    if (!label) continue;
    sections.push({ el, label });
  }
  return sections;
}

export default function SectionRail() {
  const sectionsRef = useRef<RailSection[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  useMountEffect(() => {
    let raf = 0;

    // The section nearest the viewport center is active: distance is zero
    // while a section spans the center, else the gap to its closest edge.
    const measure = () => {
      raf = 0;
      const center = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      sectionsRef.current.forEach((section, i) => {
        const rect = section.el.getBoundingClientRect();
        const dist =
          rect.top > center ? rect.top - center : rect.bottom < center ? center - rect.bottom : 0;
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive((prev) => (prev === best ? prev : best));
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    const discover = () => {
      const sections = collectSections();
      sectionsRef.current = sections;
      const next = sections.map((s) => s.label);
      setLabels((prev) =>
        prev.length === next.length && prev.every((l, i) => l === next[i]) ? prev : next
      );
      schedule();
    };

    const onResize = () => discover();

    // Double rAF lets the page's own mount work (GSAP pinning, font swaps)
    // settle before heights are judged; the timer catches late layout from
    // images and lazy content that lands after first paint.
    let settleTimer = 0;
    const kickoff = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        discover();
        settleTimer = window.setTimeout(discover, 1200);
      });
    });

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', discover);

    return () => {
      cancelAnimationFrame(kickoff);
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', discover);
    };
  });

  if (labels.length < 3) return null;

  const goTo = (i: number) => {
    const target = sectionsRef.current[i];
    if (!target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <nav className='srail' aria-label='Sections'>
      {labels.map((label, i) => (
        <button
          key={`${i}-${label}`}
          type='button'
          className={i === active ? 'is-active' : ''}
          aria-current={i === active ? 'true' : undefined}
          onClick={() => goTo(i)}
        >
          <i />
          <em>{label}</em>
        </button>
      ))}
    </nav>
  );
}
