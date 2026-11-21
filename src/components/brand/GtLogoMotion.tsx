'use client';

import { useCallback, useId } from 'react';

import { GT_LOGO_MOTION as G } from './GtLogoMotion.geometry';

import './GtLogoMotion.css';

/**
 * The General Translation logo, still or in motion, drawn inline with SVG
 * and CSS alone: no video, no canvas and no script per frame.
 *
 * - `static` draws the logo, the same path as LOGO in src/lib/logo.ts.
 * - `loader` loops from the logo to the logo: the meridian draws back
 *   along its oval, over the north pole, down the left and under the south
 *   pole, and a line runs once round it; then the G draws off and back on
 *   once round the equator, leaving its tip and landing on it again, and
 *   the meridian draws on again as it lands. The wrapper is a polite live
 *   region and `label` its hidden text.
 * - `hover` draws the logo, and runs the loader for as long as its host is
 *   hovered or keyboard focused. On leave the loader runs on to its next
 *   rest, where it is the logo, and stops; a leave during the draw-back
 *   runs it back from where it is. The host is the nearest link, button or element marked
 *   `data-gt-logo-host` around the mark, or the mark itself.
 *
 * Whatever is not being drawn or undrawn is the logo itself. The motion
 * layer paints the logo's own path and masks it away only where a line has
 * been undrawn, where it paints what the logo has without that line, so the
 * still parts never move, the weight never changes and the swap between
 * the still and the motion changes no pixel. No mask reaches the ring but
 * next to a line's ink in its hole, 0.8 units or 1.5 CSS pixels away,
 * whichever is more, so the ring is always the logo's own and none of its
 * pixels holds a line's ink; where a line merged into it, the inner edge it
 * leaves comes from the ring drawn alone. The meridian is only drawn and
 * undrawn along its own ellipse, and the draw-back ends on the logo without
 * its meridian. Under reduced motion the hover does nothing and the loader
 * is the still logo with its label. The ink is currentColor, so the
 * parent sets it in both themes.
 *
 * The motion animates registered custom properties on the main thread: the
 * loader stalls while the page's main thread is busy, so it is no cover for
 * heavy script work. It needs @property and mix-blend-mode: plus-lighter
 * (Chrome 113, Safari 17.2 and Firefox 128 or later).
 *
 * To use it in another React app, copy this file, GtLogoMotion.css and
 * GtLogoMotion.geometry.ts into one folder. Its imports are React and its
 * own stylesheet; where an app does not import CSS from components (gt-cloud's
 * packages/ui keeps its styles in packages/ui/src/css), drop the CSS import
 * and import GtLogoMotion.css from the app's global stylesheet instead. Pass
 * a translated `label`. The two other files are written by Prototemplate's
 * pnpm build:logo-motion; when the logo changes, rerun it there and copy
 * them again rather than editing them.
 */
export type GtLogoMotionProps = {
  mode?: 'static' | 'hover' | 'loader';
  /** the drawn box's width and height in CSS pixels */
  size?: number;
  /** the loader's text for assistive technology */
  label?: string;
  className?: string;
};

/** a mask in the logo's 256 unit square */
const SQUARE = { maskUnits: 'userSpaceOnUse', x: '0', y: '0', width: '256', height: '256' } as const;
const line = (width: number) => ({ fill: 'none', strokeWidth: width }) as const;

const T = G.timing;

/** how long a lap at `t` ms runs before it stands at a rest, the logo; 0 inside one */
const toRest = (t: number) => {
  const next = T.rests.find(([, end]) => t <= end);
  return next ? Math.max(0, next[0] - t) : 0;
};

/**
 * The hover: the loader from the host's enter (data-play='loop') until, after
 * its leave, the lap stands at a rest, where the frame is the logo; a leave
 * during the draw-back runs it backward (data-play='settle').
 * --gt-logo-from is where the lap stands when either starts, read from the
 * running animations, so no switch moves a pixel. Returns the cleanup.
 */
function driveHover(root: HTMLElement) {
  const svg = root.firstElementChild as SVGSVGElement;
  const host = root.parentElement?.closest<HTMLElement>('a, button, [data-gt-logo-host]') ?? root;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  let hovered = false;
  let focused = false;
  let timer = 0;
  const progress = (name: string) => {
    const a = svg.getAnimations().find((x) => x instanceof CSSAnimation && x.animationName === name);
    return a?.effect?.getComputedTiming().progress ?? null;
  };
  /** where the lap stands, in ms; in a settle, how far the meridian has drawn back */
  const lapAt = () => {
    if (root.dataset.play === 'settle') return (1 - (progress('gt-logo-meridian-settle') ?? 1)) * T.drawBack;
    return (progress('gt-logo-meridian-lap') ?? 0) * T.lap;
  };
  const play = (state: 'loop' | 'settle' | null, from = 0) => {
    window.clearTimeout(timer);
    root.style.setProperty('--gt-logo-from', `${from}ms`);
    if (state) root.dataset.play = state;
    else delete root.dataset.play;
  };
  const settle = () => {
    const t = lapAt();
    if (t < T.drawBack) return play('settle', t);
    const wait = toRest(t);
    if (wait === 0) return play(null);
    timer = window.setTimeout(settle, wait + 20);
  };
  const sync = () => {
    if (still.matches) return play(null);
    if (hovered || focused) {
      if (root.dataset.play === 'loop') window.clearTimeout(timer);
      else play('loop', root.dataset.play === 'settle' ? lapAt() : 0);
    } else if (root.dataset.play === 'loop') settle();
  };
  const on = (e: Event) => {
    if (e.type === 'pointerenter') hovered = true;
    else if (e.type === 'pointerleave') hovered = false;
    else focused = e.type === 'focusin' && host.matches(':focus-visible');
    sync();
  };
  const end = (e: AnimationEvent) => {
    if (e.animationName === 'gt-logo-meridian-settle') play(null);
  };
  const events = ['pointerenter', 'pointerleave', 'focusin', 'focusout'] as const;
  for (const type of events) host.addEventListener(type, on);
  svg.addEventListener('animationend', end);
  return () => {
    window.clearTimeout(timer);
    for (const type of events) host.removeEventListener(type, on);
    svg.removeEventListener('animationend', end);
  };
}

export default function GtLogoMotion({ mode = 'static', size = 18, label = 'Loading', className }: GtLogoMotionProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const hover = useCallback((el: HTMLSpanElement | null) => (el && mode === 'hover' ? driveHover(el) : undefined), [mode]);
  /* the masks' dashes: the undrawn meridian, in the meridian's zone; on the
     G's lap, the undrawn G, the stem's fill and the head past the tip. Each
     mask is its own dash less the masks before it in the order fill, head,
     under, so the layers partition the frame */
  const meridian = (ink: string) => (
    <path className='gt-logo-motion-meridian' d={G.meridian.d} stroke={ink} mask={url('zone')} {...line(G.meridian.width)} />
  );
  const lap = (channel: 'under' | 'fill' | 'head', ink: string) => (
    <path key={channel} className={`gt-logo-motion-${channel}`} d={G.latitude.d} stroke={ink} {...line(channel === 'fill' ? G.fill.width : G.under.width)} />
  );
  const less = (...channels: ('under' | 'fill' | 'head')[]) => channels.map((c) => lap(c, '#000'));
  /* the ring as the logo draws it; it shows only at the inner edge where a
     line merged into the ring, since no mask reaches further into the ring */
  const ring = <path d={G.ring.d} />;
  /* the logo's meridian where it is drawn, while the G laps under it */
  const meridianInk = <use href={`#${id('logo')}`} mask={url('ink')} />;
  /* where no mask reaches: the ring from just inside its inner edge, less
     every point near a line's ink in the ring's hole (its outline stroked in
     units and again in CSS pixels, so the reach holds at any size), but
     always the ring's outer half. The logo shows there alone, through the
     free mask; every other layer shows through the moving mask, the same
     shapes the other way round, so the two add to one at every point */
  const free = (ink: string, near: string) => (
    <g shapeRendering='crispEdges' strokeLinecap='round' strokeLinejoin='round'>
      <circle cx={G.ring.cx} cy={G.ring.cy} r={G.free.ring.r} stroke={ink} {...line(G.free.ring.width)} />
      <path d={G.free.near.d} stroke={near} {...line(G.free.near.width)} />
      <path d={G.free.near.d} stroke={near} vectorEffect='non-scaling-stroke' {...line(G.free.near.px)} />
      <circle cx={G.ring.cx} cy={G.ring.cy} r={G.free.outer.r} stroke={ink} {...line(G.free.outer.width)} />
    </g>
  );
  const svg =
    mode === 'static' ? (
      <svg viewBox={G.viewBox} width={size} height={size} fill='currentColor' aria-hidden='true' focusable='false'>
        <path fillRule={G.rest.fillRule} d={G.rest.d} />
      </svg>
    ) : (
      <svg viewBox={G.viewBox} width={size} height={size} fill='currentColor' aria-hidden='true' focusable='false'>
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
          <mask id={id('ink')} {...SQUARE}>
            <path d={G.meridianInk.d} stroke='#fff' {...line(G.meridianInk.width)} />
            {meridian('#000')}
          </mask>
          <mask id={id('inside')} {...SQUARE}>
            <rect width='256' height='256' fill='#fff' />
            <circle cx={G.ring.cx} cy={G.ring.cy} r={G.free.core.r} stroke='#000' shapeRendering='crispEdges' {...line(G.free.core.width)} />
          </mask>
        </defs>
        <use href={`#${id('logo')}`} className='gt-logo-motion-rest' />
        <g className='gt-logo-motion-move'>
          <g className='gt-logo-motion-stack'>
            <use href={`#${id('logo')}`} mask={url('free')} />
            <g className='gt-logo-motion-stack gt-logo-motion-add' mask={url('moving')}>
              <use href={`#${id('logo')}`} mask={url('keep')} />
              <g className='gt-logo-motion-add' mask={url('bare')}>
                {ring}
                <path d={G.bar} />
                <path d={G.stem} />
                <path d={G.c} />
              </g>
              <g className='gt-logo-motion-add' mask={url('under')}>
                {ring}
                <path d={G.bar} />
                {meridianInk}
              </g>
              <g className='gt-logo-motion-add' mask={url('head')}>
                {ring}
                <path d={G.bar} />
                <path d={G.latitude.d} stroke='currentColor' {...line(G.width)} />
                {meridianInk}
              </g>
              <g className='gt-logo-motion-add' mask={url('fill')}>
                {ring}
                <path d={G.bar} />
                <path d={G.stem} />
                {meridianInk}
              </g>
            </g>
            <path className='gt-logo-motion-lap' d={G.meridianLap.d} stroke='currentColor' mask={url('inside')} {...line(G.width)} />
          </g>
        </g>
      </svg>
    );
  const root = className ? `gt-logo-motion ${className}` : 'gt-logo-motion';
  if (mode === 'loader') {
    return (
      <span className={root} data-mode='loader' role='status' aria-live='polite'>
        {svg}
        <span className='gt-logo-motion-label'>{label}</span>
      </span>
    );
  }
  return (
    <span ref={hover} className={root} data-mode={mode === 'hover' ? 'hover' : undefined}>
      {svg}
    </span>
  );
}
