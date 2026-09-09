'use client';

import { useRef, useState } from 'react';

import type { ShellItem } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import { ThumbShot } from './ThumbShot';

import './HoverPreview.css';

/** How long a row is hovered or focused before its preview opens: long enough that a pointer crossing the list never opens it. */
export const PREVIEW_DELAY_MS = 500;

/** The card's box: a 240px frame at 16:9 inside a 1px mat, the title row under it. */
const CARD_W = 240;
const CARD_H = 172;
/** the gap between the list's edge and the card, and the card's distance from the viewport edges */
const GAP = 8;

export type PreviewState = { item: ShellItem; top: number; left: number };

/**
 * Where the card goes for a row: 8px right of the list's edge (the aside
 * that holds the row, so the card clears the scrollbar; the row itself when
 * there is none), its vertical center on the row's, so it tracks the
 * pointer, clamped so the whole card stays inside the viewport.
 */
export function placePreview(item: ShellItem, anchor: Element): PreviewState {
  const rect = anchor.getBoundingClientRect();
  const edge = (anchor.closest('.pt-sb') ?? anchor).getBoundingClientRect();
  const maxTop = window.innerHeight - CARD_H - GAP;
  const maxLeft = window.innerWidth - CARD_W - GAP;
  return {
    item,
    top: Math.max(GAP, Math.min(maxTop, rect.top + rect.height / 2 - CARD_H / 2)),
    left: Math.max(GAP, Math.min(maxLeft, edge.right + GAP)),
  };
}

/** True on a device with a hovering, fine pointer. A touch screen never previews. */
export function canPreview(): boolean {
  try {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  } catch {
    return false;
  }
}

export type HoverPreviewControls = {
  preview: PreviewState | null;
  /** start the delay for a row; only an item with a capture opens */
  arm: (item: ShellItem, anchor: HTMLElement) => void;
  /** open now (Space, or the row's affordance); the same item again closes */
  open: (item: ShellItem, anchor: HTMLElement) => void;
  /** cancel a pending open and close the card */
  close: () => void;
};

/**
 * The preview's state and timer for one list. arm() waits PREVIEW_DELAY_MS
 * and then places the card beside the row, unless close() ran first or the
 * row left the document; open() skips the wait. Any pointer press anywhere
 * in the document closes it, so a click that moves on never leaves a card
 * behind. The timer and the listener are cleared on unmount through the
 * one mount effect.
 */
export function useHoverPreview(delay = PREVIEW_DELAY_MS): HoverPreviewControls {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const timer = useRef(0);
  const shown = useRef<string | null>(null);

  const cancel = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = 0;
    }
  };

  const close = () => {
    cancel();
    shown.current = null;
    setPreview(null);
  };

  useMountEffect(() => {
    document.addEventListener('pointerdown', close, true);
    return () => {
      document.removeEventListener('pointerdown', close, true);
      window.clearTimeout(timer.current);
    };
  });

  const show = (item: ShellItem, anchor: HTMLElement) => {
    if (!anchor.isConnected) return;
    shown.current = item.id;
    setPreview(placePreview(item, anchor));
  };

  const arm = (item: ShellItem, anchor: HTMLElement) => {
    cancel();
    if (!item.shot || !canPreview()) return;
    timer.current = window.setTimeout(() => {
      timer.current = 0;
      show(item, anchor);
    }, delay);
  };

  const open = (item: ShellItem, anchor: HTMLElement) => {
    cancel();
    if (!item.shot) return;
    if (shown.current === item.id) {
      close();
      return;
    }
    show(item, anchor);
  };

  return { preview, arm, open, close };
}

export type HoverPreviewProps = { preview: PreviewState };

/**
 * The floating card beside an outline row (directive 7.3): the item's
 * static capture at 240x135 with its number and title under it, fixed to
 * the viewport at the placed position. Decorative: it repeats what the row
 * says, so it is hidden from assistive technology and takes no pointer.
 */
export function HoverPreview({ preview }: HoverPreviewProps) {
  const { item, top, left } = preview;
  return (
    <div className='pt-preview' style={{ top, left }} aria-hidden='true'>
      <div className='pt-preview-frame'>
        <ThumbShot item={item} />
      </div>
      <div className='pt-preview-title'>
        {item.n ? <span>{item.n} </span> : null}
        {item.title}
      </div>
    </div>
  );
}
