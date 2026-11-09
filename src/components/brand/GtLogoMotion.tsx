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
 *   the meridian, then the G draws off and back on once round the equator.
 *   The wrapper is a polite live region and `label` its hidden text.
 *
 * Every mode rests on the logo's own path, so the still is the logo pixel
 * for pixel. The timing and the eases are the published videos', but the
 * weight is not: the videos ease the weight from the logo's 13.6 units to
 * the state mark's 14.4 over the draw-back, and this component keeps the
 * logo's 13.6 throughout, so its hover end and its loop are a little
 * lighter than the state file. Under reduced motion the hover does nothing
 * and the loader is the still logo with its label. The ink is
 * currentColor, so the parent sets it in both themes.
 *
 * The loader animates registered custom properties and the hover each
 * dash's own stroke-dasharray and stroke-dashoffset (Safari paints a
 * transitioned custom property's var() at its end value). Both run on the
 * main thread: the loader stalls while the page's main thread is busy, so
 * it is no cover for heavy script work. It needs @property and CSS linear()
 * easing (Chrome 113, Safari 17.2 and Firefox 128 or later).
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

/* the latitude's lap and the next one: GtLogoMotion.css draws the part of
   the G's dash that runs past the end of the lap on the second copy */
const LAPS = ['this', 'next'] as const;

export default function GtLogoMotion({ mode = 'static', size = 18, label = 'Loading', active = false, className }: GtLogoMotionProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const ids = { stem: `${uid}-stem`, breaks: `${uid}-breaks`, back: `${uid}-back`, clip: `${uid}-clip` };
  const rest = <path className='gt-logo-motion-rest' fillRule={G.rest.fillRule} d={G.rest.d} />;
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: G.latitude.width } as const;
  const svg = (
    <svg viewBox={G.viewBox} width={size} height={size} fill='currentColor' aria-hidden='true' focusable='false'>
      {rest}
      {mode === 'static' ? null : (
        <>
          <defs>
            <clipPath id={ids.clip}>
              <path clipRule='evenodd' d={G.breaks.clip} />
            </clipPath>
            <mask id={ids.stem} maskUnits='userSpaceOnUse' x='0' y='0' width='256' height='256'>
              <rect width='256' height='256' fill='#fff' />
              {LAPS.map((lap) => (
                <path
                  key={lap}
                  className='gt-logo-motion-stem-cut'
                  data-lap={lap}
                  d={G.latitude.d}
                  pathLength={G.latitude.length}
                  fill='none'
                  stroke='#000'
                  strokeWidth={G.stemCut.width}
                />
              ))}
            </mask>
            <mask id={ids.breaks} maskUnits='userSpaceOnUse' x='0' y='0' width='256' height='256'>
              <rect width='256' height='256' fill='#fff' />
              <path
                className='gt-logo-motion-breaks'
                d={G.meridian.d}
                pathLength={G.meridian.length}
                fill='none'
                stroke='#000'
                strokeWidth={G.breaks.width}
                clipPath={`url(#${ids.clip})`}
              />
            </mask>
            <mask id={ids.back} maskUnits='userSpaceOnUse' x='0' y='0' width='256' height='256'>
              <rect width='256' height='256' fill='#fff' />
              {G.backCuts.map((cut) => (
                <path key={cut.d} d={cut.d} fill='none' stroke='#000' strokeWidth={cut.width} />
              ))}
            </mask>
          </defs>
          <g className='gt-logo-motion-move'>
            <circle cx={G.ring.cx} cy={G.ring.cy} r={G.ring.r} fill='none' stroke='currentColor' strokeWidth={G.ring.width} />
            <path d={G.bar} />
            <path d={G.fillets} />
            <path d={G.stem} mask={`url(#${ids.stem})`} />
            {LAPS.map((lap) => (
              <path
                key={lap}
                className='gt-logo-motion-latitude'
                data-lap={lap}
                d={G.latitude.d}
                pathLength={G.latitude.length}
                mask={`url(#${ids.breaks})`}
                {...stroke}
              />
            ))}
            <path className='gt-logo-motion-meridian' d={G.meridian.d} pathLength={G.meridian.length} mask={`url(#${ids.back})`} {...stroke} />
            <path className='gt-logo-motion-lap' d={G.meridianLap.d} pathLength={G.meridianLap.length} {...stroke} />
          </g>
        </>
      )}
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
    <span className={root} data-mode={mode === 'hover' ? 'hover' : undefined} data-active={mode === 'hover' && active ? '' : undefined}>
      {svg}
    </span>
  );
}
