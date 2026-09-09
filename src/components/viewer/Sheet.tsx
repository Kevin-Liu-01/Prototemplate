'use client';

import { useGSAP } from '@gsap/react';
import type { MouseEvent, ReactNode, Ref, TouchEvent } from 'react';
import { useRef, useState } from 'react';

import { pad2 } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import { Icon } from './icons';
import { usePtShell } from './shell-context';
import { SheetFrame } from './SheetFrame';

import './Sheet.css';

/** The plate left around the sheet: 28px, 12px at or below 900px, 0 in present mode. */
export const SHEET_PAD = { wide: 28, narrow: 12, present: 0 } as const;

/** The caption row under a frameless sheet: 24px, with a 4px gap above it. */
const CAPTION_H = 28;

/** A touch has to travel this far to count as a swipe. */
const SWIPE_PX = 40;

/** How long the outgoing slide stays for its fade; matches --pt-dur-fast in tokens.css. */
const OUT_MS = 120;

export type SheetFit = {
  /** the stage transform, W / w */
  scale: number;
  /** the sheet's content box, round(w s) by round(h s) */
  width: number;
  height: number;
  /** where the sheet's 1px border box sits inside the stage box */
  left: number;
  top: number;
};

export type SheetFitInput = {
  /** stage width minus the open panel */
  aw: number;
  ah: number;
  w: number;
  h: number;
  pad: number;
  /** `contain` fits both axes (the default); `height` fills the stage height and lets the sheet pan sideways */
  fit?: 'contain' | 'height';
};

/**
 * The fit math from the deck viewer (parts/tail.html, fit()). The w x h
 * stage scales to the space left after the pad and the sheet is centered
 * in it; `left` and `top` place the sheet's border box one pixel out so the
 * border sits around, not over, the scaled content. With fit 'height' the
 * scale follows the height alone, so a sheet wider than the stage (the
 * compare rig's two panes) keeps its text legible and pans sideways from
 * the pad. Pure, so the sheet can compute it in render from the stage size
 * the shell publishes.
 */
export function fitSheet({ aw, ah, w, h, pad, fit = 'contain' }: SheetFitInput): SheetFit {
  const byHeight = (ah - pad * 2) / h;
  const s = Math.max(0.05, fit === 'height' ? byHeight : Math.min((aw - pad * 2) / w, byHeight));
  const width = Math.round(w * s);
  const height = Math.round(h * s);
  return {
    scale: width / w,
    width,
    height,
    left: Math.max(pad, Math.round((aw - width) / 2)) - 1,
    top: Math.round((ah - height) / 2) - 1,
  };
}

export type FixedSheetProps = {
  variant: 'fixed';
  /** stage width in CSS pixels before scaling; 1600 for a slide, 1440 for a site exhibit */
  w?: number;
  h?: number;
  /** the rails, rules, crosses, wordmark and counter; off for site exhibits */
  frame?: boolean;
  /** how the sheet meets the stage; `height` pans sideways */
  fit?: 'contain' | 'height';
  /**
   * The 24px caption under a frameless sheet. Left out, a frameless sheet
   * names the active item and its live width on the left and the count on
   * the right; false hides it; a node replaces it.
   */
  caption?: ReactNode | false;
  /**
   * The key of the item the children show, for routes whose children change
   * with the active item (the gallery's live exhibit). With it, the children
   * sit in a wrapper keyed by the item, the wrapper that leaves stays for
   * the outgoing fade and the wrapper that arrives rises in from the side
   * the move came from (directive 7.4). Leave it off when the stage is one
   * fixed body whose slides toggle their own `is-on` class, as the deck's
   * injected markup does: the sheet animates those slides in place instead.
   */
  itemKey?: string;
  children?: ReactNode;
};

export type FlowSheetProps = {
  variant: 'flow';
  /** the column: 1280px, or the 1170px article rail */
  width?: 1280 | 'rail';
  /** the scroll region, for Progress and scroll spies */
  scrollRef?: Ref<HTMLDivElement>;
  children?: ReactNode;
};

export type SheetProps = FixedSheetProps | FlowSheetProps;

/** One keyed body of stage content: the item it shows and its node. */
type Slot = { key: string; node: ReactNode };

/**
 * The content frame inside the stage. Fixed: a w x h sheet scaled to fit,
 * shown in slide mode, with the ring drawn as a mat (1px edge border, 1px
 * paper gap, 1px hair-soft outline; no shadow). Flow: a ruled scroll
 * region holding the same ring around a reading column. Both sit inside
 * ViewerShell's .pt-stagewrap.
 */
export function Sheet(props: SheetProps) {
  if (props.variant === 'flow') return <FlowSheet {...props} />;
  return <FixedSheet {...props} />;
}

/**
 * Injected slide markup (the deck) marks its current slide `.slide.is-on`
 * and hides the rest, so the slide that lost the mark vanishes before it
 * can fade. This watches the sheet for that class change and holds the
 * slide that lost `is-on` as `.is-off` for the outgoing duration, which
 * Sheet.css shows and fades. A slide that comes back on while it is still
 * leaving drops the mark at once. Off under reduced motion.
 */
function watchOutgoingSlides(root: HTMLElement): () => void {
  const timers = new Map<HTMLElement, number>();
  const settle = (el: HTMLElement) => {
    window.clearTimeout(timers.get(el));
    timers.delete(el);
    el.classList.remove('is-off');
  };
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      const el = record.target;
      if (!(el instanceof HTMLElement) || !el.classList.contains('slide')) continue;
      if (el.classList.contains('is-on')) {
        if (el.classList.contains('is-off')) settle(el);
        continue;
      }
      const wasOn = (record.oldValue ?? '').split(/\s+/).includes('is-on');
      if (!wasOn) continue;
      el.classList.add('is-off');
      window.clearTimeout(timers.get(el));
      timers.set(el, window.setTimeout(() => settle(el), OUT_MS));
    }
  });
  observer.observe(root, { attributes: true, attributeFilter: ['class'], attributeOldValue: true, subtree: true });
  return () => {
    observer.disconnect();
    timers.forEach((_, el) => settle(el));
  };
}

function FixedSheet({
  w = 1600,
  h = 900,
  frame = true,
  fit: fitMode = 'contain',
  caption,
  itemKey,
  children,
}: FixedSheetProps) {
  const { mode, keys, present, narrow, panelOpen, stageSize, panelWidth, items, active, index, total, dir, step } =
    usePtShell();
  const mat = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  /* the keyed wrapper: the slot last rendered as current, and the one on its
     way out. The leaving slot is derived during the render that changes the
     key (React re-renders before it commits), so the old wrapper is never
     unmounted and remounted; a timer lets it go after the outgoing fade. */
  const last = useRef<Slot | null>(null);
  const [leaving, setLeaving] = useState<Slot | null>(null);
  const leaveTimer = useRef(0);
  if (itemKey !== undefined) {
    const prev = last.current;
    if (prev && prev.key !== itemKey && (!leaving || leaving.key !== prev.key)) setLeaving(prev);
    last.current = { key: itemKey, node: children };
  }

  useGSAP(
    () => {
      window.clearTimeout(leaveTimer.current);
      if (!leaving) return;
      leaveTimer.current = window.setTimeout(() => setLeaving((cur) => (cur === leaving ? null : cur)), OUT_MS);
    },
    { dependencies: [leaving] }
  );

  useMountEffect(() => {
    const root = mat.current;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const unwatch = root && !still && typeof MutationObserver !== 'undefined' ? watchOutgoingSlides(root) : null;
    return () => {
      window.clearTimeout(leaveTimer.current);
      unwatch?.();
    };
  });

  const shown = mode === 'slide';
  const paged = keys === 'paged';
  const pad = present ? SHEET_PAD.present : narrow ? SHEET_PAD.narrow : SHEET_PAD.wide;
  /* the panel width is measured by the shell, so the fit follows --pt-panel-w */
  const side = panelOpen && !narrow ? panelWidth : 0;
  const withCaption = !frame && caption !== false && !present;
  const fit = fitSheet({
    aw: stageSize.width - side,
    ah: stageSize.height - (withCaption ? CAPTION_H : 0),
    w,
    h,
    pad,
    fit: fitMode,
  });

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!shown || !paged) return;
    const target = e.target as Element;
    if (target.closest('a, button, input, textarea, select')) return;
    const box = mat.current?.getBoundingClientRect();
    if (!box) return;
    step(e.clientX > box.left + box.width / 2 ? 1 : -1);
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches.item(0);
    touchX.current = shown && paged && touch ? touch.clientX : null;
  };

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchX.current;
    touchX.current = null;
    const touch = e.changedTouches.item(0);
    if (start === null || !shown || !touch) return;
    const dx = touch.clientX - start;
    if (Math.abs(dx) > SWIPE_PX) step(dx < 0 ? 1 : -1);
  };

  const title = items.find((item) => item.id === active)?.title ?? '';
  const captionNode =
    caption === undefined ? (
      <>
        <span className='pt-sheet-caption-l'>
          {title ? `${title}, live at ${w} pixels wide` : `Live at ${w} pixels wide`}
        </span>
        <span className='pt-sheet-caption-r'>{`${index < 0 ? '–' : pad2(index + 1)} / ${pad2(total)}`}</span>
      </>
    ) : (
      caption
    );

  const body =
    itemKey === undefined ? (
      children
    ) : (
      <>
        {leaving ? (
          <div key={leaving.key} className='pt-slide is-leaving' aria-hidden='true'>
            {leaving.node}
          </div>
        ) : null}
        <div key={itemKey} className='pt-slide'>
          {children}
        </div>
      </>
    );

  return (
    <div
      className={fitMode === 'height' ? 'pt-sheet-stage is-pan' : 'pt-sheet-stage'}
      data-dir={dir ?? 'next'}
      hidden={!shown}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        ref={mat}
        className={present ? 'sheet-mat is-present' : 'sheet-mat'}
        style={{
          left: fit.left - 1,
          top: fit.top - 1,
          width: fit.width + 2,
          height: fit.height + 2,
          visibility: stageSize.width > 0 ? undefined : 'hidden',
        }}
      >
        <div className='sheet'>
          <div className='stage' style={{ width: w, height: h, transform: `scale(${fit.scale})` }}>
            {frame ? <SheetFrame /> : null}
            {body}
          </div>
        </div>
        {paged && !present ? (
          <>
            <span className='pt-sheet-edge is-prev' aria-hidden='true'>
              <Icon name='prev' />
            </span>
            <span className='pt-sheet-edge is-next' aria-hidden='true'>
              <Icon name='next' />
            </span>
          </>
        ) : null}
      </div>
      {withCaption ? (
        <div
          className='pt-sheet-caption'
          style={{ left: fit.left - 1, top: fit.top + fit.height + 5, width: fit.width + 2 }}
        >
          {captionNode}
        </div>
      ) : null}
    </div>
  );
}

function FlowSheet({ width = 1280, scrollRef, children }: FlowSheetProps) {
  return (
    <div ref={scrollRef} className={width === 'rail' ? 'sheet-flow pt-scroll is-rail' : 'sheet-flow pt-scroll'}>
      <div className='sheet-mat'>
        <div className='sheet'>{children}</div>
      </div>
    </div>
  );
}
