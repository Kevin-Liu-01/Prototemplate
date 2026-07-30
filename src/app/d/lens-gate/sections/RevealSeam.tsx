'use client';

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { useRef } from 'react';

import './reveal-seam.css';

/**
 * The house slide-to-reveal seam — ONE handle for every place the page
 * pulls a rendered result back to the source that produced it (the hero
 * terminal's preview card, the cinema's component showcases).
 *
 * The mechanic (founder-corrected): both layers are full-width, stacked
 * and pinned; the seam never moves content. It only writes `--seam-cut`
 * on the box, and the revealed layer clips to that boundary with
 * `clip-path: inset(0 0 0 var(--seam-cut))` — the classic before/after
 * comparison, where the window moves and the picture stays put.
 *
 * Travel is the full 0–100%. Pointer drag (with capture, so touch and
 * fast drags hold), and arrow keys nudge 5% when focused. External
 * drivers (intro tweens, beat scrubs) write the same CSS var directly;
 * the pointer math reads the box rect fresh each move, so the seam
 * never disagrees with them.
 */

/** Structural ref type: accepts any element ref regardless of exact React
    RefObject generation. */
type SeamBox = { readonly current: HTMLElement | null };

type RevealSeamProps = {
  /** The stacked box the seam cuts; receives the --seam-cut property. */
  boxRef: SeamBox;
  ariaLabel: string;
  /** The resting cut, only for the initial aria-valuenow (percent). */
  defaultCut?: number;
  /** First-touch hook — kill guided tours, mark the reader in control. */
  onInteract?: () => void;
  /** Every cut this seam applies — derive companion dials (e.g. --open). */
  onCutChange?: (pct: number, box: HTMLElement) => void;
};

export default function RevealSeam({
  boxRef,
  ariaLabel,
  defaultCut = 70,
  onInteract,
  onCutChange,
}: RevealSeamProps) {
  const dragging = useRef(false);

  const apply = (handle: HTMLElement, pct: number) => {
    const box = boxRef.current;
    if (!box) return;
    const cut = Math.min(100, Math.max(0, pct));
    box.style.setProperty('--seam-cut', `${cut}%`);
    handle.setAttribute('aria-valuenow', String(Math.round(cut)));
    onCutChange?.(cut, box);
  };

  const down = (e: ReactPointerEvent<HTMLSpanElement>) => {
    onInteract?.();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const move = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (!dragging.current || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    if (r.width === 0) return;
    apply(e.currentTarget, ((e.clientX - r.left) / r.width) * 100);
  };

  const up = () => {
    dragging.current = false;
  };

  const key = (e: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    /* while the seam is focused the arrows are the slider's — keep them
       from the presenter dock's window-level prev/next navigation */
    e.stopPropagation();
    onInteract?.();
    const box = boxRef.current;
    if (!box) return;
    /* read the live value so keys stay in step with tweens and drags */
    const now = parseFloat(getComputedStyle(box).getPropertyValue('--seam-cut'));
    const from = Number.isFinite(now) ? now : defaultCut;
    apply(e.currentTarget, from + (e.key === 'ArrowLeft' ? -5 : 5));
  };

  return (
    <span
      className='tc-seam'
      role='slider'
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(defaultCut)}
      tabIndex={0}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
    />
  );
}
