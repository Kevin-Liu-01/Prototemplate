'use client';

import { useId, useRef } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { ARMILLARY_BEATS, ARMILLARY_REST_LINES, SPHERE, armillaryAt } from './GtLogoArmillary.frame';
import { GT_LOGO_MOTION as G } from './GtLogoMotion.geometry';
import { subscribeLogoClock, whileVisible } from './logo-clock';

import './GtLogoArmillary.css';

/**
 * The logo as an armillary sphere, a loader for a stage of 32 px or more.
 * The ring is the outer ring seen face on, the meridian and the latitude
 * are rings turned about their own axes, and the stem and the bar are those
 * rings seen edge on. Once a lap the logo rests for a second, then both
 * rings turn once, the meridian about the polar axis and the latitude the
 * other way about the node axis, passing over and under as the logo's own
 * crossings do, and land on the logo again (GtLogoArmillary.frame.ts).
 *
 * Its rest frame is LOGO.d in the logo's own box, so a server render, a page
 * without script, reduced motion and a settled loader all show the still
 * logo, and a host that swaps it for GtMark or GtLogoMotion changes no
 * pixel. It draws with script on one shared clock (logo-clock.ts), writes
 * four path attributes a frame and stops out of view. Below 32 px use
 * GtLogoMotion's loader, which needs no script.
 */
export type GtLogoArmillaryProps = {
  /** the drawn box's width and height in CSS pixels, 32 to 256 */
  size?: number;
  /** the loader's text for assistive technology */
  label?: string;
  /** false lets the lap finish on the logo, then calls onRest */
  loading?: boolean;
  /** called once the frame is the still logo after `loading` turns false */
  onRest?: () => void;
  /** draws the frame this many seconds into the lap and does not animate */
  at?: number;
  className?: string;
};

/** a mask in the logo's 256 unit square */
const SQUARE = { maskUnits: 'userSpaceOnUse', x: '0', y: '0', width: '256', height: '256' } as const;
const W = SPHERE.weight;
const CUT = W + 2 * SPHERE.gap;
/** the band round the logo's own meridian and latitude that the stand clears: the lines and the gaps they leave, with a unit to spare */
const BAND = CUT + 2;
/** the longest a settle takes once `loading` turns false mid-swing, in seconds */
const SETTLE = 0.6;

/** Swing progress `t` seconds into a lap. */
function progressAt(t: number): number {
  const lap = ARMILLARY_BEATS.rest + ARMILLARY_BEATS.swing;
  const s = ((t % lap) + lap) % lap;
  return s <= ARMILLARY_BEATS.rest ? 0 : (s - ARMILLARY_BEATS.rest) / ARMILLARY_BEATS.swing;
}

export default function GtLogoArmillary({ size = 56, label = 'Loading', loading = true, onRest, at, className }: GtLogoArmillaryProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const href = (name: string) => `#${id(name)}`;
  const first = armillaryAt(at === undefined ? 0 : progressAt(at));

  const rootRef = useRef<HTMLSpanElement>(null);
  const restRef = useRef<SVGPathElement>(null);
  const swingRef = useRef<SVGGElement>(null);
  const frontRef = useRef<SVGPathElement>(null);
  const backRef = useRef<SVGPathElement>(null);
  const latRef = useRef<SVGPathElement>(null);
  const cutRef = useRef<SVGPathElement>(null);
  const live = useRef({ loading, onRest, rested: !loading, u: 0, rest: 0, last: -1, settle: 0, moving: first.moving });

  /* the props the clock reads, kept current without a render per frame */
  useLayoutWork(
    () => {
      const state = live.current;
      state.onRest = onRest;
      if (state.loading && !loading && state.u > 0) state.settle = Math.max(1 / ARMILLARY_BEATS.swing, (1 - state.u) / SETTLE);
      state.loading = loading;
      if (loading) state.rested = false;
    },
    { dependencies: [loading, onRest] }
  );

  useMountEffect(() => {
    const root = rootRef.current;
    if (at !== undefined || !root) return;
    const draw = (u: number) => {
      const frame = armillaryAt(u);
      const state = live.current;
      if (frame.moving) {
        frontRef.current?.setAttribute('d', frame.meridianFront || 'M0 0');
        backRef.current?.setAttribute('d', frame.meridianBack || 'M0 0');
        latRef.current?.setAttribute('d', frame.latitude || 'M0 0');
        cutRef.current?.setAttribute('d', frame.standCut || 'M0 0');
      }
      if (frame.moving !== state.moving) {
        state.moving = frame.moving;
        restRef.current?.setAttribute('visibility', frame.moving ? 'hidden' : 'visible');
        swingRef.current?.setAttribute('visibility', frame.moving ? 'visible' : 'hidden');
      }
    };
    const tick = (now: number) => {
      const state = live.current;
      const dt = state.last < 0 ? 0 : Math.min(0.1, now - state.last);
      state.last = now;
      if (state.u > 0) {
        const rate = state.loading ? 1 / ARMILLARY_BEATS.swing : Math.max(1 / ARMILLARY_BEATS.swing, state.settle);
        state.u += dt * rate;
        if (state.u >= 1) {
          state.u = 0;
          state.rest = 0;
        }
      } else if (state.loading) {
        state.rest += dt;
        if (state.rest >= ARMILLARY_BEATS.rest) state.u = Math.min(1e-6 + (state.rest - ARMILLARY_BEATS.rest) / ARMILLARY_BEATS.swing, 0.999);
      }
      draw(state.u);
      if (!state.loading && state.u === 0 && !state.rested) {
        state.rested = true;
        state.onRest?.();
      }
    };
    return whileVisible(root, () => {
      live.current.last = -1;
      const stop = subscribeLogoClock(tick);
      return () => {
        stop();
        /* out of view or reduced: back to the still logo, which the next lap starts from */
        live.current.u = 0;
        live.current.rest = 0;
        draw(0);
        const state = live.current;
        if (!state.loading && !state.rested) {
          state.rested = true;
          state.onRest?.();
        }
      };
    });
  });

  const root = className ? `gt-logo-armillary ${className}` : 'gt-logo-armillary';
  return (
    <span ref={rootRef} className={root} role='status' aria-live='polite'>
      <svg viewBox={G.viewBox} width={size} height={size} fill='currentColor' aria-hidden='true' focusable='false'>
        <defs>
          <path ref={frontRef} id={id('front')} d={first.meridianFront || 'M0 0'} />
          <path ref={backRef} id={id('back')} d={first.meridianBack || 'M0 0'} />
          <path ref={latRef} id={id('lat')} d={first.latitude || 'M0 0'} />
          <path ref={cutRef} id={id('cut')} d={first.standCut || 'M0 0'} />
          {/* the stand: the still logo away from its meridian and latitude, the bar and the stem whole inside them */}
          <mask id={id('logo')} {...SQUARE}>
            <rect width='256' height='256' fill='white' />
            <path d={ARMILLARY_REST_LINES} fill='none' stroke='black' strokeWidth={BAND} strokeLinecap='round' />
          </mask>
          <mask id={id('lines')} {...SQUARE}>
            {/* a unit wider than the band the still logo leaves, so the two overlap and no seam shows between them */}
            <path d={ARMILLARY_REST_LINES} fill='none' stroke='white' strokeWidth={BAND + 2} strokeLinecap='round' />
          </mask>
          {/* the stand passes under the latitude and the meridian's near half */}
          <mask id={id('stand')} {...SQUARE}>
            <rect width='256' height='256' fill='white' />
            <use href={href('cut')} fill='none' stroke='black' strokeWidth={CUT} />
          </mask>
          {/* the meridian's far half: under everything */}
          <mask id={id('far')} {...SQUARE}>
            <rect width='256' height='256' fill='white' />
            <use href={href('lat')} fill='none' stroke='black' strokeWidth={CUT} />
            <path d={G.bar} fill='black' stroke='black' strokeWidth={2 * SPHERE.gap} />
            <path d={G.stem} fill='black' stroke='black' strokeWidth={2 * SPHERE.gap} />
          </mask>
          {/* the latitude: under the meridian's near half */}
          <mask id={id('under')} {...SQUARE}>
            <rect width='256' height='256' fill='white' />
            <use href={href('front')} fill='none' stroke='black' strokeWidth={CUT} />
          </mask>
        </defs>
        <path ref={restRef} className='gt-logo-armillary-rest' fillRule={G.rest.fillRule} d={G.rest.d} visibility={first.moving ? 'hidden' : 'visible'} />
        <g ref={swingRef} className='gt-logo-armillary-swing' visibility={first.moving ? 'visible' : 'hidden'}>
          <g mask={url('stand')}>
            <path fillRule={G.rest.fillRule} d={G.rest.d} mask={url('logo')} />
            <g mask={url('lines')}>
              <path d={G.bar} />
              <path d={G.stem} />
            </g>
          </g>
          <use href={href('back')} mask={url('far')} fill='none' stroke='currentColor' strokeWidth={W} />
          <use href={href('lat')} mask={url('under')} fill='none' stroke='currentColor' strokeWidth={W} />
          <use href={href('front')} fill='none' stroke='currentColor' strokeWidth={W} />
          <path d={G.ring.d} />
        </g>
      </svg>
      <span className='gt-logo-armillary-label'>{label}</span>
    </span>
  );
}
