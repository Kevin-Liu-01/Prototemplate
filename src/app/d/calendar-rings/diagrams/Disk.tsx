'use client';

/**
 * calendar-rings: the disk, a working instrument.
 *
 * Ornament home: the hero, and inverted, the negative ring's floor. A
 * square plate carries the dither field of fields.ts under one SVG overlay
 * and one layer of HTML chips. Every ring reads one real list from data.ts:
 *
 *   hub      the claim, rendered through `children`, inside the accent
 *            circle (the accent's one job: it marks the source)
 *   ring 1   the crown text, the name set along the top of the ring in the
 *            display face
 *   ring 2   the four surfaces, one label per cell on its own arc, the
 *            cells divided by four radial rules that cross the disk
 *   ring 3   the seven usage rates, one bar-and-dot numeral per cell
 *            knocked out of the dither in the ground color; the pricing
 *            section numbers its rows with the same numerals
 *   ring 4   the twenty locales of the outer ring as flag chips, one per
 *            cell, divided by twenty hairline radials; the languages
 *            section unrolls this ring in the same order
 *   rim      twenty notches, one per locale, turning
 *
 * The canvas follows the engine contract: one still under reduced motion,
 * paused offscreen and on hidden tabs, destroyed on unmount, its ink
 * re-read from its own resolved token whenever the theme flips, so the same
 * component renders clay on obsidian inside the negative ring. Nothing here
 * is a figure: rings, notches, cells, rules and counts only.
 */
import { useId, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { createDitherLoop } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

import { NumeralGlyph } from './Numeral';
import { OUTER_RING, SURFACES } from '../data';
import { calendarDisk, DISK, onThemeChange, readToken } from '../fields';
import { Chip } from '../sections/Chip';

/** Half the viewBox: the plate spans -U..U in both axes. */
const U = 500;

const midRadius = (inner: number, outer: number) => Math.round(((inner + outer) / 2) * U);
const CROWN_R = midRadius(DISK.hub, DISK.r1);
const SURFACE_R = midRadius(DISK.r1, DISK.r2);
const RATE_R = midRadius(DISK.r2, DISK.r3);
const LOCALE_RF = (DISK.r3 + DISK.r4) / 2;

const SURFACE_STEP = 360 / DISK.surfaces;
const RATE_STEP = 360 / DISK.rates;
const LOCALE_STEP = 360 / DISK.locales;

/** Two decimals is plenty for path data and keeps float noise out of the markup. */
const fix = (n: number) => n.toFixed(2);
const rad = (deg: number) => (deg * Math.PI) / 180;

/** A point at radius `r` (viewBox units) and angle `deg` (SVG degrees: 0 is right, 90 is down). */
const point = (r: number, deg: number) => `${fix(r * Math.cos(rad(deg)))} ${fix(r * Math.sin(rad(deg)))}`;

/** A radial rule between two radii (fractions) at one angle. */
const radial = (inner: number, outer: number, deg: number) => `M${point(inner * U, deg)}L${point(outer * U, deg)}`;

/**
 * The arc of one cell at radius `r` from `a0` to `a1`, drawn clockwise so
 * text along it stands with its feet toward the center; on the lower half
 * the path is reversed so the text still reads left to right, right side
 * up, the way a label on the bottom of a dial does.
 */
function cellArc(r: number, a0: number, a1: number, lower: boolean): string {
  return lower ? `M${point(r, a1)}A${r} ${r} 0 0 0 ${point(r, a0)}` : `M${point(r, a0)}A${r} ${r} 0 0 1 ${point(r, a1)}`;
}

/** Where a chip sits on the plate, as percentages, for one angle on ring four. */
function chipPosition(deg: number): CSSProperties {
  return {
    left: `${fix(50 + 50 * LOCALE_RF * Math.cos(rad(deg)))}%`,
    top: `${fix(50 + 50 * LOCALE_RF * Math.sin(rad(deg)))}%`,
  };
}

export type DiskProps = {
  crown: string;
  /** `hero` carries the claim in its hub; `floor` is the same instrument sized to be cut by the negative ring's edge. */
  variant?: 'hero' | 'floor';
  children?: ReactNode;
};

export function Disk({ crown, variant = 'hero', children }: DiskProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* the two disks on the page must not share path ids */
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  useMountEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    /* read from the canvas itself: inside the negative ring the token is the swapped one */
    const ink = () => readToken(canvas, '--cr-ink') || 'currentColor';
    const loop = createDitherLoop(canvas, calendarDisk(), {
      scale: 3,
      ink: ink(),
      paper: 'transparent',
      fps: 12,
      reducedMotionTime: 0,
    });
    const release = onThemeChange(() => loop.setOptions({ ink: ink() }));
    return () => {
      release();
      loop.destroy();
    };
  });

  /* ring two: cell boundaries on the cross, so the labels sit in the four quarters */
  const surfaceCells = SURFACES.map((surface, i) => {
    const a0 = 180 + i * SURFACE_STEP;
    const center = a0 + SURFACE_STEP / 2;
    return { surface, a0, a1: a0 + SURFACE_STEP, lower: Math.sin(rad(center)) > 0 };
  });

  /* ring three: the first cell centered at the top */
  const rateCenters = Array.from({ length: DISK.rates }, (_, i) => -90 + i * RATE_STEP);

  /* ring four: the first locale centered at the top, the rest clockwise */
  const localeCenters = OUTER_RING.map((_, i) => -90 + i * LOCALE_STEP);

  return (
    <div className={variant === 'floor' ? 'cr-disk-stage is-floor' : 'cr-disk-stage'}>
      <div className='cr-disk-plate'>
        <canvas className='cr-disk-canvas' ref={canvasRef} aria-hidden='true' />
        <svg className='cr-disk-svg' viewBox={`${-U} ${-U} ${U * 2} ${U * 2}`} aria-hidden='true' focusable='false'>
          <defs>
            <path id={`cr-crown-${uid}`} d={`M${-CROWN_R} 0A${CROWN_R} ${CROWN_R} 0 0 1 ${CROWN_R} 0`} />
            {surfaceCells.map((cell, i) => (
              <path key={cell.surface.id} id={`cr-surface-${uid}-${i}`} d={cellArc(SURFACE_R, cell.a0, cell.a1, cell.lower)} />
            ))}
          </defs>

          {/* the hub circle marks the source: the one place the accent is spent on the disk */}
          <circle className='cr-disk-hub-ring' r={DISK.hub * U} />

          {/* ring rules in the ornament color, each seated on one density step */}
          <circle className='cr-disk-rule' r={DISK.r1 * U} />
          <circle className='cr-disk-rule' r={DISK.r2 * U} />
          <circle className='cr-disk-rule' r={DISK.r3 * U} />
          <circle className='cr-disk-rule' r={DISK.r4 * U} />

          {/* ring two: four radial rules on the cross divide the surfaces */}
          {surfaceCells.map((cell) => (
            <path key={`s${cell.surface.id}`} className='cr-disk-rule' d={radial(DISK.r1, DISK.r2, cell.a0)} />
          ))}

          {/* ring three: seven radial rules between the rate cells */}
          {rateCenters.map((deg, i) => (
            <path key={`r${i}`} className='cr-disk-rule' d={radial(DISK.r2, DISK.r3, deg - RATE_STEP / 2)} />
          ))}

          {/* ring four: twenty hairline radials between the locale cells */}
          {localeCenters.map((deg, i) => (
            <path key={`l${i}`} className='cr-disk-hair' d={radial(DISK.r3, DISK.r4, deg - LOCALE_STEP / 2)} />
          ))}

          {/* ring three: one bar-and-dot numeral per rate cell, knocked out of the dither in the ground color */}
          {rateCenters.map((deg, i) => (
            <g key={`n${i}`} className='cr-disk-numeral' transform={`rotate(${fix(deg + 90)}) translate(0 ${-RATE_R})`}>
              <NumeralGlyph n={i + 1} scale={3.4} />
            </g>
          ))}

          {/* ring two: the surface labels, each along its own cell */}
          {surfaceCells.map((cell, i) => (
            <text key={`t${cell.surface.id}`} className='cr-disk-label' textAnchor='middle'>
              <textPath href={`#cr-surface-${uid}-${i}`} startOffset='50%'>
                {cell.surface.label}
              </textPath>
            </text>
          ))}

          {/* ring one: the crown, the name inscribed along the top of the ring */}
          <text className='cr-crown' textAnchor='middle'>
            <textPath href={`#cr-crown-${uid}`} startOffset='50%'>
              {crown}
            </textPath>
          </text>
        </svg>

        {/* ring four: the twenty locales as chips, one per cell; `en` carries the source ring */}
        <ul className='cr-disk-ring' aria-label='The locales of the outer ring'>
          {OUTER_RING.map((code, i) => (
            <li key={code} className='cr-disk-chip' style={chipPosition(localeCenters[i] ?? -90)}>
              <Chip code={code} source={code === 'en'} />
            </li>
          ))}
        </ul>
      </div>
      {variant === 'hero' ? <div className='cr-disk-hub'>{children}</div> : null}
    </div>
  );
}
