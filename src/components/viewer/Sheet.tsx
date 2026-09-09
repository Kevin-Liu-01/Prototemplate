'use client';

import type { MouseEvent, ReactNode, Ref, TouchEvent } from 'react';
import { useRef } from 'react';

import { usePtShell } from './shell-context';
import { SheetFrame } from './SheetFrame';

import './Sheet.css';

/** Mirrors --pt-panel-w in tokens.css: what the open index panel takes from the stage. */
export const PANEL_W = 460;

/** The plate left around the sheet: 28px, 12px at or below 900px, 0 in present mode. */
export const SHEET_PAD = { wide: 28, narrow: 12, present: 0 } as const;

/** A touch has to travel this far to count as a swipe. */
const SWIPE_PX = 40;

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
};

/**
 * The fit math from the deck viewer (parts/tail.html, fit()). The w x h
 * stage scales to the space left after the pad and the sheet is centered
 * in it; `left` and `top` place the sheet's border box one pixel out so the
 * border sits around, not over, the scaled content. Pure, so the sheet can
 * compute it in render from the stage size the shell publishes.
 */
export function fitSheet({ aw, ah, w, h, pad }: SheetFitInput): SheetFit {
  const s = Math.max(0.05, Math.min((aw - pad * 2) / w, (ah - pad * 2) / h));
  const width = Math.round(w * s);
  const height = Math.round(h * s);
  return {
    scale: width / w,
    width,
    height,
    left: Math.round((aw - width) / 2) - 1,
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

function FixedSheet({ w = 1600, h = 900, frame = true, children }: FixedSheetProps) {
  const { mode, present, narrow, panelOpen, stageSize, step } = usePtShell();
  const mat = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const shown = mode === 'slide';
  const pad = present ? SHEET_PAD.present : narrow ? SHEET_PAD.narrow : SHEET_PAD.wide;
  const side = panelOpen && !narrow ? PANEL_W : 0;
  const fit = fitSheet({ aw: stageSize.width - side, ah: stageSize.height, w, h, pad });

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!shown) return;
    const target = e.target as Element;
    if (target.closest('a, button, input, textarea, select')) return;
    const box = mat.current?.getBoundingClientRect();
    if (!box) return;
    step(e.clientX > box.left + box.width / 2 ? 1 : -1);
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches.item(0);
    touchX.current = shown && touch ? touch.clientX : null;
  };

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchX.current;
    touchX.current = null;
    const touch = e.changedTouches.item(0);
    if (start === null || !shown || !touch) return;
    const dx = touch.clientX - start;
    if (Math.abs(dx) > SWIPE_PX) step(dx < 0 ? 1 : -1);
  };

  return (
    <div
      className='pt-sheet-stage'
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
            {children}
          </div>
        </div>
      </div>
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
