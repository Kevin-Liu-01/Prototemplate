import { useId } from 'react';
import type { ReactNode } from 'react';

import { bayerTile } from './bayer';

/**
 * talud-tablero deco: the terrace module, which is the page's layout.
 * Home: every section. A Terrace is one tier of the stepped platform: a
 * framed Tablero (the rectangular content panel with its projecting frame)
 * over a sloped Talud (the battered stone band that carries ornament, the
 * stair, or a load of chips and cells). Tiers stack down the page and each
 * one is one step wider than the one above it, so the page silhouette is a
 * talud-tablero pyramid in elevation. `data-tier` sets the inset; the CSS
 * reads it as `--tt-tier`.
 */

export type TerraceProps = {
  /** Steps of inset from the widest tier (0). The hero is the top tier. */
  tier: number;
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Terrace({ tier, id, className, children }: TerraceProps) {
  return (
    <section id={id} className={className ? `tt-terrace ${className}` : 'tt-terrace'} data-tier={tier}>
      {children}
    </section>
  );
}

export type TableroProps = {
  className?: string;
  /** Frame depth 1 to 3: the number of moldings the frame carries. */
  depth?: 1 | 2 | 3;
  children: ReactNode;
};

/** The framed panel. The frame is the one owner of its rings; the panel inside draws no border. */
export function Tablero({ className, depth = 2, children }: TableroProps) {
  const classes = ['tt-tablero', `is-depth-${depth}`];
  if (className) classes.push(className);
  return (
    <div className={classes.join(' ')}>
      <div className='tt-panel'>{children}</div>
    </div>
  );
}

export type Relief = 'chevron' | 'stone' | 'steps';

export type TaludProps = {
  /** The ornament carved on the slope. Stone is the bare Bayer tier. */
  relief?: Relief;
  /** Draw the central stair with its treads and alfardas. Default true. */
  stair?: boolean;
  className?: string;
  /** Content seated on the slope: chips, cells, a caption. */
  children?: ReactNode;
};

const STONE_CELL = 3;
const CHEVRON = 16;
const STEP = 18;
const STAIR_W = 168;
const TREAD = 9;
const ALFARDA = 7;

/**
 * The sloped band. The trapezoid is a clip-path on the element (CSS); the
 * SVG inside draws the stone as a Bayer tile, the relief as a repeating
 * geometric pattern, and the stair as a strip of treads between two
 * alfardas. A jade tread marker rides the stair; the Descent component
 * steps it down the treads when the band enters view, and at rest it sits
 * on the top tread, fully visible.
 */
export function Talud({ relief = 'stone', stair = true, className, children }: TaludProps) {
  const uid = useId().replace(/:/g, '');
  const stoneId = `${uid}-stone`;
  const reliefId = `${uid}-relief`;
  const treadId = `${uid}-tread`;
  const classes = ['tt-talud', `is-${relief}`];
  if (className) classes.push(className);

  return (
    <div className={classes.join(' ')}>
      <svg className='tt-talud-svg' aria-hidden='true' focusable='false'>
        <defs>
          <pattern id={stoneId} width={STONE_CELL * 4} height={STONE_CELL * 4} patternUnits='userSpaceOnUse'>
            <path d={bayerTile(3, STONE_CELL)} fill='currentColor' />
          </pattern>
          {relief === 'chevron' ? (
            <pattern id={reliefId} width={CHEVRON * 2} height={CHEVRON + 6} patternUnits='userSpaceOnUse'>
              <path
                d={`M0 ${CHEVRON} L${CHEVRON} 2 L${CHEVRON * 2} ${CHEVRON}`}
                fill='none'
                stroke='currentColor'
                strokeWidth={2.5}
                strokeLinejoin='miter'
              />
            </pattern>
          ) : null}
          {relief === 'steps' ? (
            <pattern id={reliefId} width={STEP * 2} height={STEP} patternUnits='userSpaceOnUse'>
              <path
                d={`M0 ${STEP - 2} H${STEP / 2} V${STEP / 2} H${STEP} V2 H${STEP * 1.5} V${STEP / 2} H${STEP * 2}`}
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
              />
            </pattern>
          ) : null}
          <pattern id={treadId} width={STAIR_W} height={TREAD} patternUnits='userSpaceOnUse'>
            <rect width={STAIR_W} height={1.5} fill='currentColor' />
          </pattern>
        </defs>
        <rect className='tt-talud-stone' width='100%' height='100%' fill={`url(#${stoneId})`} />
        {relief !== 'stone' ? (
          <rect className='tt-talud-relief' width='100%' height='100%' fill={`url(#${reliefId})`} />
        ) : null}
        {stair ? (
          <svg x='50%' y='0' width={STAIR_W + ALFARDA * 2} height='100%' overflow='visible' className='tt-stair'>
            <g transform={`translate(${-(STAIR_W / 2 + ALFARDA)} 0)`}>
              <rect className='tt-stair-bed' x={ALFARDA} width={STAIR_W} height='100%' />
              <rect className='tt-stair-treads' x={ALFARDA} width={STAIR_W} height='100%' fill={`url(#${treadId})`} />
              <rect className='tt-alfarda' x={0} width={ALFARDA} height='100%' />
              <rect className='tt-alfarda' x={STAIR_W + ALFARDA} width={ALFARDA} height='100%' />
              <rect className='tt-stair-mark' x={ALFARDA} y={0} width={STAIR_W} height={TREAD - 1} />
            </g>
          </svg>
        ) : null}
      </svg>
      {children ? <div className='tt-talud-load'>{children}</div> : null}
    </div>
  );
}

export default Terrace;
