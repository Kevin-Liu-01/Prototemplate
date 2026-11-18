'use client';

import { useId, useRef } from 'react';
import type { CSSProperties } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { SPHERE, armillaryFrame, armillaryLap } from './GtLogoArmillary.frame';
import type { ArmillaryChannels, ArmillaryFrame } from './GtLogoArmillary.frame';
import { GT_LOGO_ARMILLARY as A } from './GtLogoArmillary.geometry';
import { GT_LOGO_MOTION as G } from './GtLogoMotion.geometry';
import { subscribeLogoClock, whileVisible } from './logo-clock';

import './GtLogoMotion.css';
import './GtLogoArmillary.css';

/**
 * The logo as an armillary sphere, a loader for a stage of 32 px or more.
 * The ring is the outer ring seen face on, the meridian and the latitude
 * are rings turned about their own axes, and the stem and the bar are those
 * rings seen edge on. Once a lap (3.5 s) the logo rests, then the meridian
 * and the G draw back to the stand (the ring, the bar and the stem) on
 * GtLogoMotion's own loader layers, then both rings grow out of their
 * hinges, turn (the meridian a full turn, the latitude a half turn),
 * passing over and under as the logo's crossings do, and shrink back, and
 * the logo draws on again (GtLogoArmillary.frame.ts).
 *
 * Every seam is the logo, the stand, or a ring 0 long, so no hand-off moves
 * a pixel. Its rest frame is LOGO.d in the logo's own box, so a server
 * render, a page without script, reduced motion and a settled loader all
 * show the still logo, and a host that swaps it for GtMark or GtLogoMotion
 * changes no pixel. It draws with script on one shared clock
 * (logo-clock.ts), writes the channels as custom properties and the rings
 * as four path attributes, and stops out of view. Like GtLogoMotion it runs
 * on the main thread, so it is no cover for heavy script work. Below 32 px
 * use GtLogoMotion's loader, which needs no script.
 */
export type GtLogoArmillaryProps = {
  /** the drawn box's width and height in CSS pixels, 32 to 256 */
  size?: number;
  /** the loader's text for assistive technology */
  label?: string;
  /** false lets the lap settle on the logo, then calls onRest */
  loading?: boolean;
  /** called once the frame is the still logo after `loading` turns false */
  onRest?: () => void;
  /** draws the frame this many seconds into the lap and does not animate */
  at?: number;
  className?: string;
};

/** a mask in the logo's 256 unit square */
const SQUARE = { maskUnits: 'userSpaceOnUse', x: '0', y: '0', width: '256', height: '256' } as const;
const line = (width: number) => ({ fill: 'none', strokeWidth: width }) as const;
const W = SPHERE.weight;
/** a line on top cuts the one underneath by its own width and the logo's gap each side */
const CUT = W + 2 * SPHERE.gap;
const LAP = armillaryLap(A);
const OPEN_AT = A.beats.rest;
const SWING_AT = A.beats.rest + A.beats.open;
const CLOSE_AT = SWING_AT + A.beats.swing;
/** how fast a settling swing runs, so it ends within 0.35 s */
const SETTLE = 0.35;
const EMPTY = 'M0 0';

const px = (n: number) => `${Math.round(n * 1000) / 1000}px`;

/** GtLogoMotion's channel properties for one frame */
function channelStyle(c: ArmillaryChannels): Record<string, string> {
  return {
    '--gt-logo-meridian': px(c.meridian.len),
    '--gt-logo-meridian-at': px(c.meridian.off),
    '--gt-logo-under': px(c.under.len),
    '--gt-logo-under-at': px(c.under.off),
    '--gt-logo-fill': px(c.fill.len),
    '--gt-logo-fill-at': px(c.fill.off),
    '--gt-logo-head': px(c.head.len),
    '--gt-logo-head-at': px(c.head.off),
  };
}

export default function GtLogoArmillary({ size = 56, label = 'Loading', loading = true, onRest, at, className }: GtLogoArmillaryProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const href = (name: string) => `#${id(name)}`;
  const first: ArmillaryFrame = armillaryFrame(A, at ?? 0);

  const rootRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const restRef = useRef<SVGPathElement>(null);
  const moveRef = useRef<SVGGElement>(null);
  const standRef = useRef<SVGGElement>(null);
  const frontRef = useRef<SVGPathElement>(null);
  const backRef = useRef<SVGPathElement>(null);
  const latRef = useRef<SVGPathElement>(null);
  const cutRef = useRef<SVGPathElement>(null);
  const live = useRef({ loading, onRest, rested: !loading, t: 0, last: -1, settling: false, phase: first.phase as ArmillaryFrame['phase'] });

  /* the props the clock reads, kept current without a render per frame */
  useLayoutWork(
    () => {
      const state = live.current;
      state.onRest = onRest;
      state.loading = loading;
      if (loading) {
        state.rested = false;
        state.settling = false;
      }
    },
    { dependencies: [loading, onRest] }
  );

  useMountEffect(() => {
    const root = rootRef.current;
    if (at !== undefined || !root) return;
    const draw = (t: number) => {
      const frame = armillaryFrame(A, t);
      const state = live.current;
      const moving = frame.channels !== null;
      if (frame.channels) {
        const style = channelStyle(frame.channels);
        for (const key in style) svgRef.current?.style.setProperty(key, style[key]);
      }
      const rings = frame.rings;
      frontRef.current?.setAttribute('d', rings?.meridianFront || EMPTY);
      backRef.current?.setAttribute('d', rings?.meridianBack || EMPTY);
      latRef.current?.setAttribute('d', rings?.latitude || EMPTY);
      cutRef.current?.setAttribute('d', rings?.standCut || EMPTY);
      if (frame.phase !== state.phase) {
        state.phase = frame.phase;
        restRef.current?.style.setProperty('visibility', moving ? 'hidden' : 'visible');
        moveRef.current?.style.setProperty('visibility', moving ? 'visible' : 'hidden');
        if (frame.phase === 'swing') standRef.current?.setAttribute('mask', url('stand'));
        else standRef.current?.removeAttribute('mask');
      }
    };
    /* where a settling lap goes next from time t: back to rest from Open, on through a quickened swing into Close, on through Close */
    const settle = (t: number, dt: number) => {
      if (t < OPEN_AT) return 0;
      if (t < SWING_AT) return Math.max(0, t - dt) <= OPEN_AT ? 0 : t - dt;
      if (t < CLOSE_AT) return Math.min(CLOSE_AT, t + dt * Math.max(1, (CLOSE_AT - t) / SETTLE));
      return t + dt >= LAP ? 0 : t + dt;
    };
    const tick = (now: number) => {
      const state = live.current;
      const dt = state.last < 0 ? 0 : Math.min(0.1, now - state.last);
      state.last = now;
      if (state.loading) {
        state.t = (state.t + dt) % LAP;
      } else if (!state.rested) {
        state.t = settle(state.t, dt);
      }
      draw(state.t);
      if (!state.loading && state.t === 0 && !state.rested) {
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
        live.current.t = 0;
        draw(0);
        const state = live.current;
        if (!state.loading && !state.rested) {
          state.rested = true;
          state.onRest?.();
        }
      };
    });
  });

  const moving = first.channels !== null;
  const svgStyle = (first.channels ? channelStyle(first.channels) : {}) as CSSProperties;
  /* GtLogoMotion's loader layers (see GtLogoMotion.tsx): each mask is its own dash less the masks before it in the order fill, head, under, so the layers partition the frame */
  const meridian = (ink: string) => (
    <path className='gt-logo-motion-meridian' d={G.meridian.d} stroke={ink} mask={url('zone')} {...line(G.meridian.width)} />
  );
  const lap = (channel: 'under' | 'fill' | 'head', ink: string) => (
    <path key={channel} className={`gt-logo-motion-${channel}`} d={G.latitude.d} stroke={ink} {...line(channel === 'fill' ? G.fill.width : G.under.width)} />
  );
  const less = (...channels: ('under' | 'fill' | 'head')[]) => channels.map((c) => lap(c, '#000'));
  const ring = <path d={G.ring.d} />;
  const free = (ink: string, near: string) => (
    <g shapeRendering='crispEdges' strokeLinecap='round' strokeLinejoin='round'>
      <circle cx={G.ring.cx} cy={G.ring.cy} r={G.free.ring.r} stroke={ink} {...line(G.free.ring.width)} />
      <path d={G.free.near.d} stroke={near} {...line(G.free.near.width)} />
      <path d={G.free.near.d} stroke={near} vectorEffect='non-scaling-stroke' {...line(G.free.near.px)} />
      <circle cx={G.ring.cx} cy={G.ring.cy} r={G.free.outer.r} stroke={ink} {...line(G.free.outer.width)} />
    </g>
  );
  const rings = first.rings;
  const root = className ? `gt-logo-motion gt-logo-armillary ${className}` : 'gt-logo-motion gt-logo-armillary';
  return (
    <span ref={rootRef} className={root} role='status' aria-live='polite'>
      <svg ref={svgRef} viewBox={G.viewBox} width={size} height={size} fill='currentColor' aria-hidden='true' focusable='false' style={svgStyle}>
        <defs>
          <path id={id('logo')} fillRule={G.rest.fillRule} d={G.rest.d} />
          <mask id={id('free')} {...SQUARE}>
            {free('#fff', '#000')}
          </mask>
          <mask id={id('moving')} {...SQUARE}>
            <rect width='256' height='256' fill='#fff' />
            {free('#000', '#fff')}
          </mask>
          <mask id={id('zone')} {...SQUARE}>
            <path d={G.zone.band.d} stroke='#fff' {...line(G.zone.band.width)} />
            <path d={G.zone.breaks.d} stroke='#fff' {...line(G.zone.breaks.width)} />
            <path d={G.zone.near.d} stroke='#fff' vectorEffect='non-scaling-stroke' strokeLinecap='round' strokeLinejoin='round' {...line(G.zone.near.px)} />
            <path d={G.zone.ends.d} stroke='#000' {...line(G.zone.ends.width)} />
          </mask>
          <mask id={id('keep')} {...SQUARE}>
            <rect width='256' height='256' fill='#fff' />
            {meridian('#000')}
            {less('under', 'head', 'fill')}
          </mask>
          <mask id={id('bare')} {...SQUARE}>
            {meridian('#fff')}
            {less('under', 'head', 'fill')}
          </mask>
          <mask id={id('under')} {...SQUARE}>
            {lap('under', '#fff')}
            {less('head', 'fill')}
          </mask>
          <mask id={id('head')} {...SQUARE}>
            {lap('head', '#fff')}
            {less('fill')}
          </mask>
          <mask id={id('fill')} {...SQUARE}>
            {lap('fill', '#fff')}
          </mask>
          <path ref={frontRef} id={id('front')} d={rings?.meridianFront || EMPTY} />
          <path ref={backRef} id={id('back')} d={rings?.meridianBack || EMPTY} />
          <path ref={latRef} id={id('lat')} d={rings?.latitude || EMPTY} />
          <path ref={cutRef} id={id('cut')} d={rings?.standCut || EMPTY} />
          {/* the stand passes under the latitude and the meridian's near half; the outer ring is never cut */}
          <mask id={id('stand')} {...SQUARE}>
            <rect width='256' height='256' fill='#fff' />
            <use href={href('cut')} fill='none' stroke='#000' strokeWidth={CUT} />
            <circle cx={G.ring.cx} cy={G.ring.cy} r={SPHERE.ring} fill='none' stroke='#fff' strokeWidth={W} />
          </mask>
          {/* the meridian's far half: under everything */}
          <mask id={id('far')} {...SQUARE}>
            <rect width='256' height='256' fill='#fff' />
            <use href={href('lat')} fill='none' stroke='#000' strokeWidth={CUT} />
            <use href={href('front')} fill='none' stroke='#000' strokeWidth={CUT} />
            <path d={G.bar} fill='#000' stroke='#000' strokeWidth={2 * SPHERE.gap} />
            <path d={G.stem} fill='#000' stroke='#000' strokeWidth={2 * SPHERE.gap} />
          </mask>
          {/* the latitude: under the meridian's near half */}
          <mask id={id('beneath')} {...SQUARE}>
            <rect width='256' height='256' fill='#fff' />
            <use href={href('front')} fill='none' stroke='#000' strokeWidth={CUT} />
          </mask>
        </defs>
        <path ref={restRef} className='gt-logo-armillary-rest' fillRule={G.rest.fillRule} d={G.rest.d} style={{ visibility: moving ? 'hidden' : 'visible' }} />
        <g ref={moveRef} className='gt-logo-motion-move gt-logo-armillary-move' style={{ visibility: moving ? 'visible' : 'hidden' }}>
          <g ref={standRef} mask={first.phase === 'swing' ? url('stand') : undefined}>
            <g className='gt-logo-motion-stack'>
              <use href={href('logo')} mask={url('free')} />
              <g className='gt-logo-motion-stack gt-logo-motion-add' mask={url('moving')}>
                <use href={href('logo')} mask={url('keep')} />
                <g className='gt-logo-motion-add' mask={url('bare')}>
                  {ring}
                  <path d={G.bar} />
                  <path d={G.stem} />
                  <path d={G.c} />
                </g>
                <g className='gt-logo-motion-add' mask={url('under')}>
                  {ring}
                  <path d={G.bar} />
                </g>
                <g className='gt-logo-motion-add' mask={url('head')}>
                  {ring}
                  <path d={G.bar} />
                  <path d={G.latitude.d} stroke='currentColor' {...line(G.width)} />
                </g>
                <g className='gt-logo-motion-add' mask={url('fill')}>
                  {ring}
                  <path d={G.bar} />
                  <path d={G.stem} />
                </g>
              </g>
            </g>
          </g>
          <use href={href('back')} mask={url('far')} fill='none' stroke='currentColor' strokeWidth={W} />
          <use href={href('lat')} mask={url('beneath')} fill='none' stroke='currentColor' strokeWidth={W} />
          <use href={href('front')} fill='none' stroke='currentColor' strokeWidth={W} />
        </g>
      </svg>
      <span className='gt-logo-motion-label'>{label}</span>
    </span>
  );
}
