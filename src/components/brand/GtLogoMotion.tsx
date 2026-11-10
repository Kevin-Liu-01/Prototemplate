import { useId } from 'react';

import { GT_LOGO_MOTION as G } from './GtLogoMotion.geometry';

import './GtLogoMotion.css';

/**
 * The General Translation logo, still or in motion, drawn inline with SVG
 * and CSS alone: no video, no canvas and no script per frame.
 *
 * - `static` draws the logo, the same path as LOGO in src/lib/logo.ts.
 * - `hover` draws the logo, and while its host is hovered or keyboard
 *   focused its meridian draws back along its oval over the north pole,
 *   down the left and under the south pole, and the C closes behind it; on
 *   leave the meridian draws out again to the full logo. A leave halfway
 *   runs back from where it is. The host is any link, button or element
 *   marked `data-gt-logo-host` around the mark; hovering the mark itself,
 *   or setting `active`, runs it too.
 * - `loader` plays that draw-back once, then loops: a line runs once round
 *   the meridian, then the G draws off and back on once round the equator,
 *   leaving its tip and landing on it again. The wrapper is a polite live
 *   region and `label` its hidden text.
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
 * The loader animates registered custom properties and the hover the
 * meridian's dashes' own stroke-dasharray and stroke-dashoffset (Safari
 * paints a transitioned custom property's var() at its end value). Both run
 * on the main thread: the loader stalls while the page's main thread is
 * busy, so it is no cover for heavy script work. It needs @property, CSS
 * linear() easing and mix-blend-mode: plus-lighter (Chrome 113, Safari 17.2
 * and Firefox 128 or later).
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
  /** hover mode: hold the hover state, for a host that tracks its own hover */
  active?: boolean;
  className?: string;
};

/** a mask in the logo's 256 unit square */
const SQUARE = { maskUnits: 'userSpaceOnUse', x: '0', y: '0', width: '256', height: '256' } as const;
const line = (width: number) => ({ fill: 'none', strokeWidth: width }) as const;

export default function GtLogoMotion({ mode = 'static', size = 18, label = 'Loading', active = false, className }: GtLogoMotionProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const loader = mode === 'loader';
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
  const less = (...channels: ('under' | 'fill' | 'head')[]) => (loader ? channels.map((c) => lap(c, '#000')) : null);
  /* the ring as the logo draws it; it shows only at the inner edge where a
     line merged into the ring, since no mask reaches further into the ring */
  const ring = <path d={G.ring.d} />;
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
          {loader ? (
            <>
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
              <mask id={id('inside')} {...SQUARE}>
                <rect width='256' height='256' fill='#fff' />
                <circle cx={G.ring.cx} cy={G.ring.cy} r={G.free.core.r} stroke='#000' shapeRendering='crispEdges' {...line(G.free.core.width)} />
              </mask>
            </>
          ) : null}
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
              {loader ? (
                <>
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
                </>
              ) : null}
            </g>
            {loader ? <path className='gt-logo-motion-lap' d={G.meridianLap.d} stroke='currentColor' mask={url('inside')} {...line(G.width)} /> : null}
          </g>
        </g>
      </svg>
    );
  const root = className ? `gt-logo-motion ${className}` : 'gt-logo-motion';
  if (loader) {
    return (
      <span className={root} data-mode='loader' role='status' aria-live='polite'>
        {svg}
        <span className='gt-logo-motion-label'>{label}</span>
      </span>
    );
  }
  return (
    <span className={root} data-mode={mode === 'hover' ? 'hover' : undefined} data-active={mode === 'hover' && active ? '' : undefined}>
      {svg}
    </span>
  );
}
