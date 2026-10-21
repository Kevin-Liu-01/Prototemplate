'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import type { RefObject } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The hooks every live plate on the Components pages shares. They hold the
 * lifecycle contract of the instruments library (gt-components): arm an
 * engine once the plate comes near the viewport, read the reader's motion
 * setting without a hydration mismatch, and re-read an ink token when
 * html[data-theme] flips.
 */

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReduced(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readReduced(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(REDUCED_QUERY).matches);
}

/** True when the reader's system asks for reduced motion; false on the server and in the hydrating render. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, readReduced, () => false);
}

function subscribeTheme(onChange: () => void): () => void {
  if (typeof MutationObserver === 'undefined') return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

function readTheme(): string {
  return document.documentElement.getAttribute('data-theme') ?? 'dark';
}

/** The page theme from html[data-theme] ('dark' when unset, as the root layout stamps it). */
export function useTheme(): string {
  return useSyncExternalStore(subscribeTheme, readTheme, () => 'dark');
}

/**
 * Arms once: false until the element comes within 180px of the viewport,
 * then true for good. The engines pause themselves offscreen after that,
 * so the observer disconnects on its first hit.
 */
export function useArmed(ref: RefObject<HTMLElement | null>): boolean {
  const [armed, setArmed] = useState(false);
  useMountEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setArmed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setArmed(true);
          observer.disconnect();
        }
      },
      { rootMargin: '180px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  });
  return armed;
}

/** Reads a custom property off an element, trimmed; the fallback when it is unset. */
export function readToken(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

/** A counter for the Replay buttons: bump it and key a component on it to remount it. */
export function useReplay(): [number, () => void] {
  const [n, setN] = useState(0);
  const bump = useRef(() => setN((v) => v + 1));
  return [n, bump.current];
}
