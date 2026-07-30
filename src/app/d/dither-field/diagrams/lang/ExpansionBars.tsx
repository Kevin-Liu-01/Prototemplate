'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import { langA11y, langClass, prefersReducedMotion, type LangProps } from './lang';
import './lang.css';

gsap.registerPlugin(useGSAP);

/**
 * Text expansion as a diverging chart: the axis is English, bars run right
 * where a locale needs more room and left where it needs less.
 *
 * The bars are laid out in CSS, not by the animation, so the chart is whole
 * before a single frame runs — the loop only walks a quiet reading marker down
 * the rows. Nothing about the data depends on motion.
 *
 * Accent: German, permanently. It used to follow the marker, which meant a still
 * of this diagram accented whichever row the shutter happened to catch — one
 * screenshot lit Korean with a tint and an accent bar, implying Korean was the
 * significant case when the copy beside it argues German's +35%. The one colour
 * on the page does not get to mean something different in every frame, so it is
 * nailed to the worst case and the travelling marker is plain ink.
 */

type Row = { name: string; tag: string; pct: number };

const ROWS: readonly Row[] = [
  { name: 'German', tag: 'de', pct: 35 },
  { name: 'Spanish', tag: 'es', pct: 22 },
  { name: 'French', tag: 'fr', pct: 20 },
  { name: 'Russian', tag: 'ru', pct: 18 },
  { name: 'English', tag: 'en', pct: 0 },
  { name: 'Korean', tag: 'ko', pct: -12 },
  { name: 'Japanese', tag: 'ja', pct: -38 },
  { name: 'Chinese', tag: 'zh', pct: -45 },
];

/** Full deflection either side of the axis. */
const SCALE = 45;
const ROW_H = 27;
const DWELL = 1.5;
/** The one row that carries the accent, in every frame: German, +35%. */
const ACCENT_ROW = 0;
/** Reduced motion rests the marker on the same row. */
const FROZEN = 0;

function format(pct: number): string {
  if (pct === 0) return 'baseline';
  return `${pct > 0 ? '+' : '−'}${Math.abs(pct)}%`;
}

type BarStyle = { transform: string };

export default function ExpansionBars({ className, accent = true, title }: LangProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const marker = rootEl.querySelector<HTMLElement>('[data-eb-marker]');
      if (!marker) return;

      const settle = (i: number) => {
        gsap.set(marker, { y: i * ROW_H, autoAlpha: 1 });
      };

      if (prefersReducedMotion()) {
        settle(FROZEN);
        return;
      }

      settle(0);
      const tl = gsap.timeline({ repeat: -1 });

      for (let k = 1; k <= ROWS.length; k++) {
        const i = k % ROWS.length;
        tl.to(marker, { y: i * ROW_H, duration: 0.6, ease: 'power2.inOut' }, k * DWELL);
      }

      tl.duration(ROWS.length * DWELL);
    },
    { scope: root },
  );

  return (
    <div className={langClass('lang-eb', accent, className)} ref={root} {...langA11y(title)}>
      <div className='lang-eb-rows'>
        <i className='lang-eb-marker' data-eb-marker='' />

        {ROWS.map((row, i) => {
          const span = Math.abs(row.pct) / SCALE;
          const style: BarStyle = { transform: `scaleX(${span})` };
          const lit = i === ACCENT_ROW;
          const rowClass = ['lang-eb-row', row.pct === 0 ? 'is-axis' : '', lit ? 'is-lit' : '']
            .filter(Boolean)
            .join(' ');
          return (
            <div className={rowClass} key={row.tag}>
              <span className='lang-eb-name'>
                <span className='lang-tag'>{row.tag}</span>
                {row.name}
              </span>

              <span className='lang-eb-track'>
                <span className={row.pct < 0 ? 'lang-eb-half is-left' : 'lang-eb-half is-right'}>
                  <i className='lang-eb-bar' style={style} />
                </span>
              </span>

              <span className={row.pct === 0 ? 'lang-eb-value is-base' : 'lang-eb-value'}>{format(row.pct)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
