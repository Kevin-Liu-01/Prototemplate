'use client';

import { useState } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The elevator panel: a fixed brass plate on the right edge with one round
 * button per floor, roof at the top the way a real cab panel reads. An
 * IntersectionObserver lights the button for the floor currently in view;
 * the buttons themselves are plain anchors, so navigation works with no JS
 * and no smooth-scroll override. Hidden below 1140px (styles.css), where
 * the canopy nav carries the same routes.
 */

const FLOORS = [
  { id: 'roof', label: 'R', name: 'Roof' },
  { id: 'rates', label: '6', name: 'Rates' },
  { id: 'platform', label: '5', name: 'Platform' },
  { id: 'directory', label: '4', name: 'Directory' },
  { id: 'component', label: '3', name: 'The T component' },
  { id: 'tenants', label: '2', name: 'Tenants' },
  { id: 'lobby', label: 'L', name: 'Lobby' },
] as const;

export default function ElevatorRail() {
  const [active, setActive] = useState<string>('lobby');

  useMountEffect(() => {
    const sections = FLOORS.map((floor) => document.getElementById(floor.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    /* Track each floor's visible ratio and light the strongest one, so tall
       and short sections resolve to a single lit button without thrash. */
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let bestId = '';
        let bestRatio = 0;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId) setActive(bestId);
      },
      { threshold: [0, 0.12, 0.25, 0.5, 0.75] },
    );

    for (const el of sections) observer.observe(el);
    return () => observer.disconnect();
  });

  return (
    <nav className='ss-rail' aria-label='Floors'>
      <span className='ss-rail-cap' aria-hidden />
      <ul>
        {FLOORS.map((floor) => (
          <li key={floor.id}>
            <a
              className={active === floor.id ? 'ss-rail-btn is-lit' : 'ss-rail-btn'}
              href={`#${floor.id}`}
              title={floor.name}
              aria-label={floor.name}
              aria-current={active === floor.id ? 'true' : undefined}
            >
              {floor.label}
            </a>
          </li>
        ))}
      </ul>
      <span className='ss-rail-cap' aria-hidden />
    </nav>
  );
}
